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
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .nav-button:hover .nav-arrow {
          transform: translateX(4px);
        }
        .nav-button:hover {
          background: rgba(34, 197, 94, 0.25) !important;
          border-color: rgba(34, 197, 94, 0.4) !important;
        }
        input:focus {
          border-color: rgba(34, 197, 94, 0.5) !important;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1) !important;
        }
        select:focus {
          border-color: rgba(34, 197, 94, 0.5) !important;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1) !important;
        }
        button[type="submit"]:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(34, 197, 94, 0.4) !important;
        }
        button[type="button"]:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        a[href^="http"]:hover {
          opacity: 0.8;
        }
      `}} />
      <main style={styles.page}>
        <nav style={styles.navbar}>
          <div style={styles.navContent}>
            <h2 style={styles.navTitle}>URL to QR Code</h2>
            <a
              href="https://www.logisol.tech/"
              target="_blank"
              rel="noreferrer"
              style={styles.navButton}
              className="nav-button"
            >
              Visit Logisol <span style={styles.arrow} className="nav-arrow">→</span>
            </a>
          </div>
        </nav>

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
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0b0f19 0%, #1a1f35 50%, #0b0f19 100%)",
    backgroundSize: "400% 400%",
    animation: "gradientShift 15s ease infinite",
    color: "#e5e7eb",
    padding: "40px 18px",
    paddingTop: "120px",
    fontFamily:
      "system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif",
    position: "relative",
  },
  navbar: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: "rgba(15, 23, 42, 0.3)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    padding: "16px 24px",
    animation: "fadeInDown 0.6s ease-out",
  },
  navContent: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  navTitle: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
    color: "#e5e7eb",
  },
  navButton: {
    padding: "10px 20px",
    borderRadius: 12,
    border: "1px solid rgba(255, 255, 255, 0.2)",
    background: "rgba(34, 197, 94, 0.15)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    color: "#22c55e",
    textDecoration: "none",
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    gap: 8,
    transition: "all 0.3s ease",
    cursor: "pointer",
  },
  arrow: {
    fontSize: 18,
    transition: "transform 0.3s ease",
  },
  container: {
    maxWidth: 900,
    margin: "0 auto",
    animation: "fadeIn 0.8s ease-out",
  },
  h1: {
    margin: 0,
    fontSize: 34,
    animation: "fadeIn 1s ease-out 0.2s both",
  },
  sub: {
    marginTop: 8,
    color: "#9CA3AF",
    animation: "fadeIn 1s ease-out 0.4s both",
  },

  card: {
    marginTop: 18,
    background: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    padding: 16,
    boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
    animation: "fadeIn 1s ease-out 0.6s both",
  },
  label: {
    display: "block",
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  row: { display: "flex", gap: 10 },
  input: {
    flex: 1,
    padding: "12px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(11, 18, 36, 0.5)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    color: "#e5e7eb",
    outline: "none",
    transition: "all 0.3s ease",
  },
  btn: {
    padding: "12px 14px",
    borderRadius: 12,
    border: 0,
    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
    color: "#052e16",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)",
    transition: "all 0.3s ease",
  },
  options: { display: "flex", gap: 14, flexWrap: "wrap", marginTop: 12 },
  opt: { minWidth: 180, flex: 1 },
  select: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(11, 18, 36, 0.5)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    color: "#e5e7eb",
    transition: "all 0.3s ease",
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
    background: "rgba(2,6,23,.4)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    padding: 14,
  },
  actions: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 },
  btnGhost: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    color: "#e5e7eb",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  link: {
    color: "#93c5fd",
    alignSelf: "center",
    textDecoration: "none",
    transition: "all 0.3s ease",
  },
  hint: { marginTop: 10, color: "#9CA3AF", fontSize: 13 },
  code: {
    padding: "2px 8px",
    borderRadius: 10,
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(11, 18, 36, 0.5)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  },
};
