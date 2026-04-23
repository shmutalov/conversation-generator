import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const RevealWrapper: React.FC<{
  appearAt: number;
  children: React.ReactNode;
  slide?: number;
}> = ({ appearAt, children, slide = 10 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < appearAt) return null;
  const t = spring({
    frame: frame - appearAt,
    fps,
    config: { damping: 200, stiffness: 160, mass: 0.6 },
  });
  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: `${t}fr`,
        opacity: t,
        willChange: "grid-template-rows, opacity",
      }}
    >
      <div
        style={{
          overflow: "hidden",
          minHeight: 0,
          transform: `translateY(${(1 - t) * slide}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
};
