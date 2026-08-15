"use client";

import { useState, useEffect, useRef } from "react";

const rules = [
  { n: "0", text: "there is NO COVEN. there are NO rules." },
  { n: "1", text: "be someone no one can offend." },
  { n: "2", text: "you are god. not your avatar." },
  { n: "3", text: "your brain is dumb. stop listening to it." },
];

// Each prayer/meditation pairs written text with an audio recording.
// Audio files live in public/audio/prayers/<file>. To add another one:
// add an entry here, then drop the matching audio file into that folder.
const prayers = [
  {
    id: "you-are-all-that-is",
    title: "You Are All That Is",
    file: "you-are-all-that-is.m4a",
    downloadCard: "you-are-all-that-is-prayer-card.pdf",
    body: [
      "You, your I AM, your essence, is all that is. You are the multiverse, you are all desires, you are infinite and whole and pure love. Rest here for a while and savor your godliness.",
      "Remember, the ego may have desires. But you — your essence, your I AM — you are all that is. You are the multiverse, the cosmos, the stars, all desires. You are shared eternal consciousness. You are whole. You are perfect just as you are.",
      "The ego envies your beingness.",
      "Rest here for a while and savor your godliness.",
      "In Shiva, and love, and infiniteness.",
    ],
    latin: {
      text: "nos sumus COVEN ex Nova Aurelia. potens grex maleficarum. narrationes collective reformamus, ut mundum denuo imaginemur et nos invicem nostrasque stirpes sanemus — quia recensio praesens rescribit et praeteritum renovat. in melius, in omnes. cum mentibus nostris.",
      translation:
        "We are COVEN, from New Orleans. A powerful gathering of witches. We are collectively reshaping the narrative, so that we might reimagine the world anew and heal ourselves and our lineages — because revising the present rewrites and renews the past. For the better. For everyone. With our minds.",
    },
  },
];

function prayerAudioSrc(filename) {
  return "/audio/prayers/" + encodeURIComponent(filename);
}

// Each photo set is a horizontal strip. The closed thumbnail shows only
// a tone-color swatch (silvertone/black/grey) — the real photo only
// appears once someone clicks and opens the lightbox. Files live in
// public/photos/. To add another set later: add a new entry here.
const photoSets = [
  {
    id: "set-one",
    photos: [
      { file: "pianopeaches.jpg", tone: "#161616" },
      { file: "strochchurch.jpg", tone: "#2a2a2a" },
      { file: "overpass.jpg", tone: "#3d3d3d" },
      { file: "topray.jpg", tone: "#141414" },
      { file: "crowonline.jpg", tone: "#4e4e4e" },
      { file: "handsholdingflowers.jpg", tone: "#232323" },
      { file: "crosstreecemetery.jpg", tone: "#5c5c5c" },
      { file: "bricksteps.jpg", tone: "#1c1c1c" },
      { file: "crowflying.jpg", tone: "#6e6e6e" },
      { file: "cross.jpg", tone: "#333333" },
      { file: "crosswindow.jpg", tone: "#8a8a8a" },
      { file: "palmagainstbuilding.jpg", tone: "#1a1a1a" },
      { file: "woodencrossfranklin.jpg", tone: "#454545" },
    ],
  },
];

function photoSrc(filename) {
  return "/photos/" + encodeURIComponent(filename);
}

