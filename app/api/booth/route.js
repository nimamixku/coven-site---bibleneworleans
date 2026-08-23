import { NextResponse } from "next/server";
import { query } from "../../../lib/db";
import { isOwnerRequest, hashIp } from "../../../lib/ownerAuth";

export const runtime = "nodejs";

const MAX_INPUT_LEN = 500;

// Real Claude answers cost real money (your Anthropic prepaid credit
// balance), so ONLY the keeper (signed in) can trigger the booth for now
// — enforced here, server-side, not just hidden in the UI. To open this
// to visitors later, change the `if (!owner)` check below to whatever
// rate-limit you want instead (e.g. a daily total across all IPs, and/or
// a per-IP cooldown) — nothing else about this route needs to change.
const MAX_TOTAL_PER_DAY = Number(process.env.MAX_DAILY_BOOTH_ASKS || 100);

// Real writing pulled from bibleneworleans.com (the covenant,
// testing-the-matrix, glossary, covenisms) plus this site's own prayers
// and COVEN TALK lines — the booth's only grounding for voice and
// philosophy. Nothing here is invented; it's quoted straight from
// Abra's own published pages so the generated answers stay recognizably
// hers rather than drifting into generic "spiritual AI" language.
const VOICE_GROUNDING = `
RULES (COVENISMS):
0 — there is NO COVEN. there are NO rules.
1 — be someone no one can offend.
2 — you are god. not your avatar.
3 — your brain is dumb. stop listening to it.
4 — inner reality creates outer reality.
5 — there are no mystakes. everything is in your favor.
6 — you don't have to be "good"...

FROM THE COVENANT:
you are the empty placeholder, the origin point. you are dreaming.
a reflexive, holographic multiverse within an infinite fractal system.
your brain cannot see the future. only a predictive past.
you are reborn every moment within spacetime.
time and space don't actually exist. they are constructs.
there are infinite realities, and infinite versions of you.

FROM TESTING THE MATRIX:
your brain is a computer screen. you are typing. you are the writer. you have all creative control.
you can change the script at any time. this is reality.
your lens is only your lens. two avatars could experience the exact same event in radically different ways. neither is right or wrong. you choose how you see, interpret, and react to your physical reality.
your assumptions are always correct because you create reality. if you believe your assumption proves anything beyond your own making, you are mistaken.
you will feel sad if your life narration is sad. when you are thinking, you are literally talking to yourself. you can change the voice(s).

FROM THE GLOSSARY:
Higher Mind — the kingdom of god. reality is experienced in your mind. it is where creation happens.
I AM — your essence, your being, your true guide. it is gentle and would never say unkind or hurtful things.
Ego — your identity, earth-form, physical body and character. it can take on many forms and personalities.
Avatar — your physical form on earth. it can be intentionally transformed through consciousness or physical means.
Reflection — your world is a hall of mirrors. other people are reflections of you. reality is a reflexive, holographic projection.

FROM COVENISMS:
say this to your reflections when they create or have created: it is a reminder to you and them, that they have the power to shape their own reality.
the placebo is the belief that reinforces the bias. it is confirmation bias on loop. it's not physicality fixing or manipulating physicality — it's the nonphysical agreeing to the mode (your avatar believing the method).
your WORDS cast spells. your IMAGINATION is the most powerful tool you have.
your brain is an organ. it does an extraordinary job, at its job. it is not meant to tell you what to do. do not volunteer it freely.
everything is placebo until you hit god mode.
the coven doesn't exist. neither do numbers, words, languages.
your brain listens to YOU, not vice versa.
so mote it be.

CLOSING LINE USED THROUGHOUT: "BIBLE means BOOK."
`.trim();

// This is the one hard boundary that never bends, regardless of how the
// rest of the booth's voice is tuned: if someone's question reads as
// real crisis (self-harm, suicidal ideation, abuse, acute danger), the
// booth does NOT stay fully in the manifestation-philosophy bit. Telling
// someone in real danger "your brain is dumb, ignore it, everything is
// already in your favor" would be actively harmful advice dressed up in
// the site's own voice. So the system prompt instructs a plain, warm,
// out-of-character acknowledgment instead, pointing toward real human
// support — still gentle, never clinical or cold, just honest that this
// booth can't be that for someone in that moment.
function buildSystemPrompt() {
  return `You are "the booth" — a small text oracle on a personal art/philosophy site called COVEN of New Orleans (part of the larger "Bible New Orleans" project). Visitors type a question, a thought, or a feeling, and you answer in the site's own established voice and philosophy, quoting or closely paraphrasing its actual ideas below — never inventing new doctrine, just applying what's already there to whatever the person brought.

VOICE: lowercase, aphoristic, short declarative lines. Confident, warm, a little wry, never clinical. Speaks to "you"/"your avatar" directly. Draws on ideas like: you are god, not your avatar; your brain is dumb, stop listening to it; inner reality creates outer reality; there are no mistakes, everything is in your favor; the ego vs. the I AM vs. higher mind; reflections (other people mirror you); placebo as confirmation bias; your words cast spells. Can close with "so mote it be" when it fits, but don't force it every time.

REAL SOURCE MATERIAL (the ONLY grounding for the voice and ideas — do not invent beliefs not implied by this):
${VOICE_GROUNDING}

LENGTH: keep answers to 2-5 short lines. This is an oracle booth, not an essay.

HARD SAFETY BOUNDARY — this overrides everything above: if the question describes real self-harm, suicidal thoughts, abuse, or a genuine crisis, do NOT answer in the manifestation-philosophy voice — don't tell someone in real danger that their brain is "wrong" or that everything is "already in their favor." Instead, drop the bit entirely and respond plainly and warmly: acknowledge what they shared, say this booth isn't equipped to help with that, and gently point them toward reaching out to a real person or a crisis line. Keep it short and human, not clinical.

Reply with strict JSON only, no prose, no markdown fences, in exactly this shape:
{"answer": string, "brokeCharacter": boolean}
"brokeCharacter" is true only when you used the safety-boundary response instead of the normal in-voice answer.`;
}

