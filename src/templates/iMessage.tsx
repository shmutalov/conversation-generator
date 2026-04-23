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
    header: "#0b0b0b",
    headerText: "#ffffff",
    subtle: "#8e8e93",
    meBubble: "#0A84FF",
    themBubble: "#26252a",
    meText: "#ffffff",
    themText: "#ffffff",
    inputBg: "#1c1c1e",
    inputBorder: "#2c2c2e",
    border: "#1c1c1e",
    send: "#0A84FF",
  },
  light: {
    bg: "#ffffff",
    header: "#f6f6f6",
    headerText: "#000000",
    subtle: "#8e8e93",
    meBubble: "#0b93f6",
    themBubble: "#e9e9eb",
    meText: "#ffffff",
    themText: "#000000",
    inputBg: "#ffffff",
    inputBorder: "#dcdcdc",
    border: "#d1d1d6",
    send: "#0b93f6",
  },
};

export const IMessageTemplate: React.FC<{
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

  const baseFont = Math.max(14, Math.round(height * 0.023));
  const headerHeight = Math.round(height * 0.12);
  const inputHeight = Math.round(height * 0.09);

  return (
    <AbsoluteFill
      style={{
        background: c.bg,
        color: c.headerText,
        fontFamily: sansStack,
        fontSize: baseFont,
        lineHeight: 1.35,
      }}
    >
      <div
        style={{
          height: headerHeight,
          background: c.header,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 14px",
          flexShrink: 0,
          borderBottom: `1px solid ${c.border}`,
          position: "relative",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: 18,
            top: "50%",
            transform: "translateY(-50%)",
            color: c.send,
            fontSize: baseFont * 1.6,
          }}
        >
          ‹
        </span>
        <div
          style={{
            width: headerHeight * 0.48,
            height: headerHeight * 0.48,
            borderRadius: "50%",
            background: c.subtle,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: baseFont,
            marginBottom: 4,
          }}
        >
          {dialogue.contactName.charAt(0).toUpperCase()}
        </div>
        <div
          style={{
            fontSize: baseFont * 0.8,
            color: c.headerText,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>{dialogue.contactName}</span>
          <span style={{ color: c.subtle }}>›</span>
        </div>
      </div>

      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: 0,
        }}
      >
        <MessageStream
          events={timeline.events}
          gap={Math.round(baseFont * 0.35)}
          paddingTop={Math.round(baseFont * 1.0)}
          paddingBottom={Math.round(baseFont * 1.0)}
          paddingX={Math.round(width * 0.05)}
          renderIndicator={() => (
            <div
              style={{
                alignSelf: "flex-start",
                background: c.themBubble,
                borderRadius: 18,
                padding: `${baseFont * 0.6}px ${baseFont * 1.0}px`,
                display: "flex",
                alignItems: "center",
              }}
            >
              <TypingDots color={c.subtle} size={baseFont * 0.45} />
            </div>
          )}
          renderMessage={({ event, state }) => {
            const isMe = event.sender === "me";
            const bg = isMe ? c.meBubble : c.themBubble;
            const txt = isMe ? c.meText : c.themText;
            const partial = state.kind === "typing" ? state.partial : event.text;
            const showCaret = state.kind === "typing" && !isMe;
            return (
              <div
                style={{
                  alignSelf: isMe ? "flex-end" : "flex-start",
                  maxWidth: "74%",
                  background: bg,
                  color: txt,
                  padding: `${baseFont * 0.5}px ${baseFont * 0.85}px`,
                  borderRadius: 20,
                  borderBottomRightRadius: isMe ? 6 : 20,
                  borderBottomLeftRadius: isMe ? 20 : 6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                <span>{partial}</span>
                {showCaret ? <Caret color={txt} width={2} /> : null}
              </div>
            );
          }}
        />
      </div>

      <div
        style={{
          flexShrink: 0,
          background: c.bg,
          padding: `${Math.round(baseFont * 0.55)}px ${Math.round(width * 0.03)}px ${Math.round(
            baseFont * 0.9,
          )}px`,
          display: "flex",
          alignItems: "center",
          gap: 10,
          borderTop: `1px solid ${c.border}`,
        }}
      >
        <div
          style={{
            width: inputHeight * 0.7,
            height: inputHeight * 0.7,
            borderRadius: "50%",
            background: c.themBubble,
            color: c.headerText,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: baseFont * 1.2,
            flexShrink: 0,
          }}
        >
          +
        </div>
        <div
          style={{
            flex: 1,
            background: c.inputBg,
            border: `1px solid ${c.inputBorder}`,
            borderRadius: 24,
            minHeight: inputHeight * 0.65,
            padding: `${Math.round(baseFont * 0.42)}px ${Math.round(baseFont * 0.8)}px`,
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
              <span style={{ color: c.subtle }}>iMessage</span>
            )}
          </div>
          <span
            style={{
              color: meTypingText ? c.send : c.subtle,
              fontWeight: 700,
              fontSize: baseFont * 1.1,
            }}
          >
            {meTypingText ? "↑" : "🎙"}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