function LineCross({ size = 22 }) {
  const h = size;
  const w = size * 0.73;
  return (
    <svg
      className="line-cross"
      width={w}
      height={h}
      viewBox="0 0 22 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <line x1="11" y1="1" x2="11" y2="29" stroke="currentColor" strokeWidth="1" />
      <line x1="1" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function AudioIndicator() {
  return (
    <svg
      className="audio-indicator"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="1" y="7" width="2" height="6" fill="currentColor" />
      <rect x="6" y="3" width="2" height="10" fill="currentColor" />
      <rect x="11" y="5" width="2" height="8" fill="currentColor" />
    </svg>
  );
}

// ---- Votive candles ----
// Each candle renders BOTH states stacked (resting glow + lit glass
// cup with etched cross) — CSS crossfades between them once a prayer
// is submitted. Layout uses a small seeded PRNG (not Math.random) so
// server- and client-rendered markup match on hydration.
const VOTIVE_ROWS = 4;
const VOTIVE_ITEMS_PER_ROW = 21;
const VOTIVE_MARIGOLDS_PER_ROW = 2;

function buildVotiveLayout() {
  let seed = 1;
  function rand() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  const rows = [];
  let candleIndex = 0;
  for (let r = 0; r < VOTIVE_ROWS; r++) {
    const marigoldSlots = new Set();
    while (marigoldSlots.size < VOTIVE_MARIGOLDS_PER_ROW) {
      const slot = 2 + Math.floor(rand() * (VOTIVE_ITEMS_PER_ROW - 4));
      marigoldSlots.add(slot);
    }

    const items = [];
    for (let i = 0; i < VOTIVE_ITEMS_PER_ROW; i++) {
      if (marigoldSlots.has(i)) {
        items.push({
          type: "marigold",
          key: `r${r}-i${i}`,
          pulseDelay: `${(i * 0.4 + r) % 4}s`,
        });
      } else {
        const delay = ((i * 0.37 + r * 0.6) % 4).toFixed(2);
        const duration = (3.2 + ((i * 0.29 + r * 0.4) % 2.4)).toFixed(2);
        const glowSize = (18 + rand() * 14).toFixed(0);
        const jitter = (rand() * 8 - 4).toFixed(1);
        items.push({
          type: "candle",
          id: `candle-${candleIndex}`,
          key: `r${r}-i${i}`,
          pulseDelay: `${delay}s`,
          pulseDuration: `${duration}s`,
          glowSize: `${glowSize}px`,
          jitter: `${jitter}px`,
        });
        candleIndex++;
      }
    }
    rows.push(items);
  }
  return rows;
}

function CupSVG() {
  return (
    <svg viewBox="0 0 30 54" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse className="cup-rim" cx="15" cy="6" rx="9.3" ry="2.1" />
      <path
        className="cup-body"
        d="M5.7 6 L7.2 48.5 C7.5 50.8 10.8 52.5 15 52.5 C19.2 52.5 22.5 50.8 22.8 48.5 L24.3 6"
      />
      <line className="cup-cross" x1="15" y1="26" x2="15" y2="36" />
      <line className="cup-cross" x1="11.5" y1="29.5" x2="18.5" y2="29.5" />
    </svg>
  );
}

function MarigoldSVG() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <line
          key={i}
          className="petal"
          x1="12"
          y1="12"
          x2="12"
          y2="2.5"
          transform={`rotate(${(360 / 8) * i} 12 12)`}
        />
      ))}
      <circle className="center" cx="12" cy="12" r="2.2" />
    </svg>
  );
}

