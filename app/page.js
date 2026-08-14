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

export default function Home() {
  return (
    <div className="page">
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
