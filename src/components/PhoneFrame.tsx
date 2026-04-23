import React from "react";

const backdropFor = (backdrop: string): string => {
  if (backdrop === "gradient") {
    return "linear-gradient(135deg, #0f1218 0%, #1a2034 50%, #0b0e14 100%)";
  }
  if (backdrop === "solid") return "#0b0d12";
  if (backdrop === "light") {
    return "linear-gradient(135deg, #f3f4f7 0%, #e1e5ee 100%)";
  }
  return backdrop;
};

export const PhoneFrame: React.FC<{
  canvasWidth: number;
  canvasHeight: number;
  backdrop: string;
  children: (inner: { width: number; height: number }) => React.ReactNode;
}> = ({ canvasWidth, canvasHeight, backdrop, children }) => {
  const margin = Math.round(Math.min(canvasWidth, canvasHeight) * 0.05);
  const phoneRatio = 9 / 19.5;

  let phoneHeight = canvasHeight - margin * 2;
  let phoneWidth = Math.round(phoneHeight * phoneRatio);
  if (phoneWidth > canvasWidth * 0.55) {
    phoneWidth = Math.round(canvasWidth * 0.55);
    phoneHeight = Math.round(phoneWidth / phoneRatio);
  }

  const bezel = Math.max(6, Math.round(phoneWidth * 0.03));
  const outerRadius = Math.round(phoneWidth * 0.13);
  const innerRadius = Math.max(0, outerRadius - bezel);
  const notchWidth = Math.round(phoneWidth * 0.33);
  const notchHeight = Math.round(phoneWidth * 0.085);

  const innerWidth = phoneWidth - bezel * 2;
  const innerHeight = phoneHeight - bezel * 2;

  const statusBarHeight = notchHeight + Math.round(phoneWidth * 0.05);
  const contentHeight = innerHeight - statusBarHeight;

  const statusFont = Math.max(9, Math.round(phoneWidth * 0.038));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: backdropFor(backdrop),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: phoneWidth,
          height: phoneHeight,
          background: "#0a0a0a",
          borderRadius: outerRadius,
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.55), 0 0 0 1.5px rgba(255,255,255,0.06) inset, 0 1px 0 rgba(255,255,255,0.1) inset",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: bezel,
            left: bezel,
            width: innerWidth,
            height: innerHeight,
            overflow: "hidden",
            borderRadius: innerRadius,
            background: "#000",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              position: "relative",
              height: statusBarHeight,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: `0 ${Math.round(phoneWidth * 0.08)}px`,
              color: "#ffffff",
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, Arial, sans-serif",
              fontSize: statusFont,
              fontWeight: 600,
              zIndex: 20,
              background: "#000",
            }}
          >
            <span>9:41</span>
            <span style={{ opacity: 0.9 }}>●●●●● ▪ 🔋</span>
            <div
              style={{
                position: "absolute",
                top: Math.round(statusBarHeight * 0.14),
                left: "50%",
                transform: "translateX(-50%)",
                width: notchWidth,
                height: notchHeight,
                background: "#000",
                borderRadius: notchHeight,
                zIndex: 30,
                boxShadow: "0 0 0 1px rgba(255,255,255,0.04)",
              }}
            />
          </div>
          <div
            style={{
              position: "relative",
              width: innerWidth,
              height: contentHeight,
              flexShrink: 0,
            }}
          >
            {children({ width: innerWidth, height: contentHeight })}
          </div>
        </div>
      </div>
    </div>
  );
};