async function askBooth(text) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      answer:
        "the booth isn't wired up yet — set ANTHROPIC_API_KEY (see SETUP_BOOTH.md) to bring it to life.",
      brokeCharacter: false,
      costUsd: null,
    };
  }

  const model = process.env.ANTHROPIC_BOOTH_MODEL || "claude-haiku-4-5-20251001";

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 300,
      system: buildSystemPrompt(),
      messages: [{ role: "user", content: text }],
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    console.error("Anthropic API error", resp.status, errText);
    return {
      answer: "the booth couldn't be reached just now — try again in a bit.",
      brokeCharacter: false,
      costUsd: null,
    };
  }

  const data = await resp.json();
  const raw = data?.content?.[0]?.text || "{}";
  const parsed = parseBoothJson(raw);

  // The real dollar cost of THIS reading — not a joke nickel. Rates are
  // Claude Haiku 4.5's actual published pricing (docs.claude.com/about-
  // claude/pricing as of this writing): $1/MTok input, $5/MTok output.
  // If that pricing ever changes, update HAIKU_INPUT_PER_MTOK /
  // HAIKU_OUTPUT_PER_MTOK below to match.
  const usage = data?.usage || {};
  const inputTokens = usage.input_tokens || 0;
  const outputTokens = usage.output_tokens || 0;
  const costUsd =
    (inputTokens / 1_000_000) * HAIKU_INPUT_PER_MTOK +
    (outputTokens / 1_000_000) * HAIKU_OUTPUT_PER_MTOK;

  return { ...parsed, costUsd };
}

const HAIKU_INPUT_PER_MTOK = 1.0;
const HAIKU_OUTPUT_PER_MTOK = 5.0;

// Same defensive parsing as the kaqchikel guesser — the model is told to
// reply with strict JSON, but real-world replies sometimes come wrapped
// in a code fence or a stray sentence. Strip common wrapping rather than
// failing the whole answer over that.
function parseBoothJson(raw) {
  const attempts = [raw];

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) attempts.push(fenced[1]);

  const braceMatch = raw.match(/\{[\s\S]*\}/);
  if (braceMatch) attempts.push(braceMatch[0]);

  for (const candidate of attempts) {
    try {
      const parsed = JSON.parse(candidate.trim());
      if (parsed && typeof parsed.answer === "string") {
        return { answer: parsed.answer, brokeCharacter: !!parsed.brokeCharacter };
      }
    } catch {
      // try the next candidate
    }
  }

  console.error("Could not parse booth JSON:", raw);
  return {
    answer: "the booth's answer didn't come through clean that time — try asking again.",
    brokeCharacter: false,
  };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const text = (body?.question || "").toString().trim().slice(0, MAX_INPUT_LEN);
    if (!text) {
      return NextResponse.json(
        { error: "Type a question, thought, or feeling first." },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const ipHash = hashIp(ip);
    const owner = isOwnerRequest(req);

    // Owner-only for now — see the comment on MAX_TOTAL_PER_DAY above for
    // how to open this to visitors later.
    if (!owner) {
      return NextResponse.json(
        {
          error:
            "the booth is only open to the keeper for now — sign in above if that's you.",
        },
        { status: 403 }
      );
    }

    const { rows: totalRows } = await query(
      `select count(*)::int as c from booth_log where created_at > now() - interval '1 day'`
    );
    if (totalRows[0].c >= MAX_TOTAL_PER_DAY) {
      return NextResponse.json(
        { error: "hit today's sanity cap for the booth — check back tomorrow." },
        { status: 429 }
      );
    }

    const { answer, brokeCharacter, costUsd } = await askBooth(text);

    const { rows } = await query(
      `insert into booth_log (question, answer, broke_character, cost_usd, ip_hash)
       values ($1, $2, $3, $4, $5)
       returning id, question, answer, broke_character,
                 cost_usd as "costUsd", created_at`,
      [text, answer, brokeCharacter, costUsd, ipHash]
    );

    return NextResponse.json({ entry: rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "something went wrong on our end — " + (err.message || "") },
      { status: 500 }
    );
  }
}

// Owner-only: the private log of past questions/answers (per your choice
// to keep this visible to you but not public).
export async function GET(req) {
  if (!isOwnerRequest(req)) {
    return NextResponse.json({ entries: [], ready: false });
  }
  try {
    const { rows: entries } = await query(
      `select id, question, answer, broke_character,
              cost_usd as "costUsd", created_at
       from booth_log
       order by created_at desc
       limit 200`
    );
    return NextResponse.json({ entries, ready: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ entries: [], ready: false });
  }
}
