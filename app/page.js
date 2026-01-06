"use client";

import { useMemo, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

function normalizeUrl(input) {
  const raw = input.trim();
  if (!raw) return { ok: false, value: "", error: "Please enter a URL." };

  const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(raw);
  const withScheme = hasScheme ? raw : `https://${raw}`;

  try {
    const u = new URL(withScheme);
    return { ok: true, value: u.toString(), error: "" };
  } catch {
    return { ok: false, value: "", error: "That doesn’t look like a valid URL." };
  }
}

export default function Home() {
  const [input, setInput] = useState("");
  const [size, setSize] = useState(320);
  const [level, setLevel] = useState("M"); // L, M, Q, H
  const [submitted, setSubmitted] = useState("");
  const [error, setError] = useState("");

  const canvasWrapRef = useRef(null);

  const normalized = useMemo(() => normalizeUrl(submitted), [submitted]);
  const qrValue = normalized.ok ? normalized.value : "";

  const onGenerate = (e) => {
    e.preventDefault();
    setError("");
    const check = normalizeUrl(input);
    if (!check.ok) {
      setSubmitted("");
      setError(check.error);
      return;
    }
    setSubmitted(input);
  };

  const downloadPng = () => {
    if (!canvasWrapRef.current) return;
    const canvas = canvasWrapRef.current.querySelector("canvas");
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = "qr.png";
    a.click();
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.h1}>URL → QR Code Generator</h1>
        <p style={styles.sub}>
          Paste any link, generate a QR, and scan it to open the URL.
        </p>

        <form onSubmit={onGenerate} style={styles.card}>
          <label style={styles.label}>Website URL</label>
          <div style={styles.row}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="https://example.com"
              style={styles.input}
              spellCheck={false}
            />
            <button type="submit" style={styles.btn}>
              Generate
            </button>
          </div>

          <div style={styles.options}>
            <div style={styles.opt}>
              <label style={styles.label}>Size</label>
              <select
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                style={styles.select}
              >
                <option value={256}>256</option>
                <option value={320}>320</option>
                <option value={512}>512</option>
                <option value={768}>768</option>
              </select>
            </div>
          </div>

          {error ? <p style={styles.error}>{error}</p> : null}
        </form>

        <section style={{ ...styles.card, marginTop: 14 }}>
          <h2 style={styles.h2}>Preview</h2>

          <div style={styles.qrBox} ref={canvasWrapRef}>
            {qrValue ? (
              <QRCodeCanvas
                value={qrValue}
                size={size}
                level={level}
                includeMargin={true}
              />
            ) : (
              <p style={{ color: "#9CA3AF" }}>Generate a QR to see it here.</p>
            )}
          </div>

          <div style={styles.actions}>
            <button
              onClick={downloadPng}
              style={styles.btnGhost}
              disabled={!qrValue}
            >
              Download PNG
            </button>

            <button
              onClick={() => qrValue && navigator.clipboard.writeText(qrValue)}
              style={styles.btnGhost}
              disabled={!qrValue}
            >
              Copy URL
            </button>

            {qrValue ? (
              <a href={qrValue} target="_blank" rel="noreferrer" style={styles.link}>
                Test open ↗
              </a>
            ) : null}
          </div>

          {qrValue ? (
            <p style={styles.hint}>
              QR points to: <code style={styles.code}>{qrValue}</code>
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0b0f19",
    color: "#e5e7eb",
    padding: "40px 18px",
    fontFamily:
      "system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif",
  },
  container: { maxWidth: 900, margin: "0 auto" },
  h1: { margin: 0, fontSize: 34 },
  sub: { marginTop: 8, color: "#9CA3AF" },

  card: {
    marginTop: 18,
    background: "#0f172a",
    border: "1px solid #1f2937",
    borderRadius: 16,
    padding: 16,
  },
  label: { display: "block", fontSize: 13, color: "#9CA3AF", marginBottom: 8 },
  row: { display: "flex", gap: 10 },
  input: {
    flex: 1,
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid #1f2937",
    background: "#0b1224",
    color: "#e5e7eb",
    outline: "none",
  },
  btn: {
    padding: "12px 14px",
    borderRadius: 12,
    border: 0,
    background: "#22c55e",
    color: "#052e16",
    fontWeight: 800,
    cursor: "pointer",
  },
  options: { display: "flex", gap: 14, flexWrap: "wrap", marginTop: 12 },
  opt: { minWidth: 180, flex: 1 },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid #1f2937",
    background: "#0b1224",
    color: "#e5e7eb",
  },
  error: { marginTop: 10, color: "#fca5a5" },

  h2: { margin: 0, fontSize: 18 },
  qrBox: {
    marginTop: 12,
    minHeight: 260,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px dashed rgba(148,163,184,.35)",
    borderRadius: 14,
    background: "rgba(2,6,23,.55)",
    padding: 14,
  },
  actions: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 },
  btnGhost: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #1f2937",
    background: "transparent",
    color: "#e5e7eb",
    cursor: "pointer",
  },
  link: { color: "#93c5fd", alignSelf: "center", textDecoration: "none" },
  hint: { marginTop: 10, color: "#9CA3AF", fontSize: 13 },
  code: {
    padding: "2px 8px",
    borderRadius: 10,
    border: "1px solid #1f2937",
    background: "#0b1224",
  },
};
