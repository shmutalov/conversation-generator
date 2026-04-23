import React from "react";
import { useCurrentFrame } from "remotion";
import type { MessageEvent } from "../timeline";
import { stateAt } from "../timeline";
import { RevealWrapper } from "./RevealWrapper";

export type RenderedMessage = {
  event: MessageEvent;
  state: ReturnType<typeof stateAt>;
};

export const MessageStream: React.FC<{
  events: MessageEvent[];
  renderMessage: (r: RenderedMessage) => React.ReactNode;
  renderIndicator?: (e: MessageEvent) => React.ReactNode;
  gap?: number;
  paddingBottom?: number;
  paddingTop?: number;
  paddingX?: number;
}> = ({
  events,
  renderMessage,
  renderIndicator,
  gap = 10,
  paddingBottom = 20,
  paddingTop = 20,
  paddingX = 16,
}) => {
  const frame = useCurrentFrame();
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: `${paddingTop}px ${paddingX}px ${paddingBottom}px`,
        gap,
      }}
    >
      {events.map((ev) => {
        const s = stateAt(ev, frame);
        if (s.kind === "hidden") return null;
        if (s.kind === "indicator") {
          return (
            <RevealWrapper key={`ind-${ev.index}`} appearAt={ev.indicatorStart}>
              {renderIndicator ? renderIndicator(ev) : null}
            </RevealWrapper>
          );
        }
        const appearAt = ev.sender === "me" ? ev.typingEnd : ev.typingStart;
        return (
          <RevealWrapper key={`msg-${ev.index}`} appearAt={appearAt}>
            {renderMessage({ event: ev, state: s })}
          </RevealWrapper>
        );
      })}
    </div>
  );
};
