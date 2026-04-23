import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { Dialogue } from "../schema";
import type { Timeline } from "../timeline";
import { MessageStream } from "../components/MessageStream";
import { TypingDots } from "../components/TypingDots";
import { Caret } from "../components/Caret";
import { serifStack } from "../fonts";

const palette = {
  dark: {
    bg: "#262624",
    panel: "#30302e",
    text: "#f0eee6",
    textSubtle: "#a29e94",
    userBubble: "#30302e",
    border: "#3a3a38",
    inputBg: "#30302e",
    accent: "#c15f3c",
  },
  light: {
    bg: "#faf9f5",
    panel: "#f0eee6",
    text: "#3d3929",
    textSubtle: "#85817a",
    userBubble: "#f0eee6",
    border: "#e5e2d4",
    inputBg: "#ffffff",
    accent: "#c15f3c",
  },
};

const ClaudeBadge: React.FC<{ color: string; bg: string; size: number }> = ({
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
      fontSize: size * 0.55,
      fontWeight: 700,
      flexShrink: 0,
    }}
  >
    ✦
  </div>
);

export const ClaudeTemplate: React.FC<{
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
  const headerHeight = Math.round(height * 0.09);
  const inputHeight = Math.round(height * 0.14);

  return (
    <AbsoluteFill
      style={{
        background: c.bg,
        color: c.text,
        fontFamily: serifStack,
        fontSize: baseFont,
        lineHeight: 1.5,
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
          lineHeight: 1,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, lineHeight: 1 }}>
          <ClaudeBadge color="#fff" bg={c.accent} size={baseFont * 1.3} />
          <span style={{ fontWeight: 600, fontSize: baseFont * 1.05, lineHeight: 1 }}>Claude</span>
          <span style={{ color: c.textSubtle, fontSize: baseFont * 0.85, lineHeight: 1 }}>
            Sonnet 4.6 ▾
          </span>
        </div>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: c.accent,
            color: "#fff",
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
          gap={Math.round(baseFont * 1.1)}
          paddingTop={Math.round(baseFont * 1.4)}
          paddingBottom={Math.round(baseFont * 1.2)}
          paddingX={Math.round(width * 0.07)}
          renderIndicator={() => (
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <ClaudeBadge color="#fff" bg={c.accent} size={baseFont * 1.6} />
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
                    border: `1px solid ${c.border}`,
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
                <ClaudeBadge color="#fff" bg={c.accent} size={baseFont * 1.6} />
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
          padding: `${Math.round(baseFont * 0.7)}px ${Math.round(width * 0.07)}px ${Math.round(
            baseFont * 1.3,
          )}px`,
        }}
      >
        <div
          style={{
            background: c.inputBg,
            border: `1px solid ${c.border}`,
            borderRadius: 16,
            padding: `${Math.round(baseFont * 0.9)}px ${Math.round(baseFont * 1.1)}px`,
            minHeight: inputHeight * 0.55,
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
              <span style={{ color: c.textSubtle }}>Reply to Claude…</span>
            )}
          </div>
          <div
            style={{
              width: baseFont * 1.7,
              height: baseFont * 1.7,
              borderRadius: 10,
              background: meTypingText ? c.accent : c.border,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
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
