import React from "react";
import { useCurrentFrame } from "remotion";

export const TypingDots: React.FC<{ color?: string; size?: number }> = ({
  color = "#9aa0a6",
  size = 8,
}) => {
  const frame = useCurrentFrame();
  const phase = (i: number) => {
    const t = (frame / 6 + i * 0.6) % (Math.PI * 2);
    return (Math.sin(t) + 1) / 2;
  };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.6 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            background: color,
            opacity: 0.4 + phase(i) * 0.6,
            transform: `translateY(${-phase(i) * size * 0.25}px)`,
          }}
        />
      ))}
    </div>
  );
};
