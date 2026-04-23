import React from "react";
import { useVideoConfig } from "remotion";
import type { Dialogue } from "./schema";
import { buildTimeline, type Timeline } from "./timeline";
import { ChatGPTTemplate } from "./templates/ChatGPT";
import { ClaudeTemplate } from "./templates/Claude";
import { GeminiTemplate } from "./templates/Gemini";
import { GrokTemplate } from "./templates/Grok";
import { WhatsAppTemplate } from "./templates/WhatsApp";
import { IMessageTemplate } from "./templates/iMessage";
import { TelegramTemplate } from "./templates/Telegram";
import { PhoneFrame } from "./components/PhoneFrame";

const renderTemplate = (
  dialogue: Dialogue,
  timeline: Timeline,
  width: number,
  height: number,
) => {
  const p = { dialogue, timeline, width, height };
  switch (dialogue.template) {
    case "chatgpt":
      return <ChatGPTTemplate {...p} />;
    case "claude":
      return <ClaudeTemplate {...p} />;
    case "gemini":
      return <GeminiTemplate {...p} />;
    case "grok":
      return <GrokTemplate {...p} />;
    case "whatsapp":
      return <WhatsAppTemplate {...p} />;
    case "imessage":
      return <IMessageTemplate {...p} />;
    case "telegram":
      return <TelegramTemplate {...p} />;
  }
};

export const ConversationComposition: React.FC<Dialogue> = (dialogue) => {
  const { width, height } = useVideoConfig();
  const timeline = buildTimeline(dialogue);

  if (dialogue.presentation === "phone-mockup") {
    return (
      <PhoneFrame canvasWidth={width} canvasHeight={height} backdrop={dialogue.backdrop}>
        {({ width: iw, height: ih }) => renderTemplate(dialogue, timeline, iw, ih)}
      </PhoneFrame>
    );
  }

  return renderTemplate(dialogue, timeline, width, height);
};
