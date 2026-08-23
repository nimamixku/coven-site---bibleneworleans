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

// ---- OUI OUI ----
// A wide split-flap reader-board, styled after the marquee sign at
// Carrollton United Methodist Church (credited in the caption below it) —
// and after real split-flap boards generally (that mechanism predates any
// one product; Vestaboard is just a modern take on the same idea). Tiles
// are LETTERS (one per module, not a sub-pixel), sized so the whole board
// reads as wide as the page — like the candle row above it — rather than
// forcing a square shape. Click the cross (it lights up with the same
// flame flash as the site's custom cursor) and the board scrambles
// through letters, with a scattering of solid color-chip tiles, before
// settling — left to right, weighted slightly by row — into a line
// pulled verbatim from the coven's own vocabulary (the same words as
// COVENISMS / COVEN TALK below). Plays once it scrolls into view.
const OUI_OUI_TILE_ASPECT = 0.88; // width:height of one tile — near-square, like a real split-flap module
const OUI_OUI_COLOR_CHIP_CHANCE = 0.16; // fraction of spinning tiles showing a solid color chip at any moment, rest show scrambling grey letters
const OUI_OUI_TILE_MIN = 22;
const OUI_OUI_TILE_MAX = 92;
const OUI_OUI_BEZEL = 12 * 2 + 1 * 2; // .signboard padding + border, both sides
const OUI_OUI_GAP = 2;
const OUI_OUI_DESIRED_TILE_W = 58; // comfortable baseline module width
const OUI_OUI_FLIP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
// Exact colors sampled directly from the bibleneworleans.com word-cloud
// (BIBLE, REVELATIONS, MATRIX, PAGES, 100 VIDEOS, INDIAN SUIT, GLOSSARY,
// CREOLE/KAQCHIKEL, ME, GARDEN, DIGITAL GALLERY, in that order).
const OUI_OUI_COLORS = [
  "#D85052",
  "#CD5F79",
  "#C1302F",
  "#AC397B",
  "#E459C6",
  "#572D81",
  "#BF90B7",
  "#438A87",
  "#F4C544",
  "#3F7939",
  "#5899E2",
];
// Verbatim lines pulled from `rules` and the COVEN TALK strip below —
// nothing new written here, just re-staged for the board.
const OUI_OUI_PHRASES = [
  "THERE IS NO COVEN THERE ARE NO RULES",
  "BE SOMEONE NO ONE CAN OFFEND",
  "YOU ARE GOD NOT YOUR AVATAR",
  "YOUR BRAIN IS DUMB STOP LISTENING TO IT",
  "YOUR WORDS CAST SPELLS",
  "YOURS IS THE WORD OF GOD",
  "EVERYTHING IS PLACEBO UNTIL YOU HIT GOD MODE",
  "YOUR BRAIN LISTENS TO YOU NOT VICE VERSA",
  "THE COVEN DOESN'T EXIST",
];
const OUI_OUI_FLIP_DURATION_MS = 2000;
const OUI_OUI_TICK_MS = 55;
const OUI_OUI_TOTAL_TICKS = Math.round(
  OUI_OUI_FLIP_DURATION_MS / OUI_OUI_TICK_MS
);

function ouiOuiWrapAt(text, targetW) {
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  words.forEach((w) => {
    const candidate = cur ? cur + " " + w : w;
    if (candidate.length > targetW && cur) {
      lines.push(cur);
      cur = w;
    } else {
      cur = candidate;
    }
  });
  if (cur) lines.push(cur);
  return lines;
}

// A real reader-board is a WIDE, short rectangle: its column count comes
// from the board's fixed physical width, not from chasing a square shape.
// Figure out how many comfortable-sized tiles fit across the section's
// actual width, wrap the phrase to that column count, and let the row
// count fall out naturally (usually just 1-2 rows).
function ouiOuiComputeLayout(text, sectionWidth) {
  const availTotal = Math.max(320, sectionWidth || 560);
  const avail = Math.max(200, availTotal - OUI_OUI_BEZEL);
  let cols = Math.max(
    5,
    Math.round((avail + OUI_OUI_GAP) / (OUI_OUI_DESIRED_TILE_W + OUI_OUI_GAP))
  );
  const lines = ouiOuiWrapAt(text, cols);
  // Use the ACTUAL widest line, not the trial width — a single word longer
  // than `cols` can't be split, so the real line can run wider than
  // intended. Sizing cols off the trial width alone would silently
  // truncate long words (e.g. "EVERYTHING" cut to "EVERYTH").
  cols = Math.max(cols, ...lines.map((l) => l.length));
  const tileW = Math.max(
    OUI_OUI_TILE_MIN,
    Math.min(OUI_OUI_TILE_MAX, (avail - (cols - 1) * OUI_OUI_GAP) / cols)
  );
  return { lines, cols, tileW };
}

