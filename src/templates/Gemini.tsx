import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { Dialogue } from "../schema";
import type { Timeline } from "../timeline";
import { MessageStream } from "../components/MessageStream";
import { TypingDots } from "../components/TypingDots";
import { Caret } from "../components/Caret";
import { sansStack } from "../fonts";

const palette = {
  dark: {
    bg: "#131314",
    panel: "#1e1f20",
    text: "#e3e3e3",
    textSubtle: "#9aa0a6",
    userBubble: "#1e1f20",
    border: "#2a2b2d",
    inputBg: "#1e1f20",
    accent: "#8ab4f8",
  },
  light: {
    bg: "#ffffff",
    panel: "#f0f4f9",
    text: "#1f1f1f",
    textSubtle: "#5f6368",
    userBubble: "#e8f0fe",
    border: "#dadce0",
    inputBg: "#f0f4f9",
    accent: "#1a73e8",
  },
};

const GeminiSparkle: React.FC<{ size: number }> = ({ size }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    style={{ flexShrink: 0 }}
    aria-hidden
  >
    <defs>
      <linearGradient id="geminiGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#4285F4" />
        <stop offset="40%" stopColor="#9B72CB" />
        <stop offset="80%" stopColor="#D96570" />
        <stop offset="100%" stopColor="#F4B400" />
      </linearGradient>
    </defs>
    <path
      d="M12 2 L13.5 9.5 L21 11 L13.5 12.5 L12 20 L10.5 12.5 L3 11 L10.5 9.5 Z"
      fill="url(#geminiGrad)"
    />
  </svg>
);

export const GeminiTemplate: React.FC<{
  dialogue: Dialogue;
  timeline: Timeline;
  width: number;
  height: number;
}> = ({ dialogue, timeline, width, height }) => {
  const frame = useCurrentFrame();
  const c = palette[dialogue.theme];

  const activeMe = timeline.events.find(
    (e) => e.sender === "me" && frame >= e.typingStart && frame < e.typingEnd,
  );
  const meTypingText = activeMe
    ? Array.from(activeMe.text)
        .slice(
          0,
          Math.floor(
            ((frame - activeMe.typingStart) /
              Math.max(1, activeMe.typingEnd - activeMe.typingStart)) *
              Array.from(activeMe.text).length,
          ),
        )
        .join("")
    : "";

  const baseFont = Math.max(14, Math.round(height * 0.022));
  const headerHeight = Math.round(height * 0.075);
  const inputHeight = Math.round(height * 0.12);

  return (
    <AbsoluteFill
      style={{
        background: c.bg,
        color: c.text,
        fontFamily: sansStack,
        fontSize: baseFont,
        lineHeight: 1.5,
      }}
    >
      <div
        style={{
          height: headerHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: baseFont * 1.3, color: c.textSubtle }}>☰</span>
          <span
            style={{
              fontSize: baseFont * 1.2,
              fontWeight: 500,
              background:
                "linear-gradient(90deg, #4285F4 0%, #9B72CB 40%, #D96570 80%, #F4B400 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Gemini
          </span>
          <span style={{ color: c.textSubtle, fontSize: baseFont * 0.85 }}>2.5 Pro ▾</span>
        </div>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: c.accent,
            color: dialogue.theme === "dark" ? "#131314" : "#ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: baseFont * 0.8,
            fontWeight: 600,
          }}
        >
          {dialogue.userName.charAt(0).toUpperCase()}
        </div>
      </div>

      <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
        <MessageStream
          events={timeline.events}
          gap={Math.round(baseFont * 1.0)}
          paddingTop={Math.round(baseFont * 0.9)}
          paddingBottom={Math.round(baseFont * 1.0)}
          paddingX={Math.round(width * 0.06)}
          renderIndicator={() => (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <GeminiSparkle size={baseFont * 1.8} />
              <div style={{ paddingTop: 8 }}>
                <TypingDots color={c.textSubtle} size={7} />
              </div>
            </div>
          )}
          renderMessage={({ event, state }) => {
            if (event.sender === "me") {
              return (
                <div
                  style={{
                    alignSelf: "flex-end",
                    maxWidth: "78%",
                    background: c.userBubble,
                    color: c.text,
                    padding: `${baseFont * 0.65}px ${baseFont * 1.0}px`,
                    borderRadius: 22,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {event.text}
                </div>
              );
            }
            const partial = state.kind === "typing" ? state.partial : event.text;
            const showCaret = state.kind === "typing";
            return (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  maxWidth: "92%",
                }}
              >
                <GeminiSparkle size={baseFont * 1.8} />
                <div
                  style={{
                    color: c.text,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    paddingTop: 4,
                  }}
                >
                  {partial}
                  {showCaret ? <Caret color={c.text} width={2} /> : null}
                </div>
              </div>
            );
          }}
        />
      </div>

      <div
        style={{
          flexShrink: 0,
          padding: `${Math.round(baseFont * 0.5)}px ${Math.round(width * 0.05)}px ${Math.round(
            baseFont * 1.2,
          )}px`,
        }}
      >
        <div
          style={{
            background: c.inputBg,
            borderRadius: 26,
            padding: `${Math.round(baseFont * 0.7)}px ${Math.round(baseFont * 1.1)}px`,
            minHeight: inputHeight * 0.55,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: c.text,
            border: `1px solid ${c.border}`,
          }}
        >
          <span style={{ color: c.textSubtle, flexShrink: 0 }}>＋</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            {meTypingText ? (
              <>
                <span>{meTypingText}</span>
                <Caret color={c.text} width={2} />
              </>
            ) : (
              <span style={{ color: c.textSubtle }}>Ask Gemini</span>
            )}
          </div>
          <span style={{ color: c.textSubtle, fontSize: baseFont * 1.1, flexShrink: 0 }}>🎙</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
