import React from "react";
import { Composition } from "remotion";
import { ConversationComposition } from "./Composition";
import { dialogueSchema, computeDimensions, type Dialogue } from "./schema";
import { buildTimeline } from "./timeline";

const defaultDialogue: Dialogue = {
  template: "chatgpt",
  resolution: "1080p",
  aspect: "portrait-9:16",
  fps: 30,
  theme: "dark",
  contactName: "ChatGPT",
  userName: "You",
  typeSpeedCps: 28,
  thinkingMs: 1400,
  pauseAfterMs: 700,
  responderReveal: "teletype",
  presentation: "fullscreen",
  backdrop: "gradient",
  messages: [
    { sender: "me", text: "Hey, can you help me plan a trip to Tokyo?" },
    {
      sender: "them",
      text: "Of course! How many days do you have, and what interests you most — food, culture, or nightlife?",
    },
    { sender: "me", text: "5 days. Mostly food and culture." },
    {
      sender: "them",
      text: "Great mix! Here's a rough outline:\n\nDay 1 – Asakusa & Senso-ji\nDay 2 – Tsukiji + Ginza\nDay 3 – Shibuya & Shinjuku\nDay 4 – Day trip to Kamakura\nDay 5 – Harajuku & Meiji Shrine\n\nWant me to add restaurant picks?",
    },
    { sender: "me", text: "Yes please!" },
  ],
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Conversation"
      component={ConversationComposition}
      schema={dialogueSchema}
      defaultProps={defaultDialogue}
      fps={defaultDialogue.fps}
      width={computeDimensions(defaultDialogue.resolution, defaultDialogue.aspect).width}
      height={computeDimensions(defaultDialogue.resolution, defaultDialogue.aspect).height}
      durationInFrames={buildTimeline(defaultDialogue).durationInFrames}
      calculateMetadata={({ props }) => {
        const dims = computeDimensions(props.resolution, props.aspect);
        const tl = buildTimeline(props);
        return {
          width: dims.width,
          height: dims.height,
          fps: props.fps,
          durationInFrames: tl.durationInFrames,
          props,
        };
      }}
    />
  );
};