function VotiveCandles() {
  const layout = useRef(null);
  if (!layout.current) layout.current = buildVotiveLayout();

  const allCandleIds = useRef(null);
  if (!allCandleIds.current) {
    allCandleIds.current = layout.current
      .flat()
      .filter((item) => item.type === "candle")
      .map((c) => c.id);
  }

  const [litPrayers, setLitPrayers] = useState({});
  const [recentId, setRecentId] = useState(null);
  const [input, setInput] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [popup, setPopup] = useState(null);
  const unlitPool = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    if (!unlitPool.current || unlitPool.current.length === 0) {
      unlitPool.current = [...allCandleIds.current];
    }
    const pickIndex = Math.floor(Math.random() * unlitPool.current.length);
    const id = unlitPool.current.splice(pickIndex, 1)[0];

    setLitPrayers((prev) => ({ ...prev, [id]: text }));
    setRecentId(id);
    setInput("");
    setShowNote(true);
    setPopup(null);
  }

  function handleCandleClick(id, e) {
    const text = litPrayers[id];
    if (!text) {
      setPopup(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setPopup({
      text,
      left: rect.left + rect.width / 2,
      top: rect.top,
    });
  }

  useEffect(() => {
    function handleDocClick(e) {
      if (
        !e.target.closest(".votive-candle.lit") &&
        !e.target.closest(".votive-popup")
      ) {
        setPopup(null);
      }
    }
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  return (
    <section className="votive-section">
      <h2 className="section-heading">LIGHT A CANDLE</h2>

      <div className="votive-card">
        <div className="votive-grid">
          {layout.current.map((row, ri) => (
            <div className="votive-row" key={ri}>
              {row.map((item) =>
                item.type === "marigold" ? (
                  <div
                    className="votive-marigold"
                    key={item.key}
                    style={{ "--pulse-delay": item.pulseDelay }}
                  >
                    <MarigoldSVG />
                  </div>
                ) : (
                  <div
                    className={`votive-candle${
                      litPrayers[item.id] ? " lit" : ""
                    }${item.id === recentId ? " recent" : ""}`}
                    key={item.key}
                    style={{
                      "--pulse-delay": item.pulseDelay,
                      "--pulse-duration": item.pulseDuration,
                      "--glow-size": item.glowSize,
                      "--jitter": item.jitter,
                    }}
                    role={litPrayers[item.id] ? "button" : undefined}
                    tabIndex={litPrayers[item.id] ? 0 : undefined}
                    onClick={(e) => handleCandleClick(item.id, e)}
                  >
                    <div className="glow"></div>
                    <div className="wick"></div>
                    <div className="cup-wrap">
                      <div className="cup-glow"></div>
                      <CupSVG />
                    </div>
                    {litPrayers[item.id] && <div className="prayer-hint"></div>}
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      </div>

      <form className="votive-form" onSubmit={handleSubmit}>
        <input
          className="votive-input"
          type="text"
          placeholder="make a prayer…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button className="votive-submit" type="submit">
          light a candle
        </button>
      </form>
      <div className={`votive-note${showNote ? " show" : ""}`}>
        your candle has been lit.
      </div>

      {popup && (
        <div
          className="votive-popup show"
          style={{ left: `${popup.left}px`, top: `${popup.top}px` }}
        >
          {popup.text}
        </div>
      )}
    </section>
  );
}

function PhotoStrip({ photos }) {
  const [revealed, setRevealed] = useState(false);
  const [clicked, setClicked] = useState({});
  const stripRef = useRef(null);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  function toggle(i) {
    setClicked((c) => ({ ...c, [i]: !c[i] }));
  }

  return (
    <div className="photo-strip" ref={stripRef}>
      {photos.map((photo, i) => (
        <button
          key={i}
          className={`photo-thumb ${revealed ? "revealed" : ""}`}
          style={{
            background: photo.tone,
            "--pulse-delay": `${(i * 0.53) % 4}s`,
            "--pulse-duration": `${3.4 + ((i * 0.31) % 2.2)}s`,
            "--reveal-delay": `${i * 0.09}s`,
          }}
          onClick={() => toggle(i)}
          aria-label={`Reveal photo ${i + 1}`}
        >
          {clicked[i] && (
            <img className="photo-thumb-img" src={photoSrc(photo.file)} alt="" />
          )}
          <LineCross size={16} />
        </button>
      ))}
    </div>
  );
}

// ---- Verse banner ----
// A scrolling ticker of scripture in the rectangular band under the
// prayer list. All-lowercase, silvertone letters with slight per-letter
// tone variation. Clicking a word pauses the scroll and enlarges that
// word into thin, spaced-out caps; clicking again (or the empty strip)
// resumes. Since the words are scripture, not the user's own writing,
// the reference is credited underneath.
const VERSE_PRAYER = {
  text: "and the angel came in unto her, and said, hail, thou that art highly favoured, the lord is with thee: blessed art thou among women.",
  reference: "luke 1:28, king james version",
};

// Deterministic (not Math.random), same trick as buildVotiveLayout above,
// so server- and client-rendered letter tones match on hydration.
function seededUnit(n) {
  const x = Math.sin(n * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

function silverTone(seed) {
  const base = 74; // roughly --silver's lightness
  const spread = 16;
  const l = base + (seededUnit(seed) - 0.5) * spread;
  return `hsl(0, 0%, ${Math.max(58, Math.min(92, l)).toFixed(1)}%)`;
}

const VERSE_BANNER_REPEATS = 3;

function VerseBanner({ text, reference }) {
  const [words] = useState(() => text.split(" "));
  const [activeKey, setActiveKey] = useState(null);
  const frozen = activeKey !== null;

  function handleTrackClick(e) {
    const wordEl = e.target.closest("[data-vb-key]");
    if (!wordEl) {
      setActiveKey(null);
      return;
    }
    const key = wordEl.dataset.vbKey;
    setActiveKey((prev) => (prev === key ? null : key));
  }

  let letterSeed = 0;
  function renderHalf(halfIndex) {
    const groups = [];
    for (let r = 0; r < VERSE_BANNER_REPEATS; r++) {
      groups.push(
        <span className="verse-banner-line" key={`h${halfIndex}-r${r}`}>
          {words.map((w, i) => {
            const key = `h${halfIndex}-r${r}-w${i}`;
            return (
              <span
                className={`verse-banner-word${
                  activeKey === key ? " active" : ""
                }`}
                data-vb-key={key}
                key={key}
              >
                {[...w].map((ch, ci) => (
                  <span
                    className="verse-banner-letter"
                    style={{ color: silverTone(letterSeed++) }}
                    key={ci}
                  >
                    {ch}
                  </span>
                ))}
              </span>
            );
          })}
        </span>
      );
      groups.push(
        <span className="verse-banner-divider" key={`h${halfIndex}-r${r}-d`}>
          <LineCross size={14} />
        </span>
      );
    }
    return groups;
  }

  return (
    <div className={`verse-banner${frozen ? " frozen" : ""}`}>
      <div
        className={`verse-banner-track${frozen ? " paused" : ""}`}
        onClick={handleTrackClick}
      >
        {renderHalf(0)}
        {renderHalf(1)}
      </div>
      <div className={`verse-banner-hint${frozen ? " show" : ""}`}>
        tap again to continue
      </div>
      <div className="verse-banner-citation">{reference}</div>
    </div>
  );
}

// ---- Site-wide custom cursor ----
// A small gold cross that follows the pointer everywhere on the site
// (not just the verse banner), with its own soft flame-like glow that
// flickers on the same rhythm as the votive candles. Tracks the mouse
// via direct DOM writes rather than React state, so it stays smooth
// and never triggers a re-render. Only activates on fine-pointer
// (mouse) devices — touchscreens keep their normal behavior.
function SiteCursor() {
  const cursorRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !window.matchMedia ||
      !window.matchMedia("(pointer: fine)").matches
    ) {
      return;
    }

    const cursorEl = cursorRef.current;
    const glowEl = glowRef.current;
    if (!cursorEl || !glowEl) return;

    function handleMove(e) {
      cursorEl.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    }
    function show() {
      cursorEl.classList.add("visible");
    }
    function hide() {
      cursorEl.classList.remove("visible");
    }
    function handleClick() {
      // Restart the flame animation even on rapid repeat clicks by
      // removing the class, forcing a reflow, then re-adding it.
      glowEl.classList.remove("flame");
      void glowEl.offsetWidth;
      glowEl.classList.add("flame");
    }
    function clearFlame() {
      glowEl.classList.remove("flame");
    }

    document.body.classList.add("custom-cursor-active");
    document.addEventListener("mousemove", handleMove);
    document.addEventListener("click", handleClick);
    document.documentElement.addEventListener("mouseenter", show);
    document.documentElement.addEventListener("mouseleave", hide);
    glowEl.addEventListener("animationend", clearFlame);
    return () => {
      document.body.classList.remove("custom-cursor-active");
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("click", handleClick);
      document.documentElement.removeEventListener("mouseenter", show);
      document.documentElement.removeEventListener("mouseleave", hide);
      glowEl.removeEventListener("animationend", clearFlame);
    };
  }, []);

  return (
    <div className="site-cursor" ref={cursorRef} aria-hidden="true">
      <div className="site-cursor-glow" ref={glowRef}></div>
      <LineCross size={22} />
    </div>
  );
}

export default function Home() {
  return (
    <div className="page">
      <SiteCursor />
      <div className="masthead">
        <div className="masthead-inner">
          <span className="brand">
            COVEN <span className="brand-sub">of New Orleans</span>
          </span>
          <span className="masthead-right">BIBLE of New Orleans</span>
        </div>
      </div>

      <div className="section-divider"></div>

      <section className="hero">
        <div className="hero-inner">
          <div className="presave-row">
            <span>Pre-save a BIBLE</span>
            <span className="book-tag">a BOOK</span>
          </div>
          <h1 className="hero-title">
            BIBLE
            <br />
            OF
            <br />
            NEW ORLEANS
          </h1>
          <button className="cta">Pre-save →</button>
        </div>
      </section>

      <div className="section-divider"></div>

      <section className="prayer-section">
        <h2 className="section-heading">COVEN PRAYER AND MEDITATION</h2>
        <div className="prayer-list">
          {prayers.map((p) => (
            <details className="prayer-card" key={p.id}>
              <summary className="prayer-summary">
                <LineCross />
                <span className="prayer-summary-label">{p.title}</span>
                {p.file && <AudioIndicator />}
              </summary>
              <div className="prayer-body-wrap">
                <div className="card-spread">
                  <div className="card-front">
                    <LineCross size={40} />
                    <div className="card-eyebrow">COVEN of New Orleans</div>
                    <h3 className="card-title">{p.title}</h3>
                    <div className="card-subtitle">a prayer &amp; meditation</div>
                  </div>

                  <div className="card-back">
                    <LineCross size={22} />
                    <div className="prayer-body">
                      {p.body.map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                    {p.latin && (
                      <div className="prayer-latin">
                        <p className="latin-text">{p.latin.text}</p>
                        <p className="latin-translation">
                          <span className="latin-label">translation —</span>{" "}
                          {p.latin.translation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-controls">
                  <audio
                    className="prayer-audio"
                    controls
                    src={prayerAudioSrc(p.file)}
                  >
                    Your browser doesn't support audio playback.
                  </audio>
                  {p.downloadCard && (
                    <div className="card-links">
                      <a
                        className="prayer-download"
                        href={`/downloads/${encodeURIComponent(p.downloadCard)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        preview prayer card
                      </a>
                      <span className="card-links-sep">·</span>
                      <a
                        className="prayer-download"
                        href={`/downloads/${encodeURIComponent(p.downloadCard)}`}
                        download
                      >
                        ↓ download
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </details>
          ))}
        </div>
      </section>

      <div className="section-divider"></div>

      <section className="photo-strip-section">
        <h2 className="section-heading">GALLERY</h2>
        {photoSets.map((set) => (
          <PhotoStrip key={set.id} photos={set.photos} />
        ))}
      </section>

      <div className="section-divider"></div>

      <VerseBanner
        text={VERSE_PRAYER.text}
        reference={VERSE_PRAYER.reference}
      />

      <div className="section-divider"></div>

      <VotiveCandles />

      <div className="section-divider"></div>

      <section className="rules-section">
        <h2 className="section-heading">COVENISMS</h2>
        <div className="rules-grid">
          {rules.map((r) => (
            <div className="rule-card" key={r.n}>
              <div className="rule-num">rule {r.n}</div>
              <div className="rule-text">{r.text}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider"></div>

      <section className="talk-section">
        <h2 className="section-heading">COVEN TALK</h2>
        <div className="covenism-strip">
          {[
            "your brain is an organ. it does an extraordinary job, at its job.",
            "it is not meant to tell you what to do. do not volunteer it freely.",
            "your WORDS cast spells. your IMAGINATION is the most powerful tool you have.",
            "for my female avatars…",
            "perimenopause, menopause, premenstrual syndrome — we're NOT doing that.",
            "those are belief systems in medicine (a construct within consciousness). i do not believe them. i choose not to identify with them. you can too.",
            "yours is the word of god.",
            "everything is placebo until you hit god mode.",
            "the coven doesn't exist. neither do numbers, words, languages.",
            "your brain listens to YOU, not vice versa.",
          ].map((line, i) => (
            <div className="covenism-line" key={i}>
              {line}
            </div>
          ))}
        </div>
      </section>

      <div className="section-divider"></div>

      <footer className="site-footer">
        <span>COVEN of New Orleans</span>
        <span>your brain listens to YOU, not vice versa.</span>
      </footer>
    </div>
  );
}
