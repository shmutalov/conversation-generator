import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { Dialogue } from "../schema";
import type { Timeline } from "../timeline";
import { MessageStream } from "../components/MessageStream";
import { Caret } from "../components/Caret";
import { robotoStack } from "../fonts";

const palette = {
  dark: {
    bg: "#0e1621",
    wallpaper: "#0e1621",
    header: "#17212b",
    headerText: "#ffffff",
    subtle: "#708499",
    meBubble: "#2b5278",
    themBubble: "#182533",
    meText: "#ffffff",
    themText: "#ffffff",
    inputBg: "#17212b",
    border: "#1d2733",
    accent: "#64b5ef",
    timeOnMe: "rgba(180,211,255,0.85)",
    timeOnThem: "#708499",
  },
  light: {
    bg: "#e6ebee",
    wallpaper: "#e6ebee",
    header: "#ffffff",
    headerText: "#000000",
    subtle: "#707579",
    meBubble: "#eeffde",
    themBubble: "#ffffff",
    meText: "#000000",
    themText: "#000000",
    inputBg: "#ffffff",
    border: "#dadce0",
    accent: "#3390ec",
    timeOnMe: "#4fae4e",
    timeOnThem: "#9ea1a5",
  },
};

export const TelegramTemplate: React.FC<{
  dialogue: Dialogue;
  timeline: Timeline;
  width: number;
  height: number;
}> = ({ dialogue, timeline, width, height }) => {
  const frame = useCurrentFrame();
  const c = palette[dialogue.theme];

  const isThemTyping = timeline.events.some(
    (e) => e.sender === "them" && frame >= e.indicatorStart && frame < e.indicatorEnd,
  );

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
  const headerHeight = Math.round(height * 0.085);
  const inputHeight = Math.round(height * 0.085);
  const hhmm = "10:24";

  return (
    <AbsoluteFill
      style={{
        background: c.bg,
        color: c.headerText,
        fontFamily: robotoStack,
        fontSize: baseFont,
        lineHeight: 1.35,
      }}
    >
      <div
        style={{
          height: headerHeight,
          background: c.header,
          display: "flex",
          alignItems: "center",
          padding: "0 14px",
          gap: 12,
          flexShrink: 0,
          borderBottom: `1px solid ${c.border}`,
        }}
      >
        <span style={{ color: c.accent, fontSize: baseFont * 1.4 }}>‹</span>
        <div
          style={{
            width: headerHeight * 0.55,
            height: headerHeight * 0.55,
            borderRadius: "50%",
            background: c.accent,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 500,
            fontSize: baseFont * 1.1,
            flexShrink: 0,
          }}
        >
          {dialogue.contactName.charAt(0).toUpperCase()}
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 500, color: c.headerText }}>{dialogue.contactName}</span>
          <span
            style={{
              color: isThemTyping ? c.accent : c.subtle,
              fontSize: baseFont * 0.8,
            }}
          >
            {isThemTyping ? "typing…" : "last seen recently"}
          </span>
        </div>
        <span style={{ color: c.subtle, opacity: 0.85, fontSize: baseFont * 1.2 }}>⋯</span>
      </div>

      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          background: c.wallpaper,
        }}
      >
        <MessageStream
          events={timeline.events}
          gap={Math.round(baseFont * 0.3)}
          paddingTop={Math.round(baseFont * 0.9)}
          paddingBottom={Math.round(baseFont * 0.9)}
          paddingX={Math.round(width * 0.04)}
          renderMessage={({ event, state }) => {
            const isMe = event.sender === "me";
            const bg = isMe ? c.meBubble : c.themBubble;
            const txt = isMe ? c.meText : c.themText;
            const partial = state.kind === "typing" ? state.partial : event.text;
            const showCaret = state.kind === "typing";
            return (
              <div
                style={{
                  alignSelf: isMe ? "flex-end" : "flex-start",
                  maxWidth: "76%",
                  background: bg,
                  color: txt,
                  padding: `${baseFont * 0.4}px ${baseFont * 0.6}px ${baseFont * 0.25}px`,
                  borderRadius: 12,
                  borderBottomRightRadius: isMe ? 4 : 12,
                  borderBottomLeftRadius: isMe ? 12 : 4,
                  boxShadow:
                    dialogue.theme === "light"
                      ? "0 1px 1px rgba(0,0,0,0.08)"
                      : "0 1px 1px rgba(0,0,0,0.3)",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  position: "relative",
                  display: "inline-block",
                }}
              >
                <span>{partial}</span>
                {showCaret ? <Caret color={txt} width={2} /> : null}
                <span
                  style={{
                    display: "inline-block",
                    float: "right",
                    marginLeft: 10,
                    marginTop: 4,
                    fontSize: baseFont * 0.7,
                    color: isMe ? c.timeOnMe : c.timeOnThem,
                  }}
                >
                  {hhmm}
                  {isMe ? " ✓✓" : ""}
                </span>
                <span style={{ clear: "both", display: "block" }} />
              </div>
            );
          }}
        />
      </div>

      <div
        style={{
          flexShrink: 0,
          background: c.inputBg,
          padding: `${Math.round(baseFont * 0.5)}px ${Math.round(width * 0.025)}px`,
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderTop: `1px solid ${c.border}`,
        }}
      >
        <span style={{ color: c.subtle, fontSize: baseFont * 1.25 }}>📎</span>
        <div
          style={{
            flex: 1,
            background: c.inputBg,
            borderRadius: 20,
            minHeight: inputHeight * 0.7,
            padding: `${Math.round(baseFont * 0.45)}px ${Math.round(baseFont * 0.6)}px`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: c.headerText,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            {meTypingText ? (
              <>
                <span>{meTypingText}</span>
                <Caret color={c.headerText} width={2} />
              </>
            ) : (
              <span style={{ color: c.subtle }}>Message</span>
            )}
          </div>
          <span style={{ color: c.subtle, fontSize: baseFont * 1.1 }}>😊</span>
        </div>
        <div
          style={{
            width: inputHeight * 0.78,
            height: inputHeight * 0.78,
            borderRadius: "50%",
            background: c.accent,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: baseFont * 1.2,
            flexShrink: 0,
          }}
        >
          {meTypingText ? "➤" : "🎙"}
        </div>
      </div>
    </AbsoluteFill>
  );
};
