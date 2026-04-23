import React from "react";
import type { Dialogue, Message, Sender } from "@/schema";

const section: React.CSSProperties = {
  padding: "14px 20px",
  borderBottom: "1px solid #1a1e26",
};

const label: React.CSSProperties = {
  display: "block",
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  color: "#8892a4",
  marginBottom: 6,
};

const input: React.CSSProperties = {
  width: "100%",
  background: "#161a22",
  color: "#e6e9ef",
  border: "1px solid #262b36",
  borderRadius: 6,
  padding: "7px 10px",
  fontSize: 13,
  fontFamily: "inherit",
};

const button = (variant: "primary" | "ghost" | "danger" = "ghost"): React.CSSProperties => ({
  background:
    variant === "primary"
      ? "#3b82f6"
      : variant === "danger"
        ? "transparent"
        : "#1c2130",
  color:
    variant === "primary" ? "#fff" : variant === "danger" ? "#f87171" : "#c6cbd6",
  border:
    variant === "danger"
      ? "1px solid #4a1e1e"
      : variant === "primary"
        ? "1px solid #3b82f6"
        : "1px solid #262b36",
  borderRadius: 6,
  padding: "6px 10px",
  fontSize: 12,
  cursor: "pointer",
  fontFamily: "inherit",
});

const templateOptions: { id: Dialogue["template"]; label: string }[] = [
  { id: "chatgpt", label: "ChatGPT" },
  { id: "claude", label: "Claude.ai" },
  { id: "gemini", label: "Gemini" },
  { id: "grok", label: "Grok" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "imessage", label: "iMessage" },
  { id: "telegram", label: "Telegram" },
];

const resolutions: Dialogue["resolution"][] = ["480p", "720p", "1080p"];
const aspects: Dialogue["aspect"][] = [
  "portrait-9:16",
  "landscape-16:9",
  "square-1:1",
  "landscape-4:3",
];

