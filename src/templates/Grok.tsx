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
    bg: "#000000",
    panel: "#16181c",
    text: "#e7e9ea",
    textSubtle: "#71767b",
    userBubble: "#16181c",
    border: "#2f3336",
    inputBg: "#16181c",
    accent: "#ffffff",
  },
  light: {
    bg: "#ffffff",
    panel: "#f7f9f9",
    text: "#0f1419",
    textSubtle: "#536471",
    userBubble: "#eff3f4",
    border: "#eff3f4",
    inputBg: "#f7f9f9",
    accent: "#0f1419",
  },
};

const GrokBadge: React.FC<{ color: string; bg: string; size: number }> = ({
  color,
  bg,
  size,
}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: bg,
      color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      fontSize: size * 0.55,
      letterSpacing: "-0.05em",
      flexShrink: 0,
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
    }}
  >
    𝕏
  </div>
);

export const GrokTemplate: React.FC<{
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
  const inputHeight = Math.round(height * 0.13);

  return (
    <AbsoluteFill
      style={{
        background: c.bg,
        color: c.text,
        fontFamily: sansStack,
        fontSize: baseFont,
        lineHeight: 1.45,
      }}
    >
      <div
        style={{
          height: headerHeight,
          borderBottom: `1px solid ${c.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: baseFont * 1.1 }}>Grok</span>
          <span style={{ color: c.textSubtle, fontSize: baseFont * 0.85 }}>4 ▾</span>
        </div>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: c.panel,
            color: c.text,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: baseFont * 0.8,
            fontWeight: 600,
            border: `1px solid ${c.border}`,
          }}
        >
          {dialogue.userName.charAt(0).toUpperCase()}
        </div>
      </div>

      <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
        <MessageStream
          events={timeline.events}
          gap={Math.round(baseFont * 1.1)}
          paddingTop={Math.round(baseFont * 1.3)}
          paddingBottom={Math.round(baseFont * 1.0)}
          paddingX={Math.round(width * 0.06)}
          renderIndicator={() => (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <GrokBadge color={c.bg} bg={c.accent} size={baseFont * 1.8} />
              <div style={{ paddingTop: 10 }}>
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
                    padding: `${baseFont * 0.6}px ${baseFont * 0.95}px`,
                    borderRadius: 20,
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
                <GrokBadge color={c.bg} bg={c.accent} size={baseFont * 1.8} />
                <div
                  style={{
                    color: c.text,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    paddingTop: 3,
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
          padding: `${Math.round(baseFont * 0.7)}px ${Math.round(width * 0.05)}px ${Math.round(
            baseFont * 1.3,
          )}px`,
          borderTop: `1px solid ${c.border}`,
        }}
      >
        <div
          style={{
            background: c.inputBg,
            border: `1px solid ${c.border}`,
            borderRadius: 24,
            padding: `${Math.round(baseFont * 0.75)}px ${Math.round(baseFont * 1.1)}px`,
            minHeight: inputHeight * 0.5,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: c.text,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            {meTypingText ? (
              <>
                <span>{meTypingText}</span>
                <Caret color={c.text} width={2} />
              </>
            ) : (
              <span style={{ color: c.textSubtle }}>Ask anything</span>
            )}
          </div>
          <div
            style={{
              width: baseFont * 1.7,
              height: baseFont * 1.7,
              borderRadius: "50%",
              background: meTypingText ? c.accent : c.border,
              color: c.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            ↑
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
