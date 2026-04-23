import React, { useState } from "react";
import { Editor } from "./Editor";
import { Preview } from "./Preview";
import { ExportPanel } from "./ExportPanel";
import { dialogueSchema, type Dialogue } from "@/schema";

const initialDialogue: Dialogue = dialogueSchema.parse({
  template: "chatgpt",
  resolution: "720p",
  aspect: "portrait-9:16",
  fps: 30,
  theme: "dark",
  contactName: "ChatGPT",
  userName: "You",
  typeSpeedCps: 30,
  thinkingMs: 1300,
  pauseAfterMs: 600,
  responderReveal: "teletype",
  presentation: "fullscreen",
  backdrop: "gradient",
  messages: [
    { sender: "me", text: "Hey, can you help me plan a trip to Tokyo?" },
    {
      sender: "them",
      text: "Of course! How many days, and what interests you — food, culture, or nightlife?",
    },
    { sender: "me", text: "5 days, mostly food and culture." },
  ],
});

export const App: React.FC = () => {
  const [dialogue, setDialogue] = useState<Dialogue>(initialDialogue);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(360px, 460px) 1fr",
        height: "100vh",
        gap: 0,
      }}
    >
      <aside
        style={{
          overflowY: "auto",
          borderRight: "1px solid #1f232b",
          background: "#0f1218",
        }}
      >
        <header
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #1f232b",
            position: "sticky",
            top: 0,
            background: "#0f1218",
            zIndex: 2,
          }}
        >
          <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
            Conversation Generator
          </h1>
          <p style={{ margin: "4px 0 0 0", fontSize: 12, color: "#8892a4" }}>
            Build animated messaging-app video conversations
          </p>
        </header>
        <Editor value={dialogue} onChange={setDialogue} />
        <ExportPanel dialogue={dialogue} />
      </aside>
      <main
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#05070b",
          padding: 24,
          overflow: "hidden",
        }}
      >
        <Preview dialogue={dialogue} />
      </main>
    </div>
  );
};
