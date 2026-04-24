import React, { useEffect, useRef, useState } from "react";
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
  | {
      kind: "rendering";
      stage: "queued" | "selecting" | "rendering" | "downloading";
      progress: number;
    }
  | { kind: "done"; url: string; bytes: number }
  | { kind: "error"; message: string };

const stageLabel = (stage: "queued" | "selecting" | "rendering" | "downloading") => {
  switch (stage) {
    case "queued":
      return "Queued…";
    case "selecting":
      return "Preparing composition…";
    case "rendering":
      return "Rendering frames";
    case "downloading":
      return "Downloading MP4…";
  }
};

export const ExportPanel: React.FC<{ dialogue: Dialogue }> = ({ dialogue }) => {
  const [render, setRender] = useState<RenderState>({ kind: "idle" });
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    return () => {
      esRef.current?.close();
    };
  }, []);

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
    esRef.current?.close();
    setRender({ kind: "rendering", stage: "queued", progress: 0 });
    let jobId: string;
    try {
      const res = await fetch("/render", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(dialogue),
      });
      if (!res.ok) {
        throw new Error((await res.text()) || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { jobId: string };
      jobId = data.jobId;
    } catch (err) {
      setRender({ kind: "error", message: err instanceof Error ? err.message : String(err) });
      return;
    }

    const es = new EventSource(`/render/${jobId}/events`);
    esRef.current = es;

    es.onmessage = async (ev) => {
      let event:
        | { kind: "state"; state: string }
        | { kind: "progress"; progress: number }
        | { kind: "done"; url: string; bytes: number }
        | { kind: "error"; message: string };
      try {
        event = JSON.parse(ev.data);
      } catch {
        return;
      }

      if (event.kind === "state") {
        const stage =
          event.state === "rendering"
            ? "rendering"
            : event.state === "selecting"
              ? "selecting"
              : "queued";
        setRender((prev) =>
          prev.kind === "rendering"
            ? { ...prev, stage }
            : { kind: "rendering", stage, progress: 0 },
        );
      } else if (event.kind === "progress") {
        setRender({ kind: "rendering", stage: "rendering", progress: event.progress });
      } else if (event.kind === "done") {
        es.close();
        esRef.current = null;
        setRender({ kind: "done", url: event.url, bytes: event.bytes });
      } else if (event.kind === "error") {
        es.close();
        esRef.current = null;
        setRender({ kind: "error", message: event.message });
      }
    };

    es.onerror = () => {
      if (esRef.current !== es) return;
      es.close();
      esRef.current = null;
      setRender((prev) =>
        prev.kind === "done"
          ? prev
          : { kind: "error", message: "Lost connection to render server." },
      );
    };
  };

  const buttonLabel = () => {
    if (render.kind !== "rendering") return "Render MP4";
    if (render.stage === "rendering") return `Rendering ${(render.progress * 100).toFixed(0)}%`;
    return stageLabel(render.stage);
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
          {buttonLabel()}
        </button>
      </div>

      {render.kind === "rendering" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div
            style={{
              height: 6,
              background: "#1c2130",
              borderRadius: 999,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {render.stage === "rendering" || render.stage === "downloading" ? (
              <div
                style={{
                  width: `${render.progress * 100}%`,
                  height: "100%",
                  background: "#3b82f6",
                  transition: "width 0.15s ease-out",
                }}
              />
            ) : (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(90deg, transparent, rgba(59,130,246,0.6), transparent)",
                  animation: "convgenShimmer 1.2s linear infinite",
                }}
              />
            )}
          </div>
          <div style={{ fontSize: 11, color: "#8892a4" }}>{stageLabel(render.stage)}</div>
          <style>{`@keyframes convgenShimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
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
