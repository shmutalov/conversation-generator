import type { Dialogue, Message, Sender } from "./schema";

export type MessageEvent = {
  index: number;
  sender: Sender;
  text: string;
  indicatorStart: number;
  indicatorEnd: number;
  typingStart: number;
  typingEnd: number;
  settledAt: number;
  pauseEnd: number;
};

export type Timeline = {
  events: MessageEvent[];
  durationInFrames: number;
  fps: number;
};

const TAIL_MS = 1400;

export function buildTimeline(dialogue: Dialogue): Timeline {
  const fps = dialogue.fps;
  const msToFrames = (ms: number) => Math.max(0, Math.round((ms / 1000) * fps));

  const events: MessageEvent[] = [];
  let cursor = 0;

  for (let i = 0; i < dialogue.messages.length; i++) {
    const m: Message = dialogue.messages[i];
    const isMe = m.sender === "me";
    const cps = m.typeSpeedCps ?? dialogue.typeSpeedCps;
    const charCount = Array.from(m.text).length;
    const instant = m.deliveredInstantly === true;
    const responderInstant = !isMe && dialogue.responderReveal === "instant";
    const typeMs = instant || responderInstant ? 0 : (charCount / cps) * 1000;
    const typeFrames = msToFrames(typeMs);

    const thinkMs = isMe ? 0 : m.thinkingMs ?? dialogue.thinkingMs;
    const thinkFrames = msToFrames(thinkMs);

    const pauseMs = m.pauseAfterMs ?? dialogue.pauseAfterMs;
    const pauseFrames = msToFrames(pauseMs);

    const indicatorStart = isMe ? -1 : cursor;
    const indicatorEnd = isMe ? -1 : cursor + thinkFrames;
    const typingStart = cursor + thinkFrames;
    const typingEnd = typingStart + typeFrames;
    const settledAt = typingEnd;
    const pauseEnd = settledAt + pauseFrames;

    events.push({
      index: i,
      sender: m.sender,
      text: m.text,
      indicatorStart,
      indicatorEnd,
      typingStart,
      typingEnd,
      settledAt,
      pauseEnd,
    });

    cursor = pauseEnd;
  }

  const tail = msToFrames(TAIL_MS);
  const durationInFrames = Math.max(cursor + tail, Math.max(60, fps * 2));

  return { events, durationInFrames, fps };
}

export function partialText(event: MessageEvent, frame: number): string {
  if (frame >= event.typingEnd) return event.text;
  if (frame <= event.typingStart) return "";
  const total = Math.max(1, event.typingEnd - event.typingStart);
  const progress = (frame - event.typingStart) / total;
  const chars = Array.from(event.text);
  const n = Math.max(0, Math.min(chars.length, Math.floor(progress * chars.length)));
  return chars.slice(0, n).join("");
}

export type MessageVisualState =
  | { kind: "hidden" }
  | { kind: "indicator" }
  | { kind: "typing"; partial: string }
  | { kind: "settled" };

export function stateAt(event: MessageEvent, frame: number): MessageVisualState {
  if (frame < event.indicatorStart && event.indicatorStart >= 0) return { kind: "hidden" };
  if (event.sender === "me" && frame < event.typingStart) return { kind: "hidden" };
  if (event.sender === "them" && frame < event.indicatorEnd) return { kind: "indicator" };
  if (frame < event.typingEnd) {
    return { kind: "typing", partial: partialText(event, frame) };
  }
  return { kind: "settled" };
}
