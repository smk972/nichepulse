"use client";

import React from "react";

interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  status?: string;
  onClick?: () => void;
}

export default function ScoreGauge({
  score,
  label = "SCORE DEV",
  size = "md",
  status,
  onClick
}: ScoreGaugeProps) {
  const radius = size === "lg" ? 44 : size === "md" ? 40 : 28;
  const strokeWidth = size === "lg" ? 8 : size === "md" ? 7 : 5;
  const dimension = (radius + strokeWidth) * 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let color = "#4edea3"; // Emerald for high scores >= 80
  if (score < 60) {
    color = "#ffb4ab"; // Red/Rose for avoid
  } else if (score < 80) {
    color = "#4cd7f6"; // Cyan for investigate
  }

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center select-none ${
        onClick ? "cursor-pointer group hover:scale-105 transition-transform" : ""
      }`}
      style={{ width: dimension, height: dimension }}
    >
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${dimension} ${dimension}`}>
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke="#282a30"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className={`font-telemetry font-bold text-[#e2e2eb] leading-none ${
            size === "lg" ? "text-[28px]" : size === "md" ? "text-[22px]" : "text-[16px]"
          }`}
        >
          {Math.round(score)}
        </span>
        {size !== "sm" && (
          <span className="font-telemetry text-[8px] text-[#958ea0] uppercase tracking-wider mt-0.5">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
