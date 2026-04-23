import React, { useMemo } from "react";
import { Player } from "@remotion/player";
import { ConversationComposition } from "@/Composition";
import { buildTimeline } from "@/timeline";
import { computeDimensions, type Dialogue } from "@/schema";

export const Preview: React.FC<{ dialogue: Dialogue }> = ({ dialogue }) => {
  const { width, height } = useMemo(
    () => computeDimensions(dialogue.resolution, dialogue.aspect),
    [dialogue.resolution, dialogue.aspect],
  );
  const duration = useMemo(() => buildTimeline(dialogue).durationInFrames, [dialogue]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        width: "100%",
        height: "100%",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: "100%",
          maxHeight: "100%",
          aspectRatio: `${width} / ${height}`,
          width: height > width ? "auto" : "min(960px, 90%)",
          height: height > width ? "min(90%, 900px)" : "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <Player
          component={ConversationComposition}
          inputProps={dialogue}
          durationInFrames={duration}
          fps={dialogue.fps}
          compositionWidth={width}
          compositionHeight={height}
          style={{ width: "100%", height: "100%" }}
          controls
          autoPlay
          loop
        />
      </div>
      <div style={{ fontSize: 12, color: "#8892a4" }}>
        {width}×{height} · {dialogue.fps}fps · {(duration / dialogue.fps).toFixed(1)}s
      </div>
    </div>
  );
};