export const Editor: React.FC<{
  value: Dialogue;
  onChange: (next: Dialogue) => void;
}> = ({ value, onChange }) => {
  const set = <K extends keyof Dialogue>(key: K, v: Dialogue[K]) =>
    onChange({ ...value, [key]: v });

  const setMsg = (idx: number, patch: Partial<Message>) => {
    const next = value.messages.slice();
    next[idx] = { ...next[idx], ...patch };
    onChange({ ...value, messages: next });
  };

  const addMsg = (sender: Sender) => {
    onChange({
      ...value,
      messages: [...value.messages, { sender, text: "" }],
    });
  };

  const removeMsg = (idx: number) => {
    const next = value.messages.slice();
    next.splice(idx, 1);
    onChange({ ...value, messages: next });
  };

  const moveMsg = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= value.messages.length) return;
    const next = value.messages.slice();
    [next[idx], next[j]] = [next[j], next[idx]];
    onChange({ ...value, messages: next });
  };

  return (
    <div>
      <section style={section}>
        <label style={label}>Template</label>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {templateOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              style={{
                ...button(value.template === opt.id ? "primary" : "ghost"),
                fontSize: 11,
                padding: "8px 6px",
              }}
              onClick={() => set("template", opt.id)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      <section style={section}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={label}>Resolution</label>
            <select
              style={input}
              value={value.resolution}
              onChange={(e) => set("resolution", e.target.value as Dialogue["resolution"])}
            >
              {resolutions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={label}>Aspect</label>
            <select
              style={input}
              value={value.aspect}
              onChange={(e) => set("aspect", e.target.value as Dialogue["aspect"])}
            >
              {aspects.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
          <div>
            <label style={label}>Theme</label>
            <select
              style={input}
              value={value.theme}
              onChange={(e) => set("theme", e.target.value as Dialogue["theme"])}
            >
              <option value="dark">dark</option>
              <option value="light">light</option>
            </select>
          </div>
          <div>
            <label style={label}>FPS</label>
            <input
              style={input}
              type="number"
              min={10}
              max={60}
              value={value.fps}
              onChange={(e) => set("fps", Math.max(1, Number(e.target.value) || 30))}
            />
          </div>
        </div>
      </section>

      <section style={section}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={label}>Contact name</label>
            <input
              style={input}
              value={value.contactName}
              onChange={(e) => set("contactName", e.target.value)}
            />
          </div>
          <div>
            <label style={label}>User name</label>
            <input
              style={input}
              value={value.userName}
              onChange={(e) => set("userName", e.target.value)}
            />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
          <div>
            <label style={label}>Type speed (cps)</label>
            <input
              style={input}
              type="number"
              value={value.typeSpeedCps}
              onChange={(e) => set("typeSpeedCps", Math.max(1, Number(e.target.value) || 28))}
            />
          </div>
          <div>
            <label style={label}>Thinking (ms)</label>
            <input
              style={input}
              type="number"
              value={value.thinkingMs}
              onChange={(e) => set("thinkingMs", Math.max(0, Number(e.target.value) || 0))}
            />
          </div>
          <div>
            <label style={label}>Pause (ms)</label>
            <input
              style={input}
              type="number"
              value={value.pauseAfterMs}
              onChange={(e) => set("pauseAfterMs", Math.max(0, Number(e.target.value) || 0))}
            />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
          <div>
            <label style={label}>Responder reveal</label>
            <select
              style={input}
              value={value.responderReveal}
              onChange={(e) =>
                set("responderReveal", e.target.value as Dialogue["responderReveal"])
              }
            >
              <option value="teletype">teletype (stream)</option>
              <option value="instant">instant</option>
            </select>
          </div>
          <div>
            <label style={label}>Presentation</label>
            <select
              style={input}
              value={value.presentation}
              onChange={(e) =>
                set("presentation", e.target.value as Dialogue["presentation"])
              }
            >
              <option value="fullscreen">fullscreen</option>
              <option value="phone-mockup">phone mockup</option>
            </select>
          </div>
        </div>
        {value.presentation === "phone-mockup" ? (
          <div style={{ marginTop: 10 }}>
            <label style={label}>Backdrop</label>
            <select
              style={input}
              value={value.backdrop}
              onChange={(e) => set("backdrop", e.target.value)}
            >
              <option value="gradient">dark gradient</option>
              <option value="light">light gradient</option>
              <option value="solid">solid dark</option>
            </select>
          </div>
        ) : null}
      </section>

      <section style={{ ...section, borderBottom: "none" }}>
        <div style={{ marginBottom: 10 }}>
          <span style={label}>Messages ({value.messages.length})</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {value.messages.map((m, i) => (
            <div
              key={i}
              style={{
                background: "#141821",
                border: `1px solid ${m.sender === "me" ? "#1e3a5f" : "#2a3240"}`,
                borderRadius: 8,
                padding: 10,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <select
                  style={{ ...input, width: 100, padding: "4px 6px", fontSize: 11 }}
                  value={m.sender}
                  onChange={(e) => setMsg(i, { sender: e.target.value as Sender })}
                >
                  <option value="me">Me</option>
                  <option value="them">Them</option>
                </select>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    style={{ ...button(), padding: "3px 7px", fontSize: 11 }}
                    onClick={() => moveMsg(i, -1)}
                    disabled={i === 0}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    style={{ ...button(), padding: "3px 7px", fontSize: 11 }}
                    onClick={() => moveMsg(i, 1)}
                    disabled={i === value.messages.length - 1}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    style={{ ...button("danger"), padding: "3px 7px", fontSize: 11 }}
                    onClick={() => removeMsg(i)}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <textarea
                style={{ ...input, minHeight: 52, resize: "vertical", fontFamily: "inherit" }}
                value={m.text}
                placeholder={m.sender === "me" ? "What you type…" : "Their reply…"}
                onChange={(e) => setMsg(i, { text: e.target.value })}
              />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          <button
            type="button"
            style={{ ...button(), flex: 1, padding: "8px 10px" }}
            onClick={() => addMsg("me")}
          >
            + Me
          </button>
          <button
            type="button"
            style={{ ...button(), flex: 1, padding: "8px 10px" }}
            onClick={() => addMsg("them")}
          >
            + Them
          </button>
        </div>
      </section>
    </div>
  );
};
