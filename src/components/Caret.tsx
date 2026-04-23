import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

export const Caret: React.FC<{ color?: string; height?: number; width?: number }> = ({
  color = "currentColor",
  height = "1em",
  width = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const blink = Math.floor((frame / fps) * 2) % 2 === 0;
  return (
    <span
      style={{
        display: "inline-block",
        width,
        height,
        background: color,
        verticalAlign: "text-bottom",
        marginLeft: 2,
        opacity: blink ? 1 : 0,
        borderRadius: 1,
      }}
    />
  );
};
