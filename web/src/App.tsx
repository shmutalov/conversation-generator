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

const layoutCSS = `
.convgen-layout {
  display: grid;
  grid-template-columns: minmax(360px, 460px) 1fr;
  height: 100vh;
}
.convgen-editor {
  overflow-y: auto;
  border-right: 1px solid #1f232b;
  background: #0f1218;
  min-height: 0;
}
.convgen-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #05070b;
  padding: 24px;
  overflow: hidden;
  min-height: 0;
}
@media (max-width: 860px) {
  .convgen-layout {
    grid-template-columns: 1fr;
    grid-template-rows: 42vh minmax(0, 1fr);
  }
  .convgen-editor {
    order: 2;
    border-right: none;
    border-top: 1px solid #1f232b;
  }
  .convgen-preview {
    order: 1;
    padding: 10px;
  }
}
`;

export const App: React.FC = () => {
  const [dialogue, setDialogue] = useState<Dialogue>(initialDialogue);

  return (
    <>
      <style>{layoutCSS}</style>
      <div className="convgen-layout">
        <aside className="convgen-editor">
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
        <main className="convgen-preview">
          <Preview dialogue={dialogue} />
        </main>
      </div>
    </>
  );
};
