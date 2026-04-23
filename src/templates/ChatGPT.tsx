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
    bg: "#212121",
    panel: "#2f2f2f",
    text: "#ececec",
    textSubtle: "#b4b4b4",
    userBubble: "#2f2f2f",
    border: "#3d3d3d",
    inputBg: "#303030",
    accent: "#10a37f",
  },
  light: {
    bg: "#ffffff",
    panel: "#f4f4f4",
    text: "#0d0d0d",
    textSubtle: "#6e6e80",
    userBubble: "#f4f4f4",
    border: "#e5e5e5",
    inputBg: "#f4f4f4",
    accent: "#10a37f",
  },
};

const GPTBadge: React.FC<{ color: string; bg: string }> = ({ color, bg }) => (
  <div
    style={{
      width: 30,
      height: 30,
      borderRadius: "50%",
      background: bg,
      color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 14,
      fontWeight: 700,
      flexShrink: 0,
    }}
  >
    ★
  </div>
);

export const ChatGPTTemplate: React.FC<{
  dialogue: Dialogue;
  timeline: Timeline;
  width: number;
  height: number;
}> = ({ dialogue, timeline, width, height }) => {
  const frame = useCurrentFrame();
  const c = palette[dialogue.theme];

  const activeMeTyping = timeline.events.find(
    (e) => e.sender === "me" && frame >= e.typingStart && frame < e.typingEnd,
  );
  const meTypingText = activeMeTyping
    ? Array.from(activeMeTyping.text)
        .slice(
          0,
          Math.floor(
            ((frame - activeMeTyping.typingStart) /
              Math.max(1, activeMeTyping.typingEnd - activeMeTyping.typingStart)) *
              Array.from(activeMeTyping.text).length,
          ),
        )
        .join("")
    : "";

  const baseFont = Math.max(14, Math.round(height * 0.022));
  const headerHeight = Math.round(height * 0.075);
  const inputHeight = Math.round(height * 0.14);

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
          borderBottom: `1px solid ${c.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontWeight: 600, fontSize: baseFont * 1.05 }}>ChatGPT</span>
          <span style={{ color: c.textSubtle, fontSize: baseFont * 0.85 }}>4o ▾</span>
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
          paddingX={Math.round(width * 0.06)}
          renderIndicator={(ev) => (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                maxWidth: "85%",
              }}
            >
              <GPTBadge color="#fff" bg={c.accent} />
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
                    padding: `${baseFont * 0.6}px ${baseFont * 0.9}px`,
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
                <GPTBadge color="#fff" bg={c.accent} />
                <div
                  style={{
                    color: c.text,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    paddingTop: 2,
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
          padding: `${Math.round(baseFont * 0.6)}px ${Math.round(width * 0.06)}px ${Math.round(
            baseFont * 1.2,
          )}px`,
          borderTop: `1px solid ${c.border}`,
        }}
      >
        <div
          style={{
            background: c.inputBg,
            borderRadius: 28,
            padding: `${Math.round(baseFont * 0.7)}px ${Math.round(baseFont * 1.1)}px`,
            minHeight: inputHeight * 0.45,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: c.text,
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
              <span style={{ color: c.textSubtle }}>Message ChatGPT…</span>
            )}
          </div>
          <div
            style={{
              width: baseFont * 1.6,
              height: baseFont * 1.6,
              borderRadius: "50%",
              background: meTypingText ? c.text : c.textSubtle,
              color: c.bg,
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