// Center every line within `cols`, padding with spaces (blank/unlit
// tiles) — same convention as a real reader-board holding unused modules
// dark.
function ouiOuiLayoutGrid(lines, cols) {
  return lines.map((line) => {
    const pad = Math.max(0, cols - line.length);
    const left = Math.floor(pad / 2);
    const row = [];
    for (let c = 0; c < cols; c++) {
      const i = c - left;
      row.push(i >= 0 && i < line.length ? line[i] : " ");
    }
    return row;
  });
}

function ouiOuiRandChar() {
  return OUI_OUI_FLIP_CHARS[
    Math.floor(Math.random() * OUI_OUI_FLIP_CHARS.length)
  ];
}
function ouiOuiRandColor() {
  return OUI_OUI_COLORS[Math.floor(Math.random() * OUI_OUI_COLORS.length)];
}

function OuiOuiBoard() {
  const sectionRef = useRef(null);
  const [width, setWidth] = useState(560);
  const [msgIndex, setMsgIndex] = useState(0);
  const [tick, setTick] = useState(0);
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [flame, setFlame] = useState(false);

  useEffect(() => {
    function measure() {
      if (sectionRef.current) setWidth(sectionRef.current.clientWidth);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  function askAgain() {
    if (running) return;
    setFlame(true);
    let next = Math.floor(Math.random() * OUI_OUI_PHRASES.length);
    if (OUI_OUI_PHRASES.length > 1 && next === msgIndex) {
      next = (next + 1) % OUI_OUI_PHRASES.length;
    }
    setMsgIndex(next);
    setStarted(true);
    setRunning(true);
    setTick(0);
  }

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          askAgain();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!running) return;
    if (tick >= OUI_OUI_TOTAL_TICKS) {
      setRunning(false);
      return;
    }
    const id = setTimeout(() => setTick((t) => t + 1), OUI_OUI_TICK_MS);
    return () => clearTimeout(id);
  }, [running, tick]);

  const layout = ouiOuiComputeLayout(OUI_OUI_PHRASES[msgIndex], width);
  const cols = layout.cols;
  const tileW = layout.tileW;
  const tileH = tileW / OUI_OUI_TILE_ASPECT;
  const grid = ouiOuiLayoutGrid(layout.lines, cols);
  const rows = grid.length;

  return (
    <section className="signboard-section" ref={sectionRef}>
      <h2 className="section-heading">OUI OUI</h2>
      <div
        className="signboard-cross-wrap"
        onClick={askAgain}
        role="button"
        aria-label="Flip the sign board to a new line"
      >
        <div
          className={`signboard-cross-glow${flame ? " flame" : ""}`}
          onAnimationEnd={() => setFlame(false)}
        />
        <svg
          className="signboard-cross"
          width="22"
          height="30"
          viewBox="0 0 22 30"
          fill="none"
        >
          <line
            x1="11"
            y1="1"
            x2="11"
            y2="29"
            stroke="currentColor"
            strokeWidth="1"
          />
          <line
            x1="1"
            y1="9"
            x2="21"
            y2="9"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="signboard-frame">
        <div
          className="signboard"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${tileW}px)`,
            gridAutoRows: `${tileH}px`,
          }}
        >
          {grid.map((row, r) =>
            row.map((targetChar, c) => {
              const isBlank = targetChar === " ";
              const s = (c / cols) * 0.7 + (r / rows) * 0.3; // 0..1 wave weighted horizontally
              const settleTick = Math.round(s * OUI_OUI_TOTAL_TICKS);
              const isSettled = !started || !running || tick >= settleTick;
              const spinning = started && running && !isSettled && !isBlank;

              let content = null;
              const tileStyle = {};
              if (spinning) {
                // Like a real split-flap module: most tiles are still
                // cycling through legible grey letters, and only a
                // scattering of tiles land on a solid color chip at any
                // instant (not the whole board flashing color at once).
                if (Math.random() < OUI_OUI_COLOR_CHIP_CHANCE) {
                  tileStyle.backgroundColor = ouiOuiRandColor();
                } else {
                  content = (
                    <span
                      className="signboard-char"
                      style={{ fontSize: Math.round(tileW * 0.46), color: "#9a9a96" }}
                    >
                      {ouiOuiRandChar()}
                    </span>
                  );
                }
              } else if (!isBlank && started) {
                content = (
                  <span
                    className="signboard-char"
                    style={{ fontSize: Math.round(tileW * 0.46), color: "var(--tile-gold)" }}
                  >
                    {targetChar}
                  </span>
                );
              }

              return (
                <div
                  className="signboard-tile"
                  style={tileStyle}
                  key={r + "-" + c}
                >
                  {content}
                </div>
              );
            })
          )}
        </div>
      </div>

      <p className="signboard-hint">click the cross to ask again</p>
      <p className="signboard-caption">
        design inspiration: the split-flap marquee sign at Carrollton United
        Methodist Church
      </p>
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

// ---- THE BOOTH ----
// A small text oracle, in the spirit of the classic "psychiatric help,
// 5 cents" booth gag -- but instead of a person behind the window,
// there's just a blank space where an answer appears, generated in the
// site's own voice (see app/api/booth/route.js for the actual grounding
// and the hard safety boundary around real distress). Owner-only to
// trigger for now -- everyone can see the booth itself and read past
// answers count toward showcasing the feature, but only the signed-in
// keeper can actually ask it something, so real API cost stays bounded
// to testing. Opening it to visitors later is a server-side change only
// (see the route file) -- nothing here in the UI needs to change.
// The booth's own illustrated sign -- an original line-art piece in the
// site's existing gold/silver aesthetic (not a copy of the Peanuts booth
// art), showing the REAL dollar cost of the last reading instead of a
// joke "5 cents". Before any question's been asked it just shows a dash.
function BoothSignGraphic({ price, asking }) {
  const priceLabel =
    price == null ? "— . — — — —" : `$${price.toFixed(4)}`;
  return (
    <svg
      className="booth-sign"
      viewBox="0 0 220 116"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="1"
        y="1"
        width="218"
        height="114"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
      <line x1="1" y1="40" x2="219" y2="40" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      <line x1="1" y1="86" x2="219" y2="86" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      <text x="110" y="26" textAnchor="middle" className="booth-sign-title">
        BOOTH HELP
      </text>
      <text x="110" y="70" textAnchor="middle" className="booth-sign-price">
        {priceLabel}
      </text>
      <text x="110" y="102" textAnchor="middle" className="booth-sign-sub">
        {asking ? "reading…" : "the booth is in"}
      </text>
    </svg>
  );
}

function BoothSignIn({ isOwner, onChange }) {
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (isOwner) {
    return (
      <button
        type="button"
        className="link-btn booth-signin-btn"
        onClick={() => {
          fetch("/api/owner", { method: "DELETE" }).then(() => onChange(false));
        }}
      >
        signed in as keeper — sign out
      </button>
    );
  }

  return (
    <form
      className="booth-signin"
      onSubmit={(e) => {
        e.preventDefault();
        if (!passcode.trim()) return;
        setBusy(true);
        setError("");
        fetch("/api/owner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passcode }),
        })
          .then((r) => r.json())
          .then((d) => {
            if (d?.ok) {
              onChange(true);
              setPasscode("");
            } else {
              setError(d?.error || "that passcode isn't right.");
            }
          })
          .catch(() => setError("something went wrong."))
          .finally(() => setBusy(false));
      }}
    >
      <input
        type="password"
        className="booth-passcode-input"
        placeholder="keeper passcode"
        value={passcode}
        onChange={(e) => setPasscode(e.target.value)}
      />
      <button type="submit" className="link-btn booth-signin-btn" disabled={busy}>
        {busy ? "signing in…" : "sign in as keeper"}
      </button>
      {error && <div className="booth-error">{error}</div>}
    </form>
  );
}

function Booth() {
  const [isOwner, setIsOwner] = useState(false);
  const [question, setQuestion] = useState("");
  const [entry, setEntry] = useState(null);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/owner")
      .then((r) => r.json())
      .then((d) => setIsOwner(!!d.isOwner))
      .catch(() => {});
  }, []);

  function handleAsk(e) {
    e.preventDefault();
    const text = question.trim();
    if (!text || asking) return;
    setAsking(true);
    setError("");
    fetch("/api/booth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: text }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.entry) {
          setEntry(d.entry);
          setQuestion("");
        } else {
          setError(d?.error || "something went wrong.");
        }
      })
      .catch(() => setError("something went wrong."))
      .finally(() => setAsking(false));
  }

  return (
    <section className="booth-section">
      <h2 className="section-heading">THE BOOTH</h2>
      <p className="booth-intro">
        ask it a question. bring a thought, a feeling — whatever's loudest right now.
      </p>

      <div className="booth-card">
        <BoothSignGraphic price={entry?.costUsd} asking={asking} />

        <div className="booth-window">
          {asking ? (
            <div className="booth-placeholder booth-thinking">
              <LineCross size={28} />
            </div>
          ) : entry ? (
            <p className="booth-answer">{entry.answer}</p>
          ) : (
            <div className="booth-placeholder">
              <LineCross size={28} />
            </div>
          )}
        </div>

        <form className="booth-form" onSubmit={handleAsk}>
          <input
            type="text"
            className="booth-input"
            placeholder="ask the booth…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            maxLength={500}
          />
          <button className="booth-submit" type="submit" disabled={asking}>
            {asking ? "…" : "ask"}
          </button>
        </form>

        {error && <div className="booth-error">{error}</div>}

        <div className="booth-footer-row">
          <BoothSignIn isOwner={isOwner} onChange={setIsOwner} />
        </div>
      </div>

      <p className="booth-disclosure">
        every answer here is machine-generated by Claude (Anthropic), grounded in
        COVEN of New Orleans's own published writing — no human reads or replies
        in real time.
      </p>
    </section>
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

      <OuiOuiBoard />

      <div className="section-divider"></div>

      <Booth />

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
