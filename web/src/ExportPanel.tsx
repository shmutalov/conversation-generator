import React, { useState } from "react";
import type { Dialogue } from "@/schema";

const section: React.CSSProperties = {
  padding: "14px 20px",
  borderTop: "1px solid #1a1e26",
  position: "sticky",
  bottom: 0,
  background: "#0f1218",
};

const btn = (primary = false): React.CSSProperties => ({
  background: primary ? "#3b82f6" : "#1c2130",
  color: primary ? "#fff" : "#c6cbd6",
  border: `1px solid ${primary ? "#3b82f6" : "#262b36"}`,
  borderRadius: 6,
  padding: "8px 12px",
  fontSize: 12,
  cursor: "pointer",
  fontFamily: "inherit",
  fontWeight: primary ? 600 : 400,
});

type RenderState =
  | { kind: "idle" }
  | { kind: "rendering"; progress: number }
  | { kind: "done"; url: string; bytes: number }
  | { kind: "error"; message: string };

export const ExportPanel: React.FC<{ dialogue: Dialogue }> = ({ dialogue }) => {
  const [render, setRender] = useState<RenderState>({ kind: "idle" });

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(dialogue, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${dialogue.template}-dialogue.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderMp4 = async () => {
    setRender({ kind: "rendering", progress: 0 });
    try {
      const res = await fetch("/render", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(dialogue),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setRender({ kind: "done", url, bytes: blob.size });
    } catch (err) {
      setRender({ kind: "error", message: err instanceof Error ? err.message : String(err) });
    }
  };

  return (
    <section style={section}>
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button type="button" style={btn(false)} onClick={downloadJSON}>
          Download JSON
        </button>
        <button
          type="button"
          style={btn(true)}
          onClick={renderMp4}
          disabled={render.kind === "rendering"}
        >
          {render.kind === "rendering" ? "Rendering…" : "Render MP4"}
        </button>
      </div>

      {render.kind === "rendering" ? (
        <div style={{ fontSize: 11, color: "#8892a4" }}>
          Rendering via local server. First render downloads Chromium (~200 MB) — may take a few minutes.
        </div>
      ) : null}

      {render.kind === "done" ? (
        <div style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <span style={{ color: "#64d394" }}>
            Rendered {(render.bytes / 1024).toFixed(0)} KB.
          </span>
          <a
            href={render.url}
            download={`${dialogue.template}.mp4`}
            style={{
              ...btn(true),
              textAlign: "center",
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            ↓ Download MP4
          </a>
        </div>
      ) : null}

      {render.kind === "error" ? (
        <div style={{ fontSize: 11, color: "#f87171", marginTop: 6 }}>
          Render failed: {render.message}
          <br />
          <span style={{ color: "#8892a4" }}>
            Is the render server running? Start it with <code>npm run serve</code>.
          </span>
        </div>
      ) : null}
    </section>
  );
};
