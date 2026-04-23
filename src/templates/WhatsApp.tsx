import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { Dialogue } from "../schema";
import type { Timeline } from "../timeline";
import { MessageStream } from "../components/MessageStream";
import { Caret } from "../components/Caret";
import { robotoStack } from "../fonts";

const palette = {
  dark: {
    bg: "#0b141a",
    wallpaper: "#0b141a",
    header: "#202c33",
    headerText: "#e9edef",
    subtle: "#8696a0",
    meBubble: "#005c4b",
    themBubble: "#202c33",
    meText: "#e9edef",
    themText: "#e9edef",
    inputBg: "#202c33",
    border: "#2a373f",
    accent: "#00a884",
  },
  light: {
    bg: "#efeae2",
    wallpaper: "#efeae2",
    header: "#f0f2f5",
    headerText: "#111b21",
    subtle: "#667781",
    meBubble: "#d9fdd3",
    themBubble: "#ffffff",
    meText: "#111b21",
    themText: "#111b21",
    inputBg: "#f0f2f5",
    border: "#d1d7db",
    accent: "#00a884",
  },
};

export const WhatsAppTemplate: React.FC<{
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
  const inputHeight = Math.round(height * 0.08);

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
        <span style={{ color: c.headerText, fontSize: baseFont * 1.4 }}>‹</span>
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
            fontWeight: 600,
            fontSize: baseFont * 1.1,
            flexShrink: 0,
          }}
        >
          {dialogue.contactName.charAt(0).toUpperCase()}
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          <span style={{ fontWeight: 600, color: c.headerText }}>{dialogue.contactName}</span>
          <span
            style={{
              color: isThemTyping ? c.accent : c.subtle,
              fontSize: baseFont * 0.8,
            }}
          >
            {isThemTyping ? "typing…" : "online"}
          </span>
        </div>
        <span style={{ color: c.headerText, opacity: 0.85, fontSize: baseFont * 1.2 }}>📹</span>
        <span style={{ color: c.headerText, opacity: 0.85, fontSize: baseFont * 1.2 }}>📞</span>
      </div>

      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          background: c.wallpaper,
          backgroundImage:
            dialogue.theme === "dark"
              ? "radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)"
              : "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        <MessageStream
          events={timeline.events}
          gap={Math.round(baseFont * 0.45)}
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
                  maxWidth: "78%",
                  background: bg,
                  color: txt,
                  padding: `${baseFont * 0.45}px ${baseFont * 0.65}px ${baseFont * 0.25}px`,
                  borderRadius: 10,
                  borderTopRightRadius: isMe ? 2 : 10,
                  borderTopLeftRadius: isMe ? 10 : 2,
                  boxShadow: "0 1px 0.5px rgba(0,0,0,0.2)",
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
                    marginTop: 6,
                    fontSize: baseFont * 0.7,
                    color: isMe ? "rgba(233,237,239,0.7)" : c.subtle,
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
          background: c.bg,
          padding: `${Math.round(baseFont * 0.5)}px ${Math.round(width * 0.025)}px`,
          display: "flex",
          alignItems: "center",
          gap: 8,
          borderTop: `1px solid ${c.border}`,
        }}
      >
        <div
          style={{
            flex: 1,
            background: c.inputBg,
            borderRadius: 24,
            minHeight: inputHeight * 0.7,
            padding: `${Math.round(baseFont * 0.45)}px ${Math.round(baseFont * 0.8)}px`,
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: c.headerText,
          }}
        >
          <span style={{ color: c.subtle }}>😊</span>
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
          <span style={{ color: c.subtle }}>📎</span>
        </div>
        <div
          style={{
            width: inputHeight * 0.85,
            height: inputHeight * 0.85,
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
          {meTypingText ? "➤" : "🎤"}
        </div>
      </div>
    </AbsoluteFill>
  );
};
