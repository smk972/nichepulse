"use client";

import React from "react";

interface SparklineProps {
  data: number[];
  color?: "emerald" | "violet" | "cyan" | "rose";
  height?: number;
  width?: number;
}

export default function Sparkline({
  data = [10, 15, 22, 35, 48, 65, 85],
  color = "emerald",
  height = 28,
  width = 80
}: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 6) + 3;
    const y = height - 4 - ((val - min) / range) * (height - 8);
    return `${x},${y}`;
  });

  const pathStr = `M ${points.join(" L ")}`;
  const lastPoint = points[points.length - 1].split(",");
  const lastX = parseFloat(lastPoint[0]);
  const lastY = parseFloat(lastPoint[1]);

  const colorMap = {
    emerald: { stroke: "#4edea3", glow: "rgba(78, 222, 163, 0.4)" },
    violet: { stroke: "#d0bcff", glow: "rgba(208, 188, 255, 0.4)" },
    cyan: { stroke: "#4cd7f6", glow: "rgba(76, 215, 246, 0.4)" },
    rose: { stroke: "#ffb4ab", glow: "rgba(255, 180, 171, 0.4)" }
  };

  const selectedColor = colorMap[color] || colorMap.emerald;

  return (
    <svg width={width} height={height} className="overflow-visible select-none" viewBox={`0 0 ${width} ${height}`}>
      <path
        d={pathStr}
        fill="none"
        stroke={selectedColor.stroke}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={lastX}
        cy={lastY}
        r="2.5"
        fill={selectedColor.stroke}
        style={{ filter: `drop-shadow(0 0 4px ${selectedColor.glow})` }}
      />
    </svg>
  );
}
