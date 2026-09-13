"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type PlatformType = "all" | "ios" | "android";

interface PlatformContextType {
  platform: PlatformType;
  setPlatform: (p: PlatformType) => void;
  platformLabel: string;
}

const PlatformContext = createContext<PlatformContextType>({
  platform: "all",
  setPlatform: () => {},
  platformLabel: "Combiné (iOS + Android)"
});

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [platform, setPlatformState] = useState<PlatformType>("all");

  useEffect(() => {
    const saved = localStorage.getItem("nichepulse_platform");
    if (saved && (saved === "all" || saved === "ios" || saved === "android")) {
      setPlatformState(saved as PlatformType);
    }
  }, []);

  const setPlatform = (p: PlatformType) => {
    setPlatformState(p);
    localStorage.setItem("nichepulse_platform", p);
  };

  const platformLabel =
    platform === "ios"
      ? "Apple App Store (iOS)"
      : platform === "android"
      ? "Google Play Store (Android)"
      : "Combiné (iOS + Android)";

  return (
    <PlatformContext.Provider value={{ platform, setPlatform, platformLabel }}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  return useContext(PlatformContext);
}
