"use client";

import {
  darkTheme,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { useTheme } from "next-themes";
import type { ReactNode } from "react";

// Define our custom orange color
const orangeColor = "#ff5e14";

export function RainbowKitProviderWrapper({
  children,
}: {
  children: ReactNode;
}) {
  const { theme } = useTheme();

  // Create custom themes with our orange color
  const customLightTheme = lightTheme({
    accentColor: orangeColor,
    accentColorForeground: "white",
    borderRadius: "medium",
    fontStack: "system",
    overlayBlur: "small",
  });

  const customDarkTheme = darkTheme({
    accentColor: orangeColor,
    accentColorForeground: "white",
    borderRadius: "medium",
    fontStack: "system",
    overlayBlur: "small",
  });

  // Override the connected button colors
  const themeWithCustomColors = {
    ...(theme === "dark" ? customDarkTheme : customLightTheme),
    colors: {
      ...(theme === "dark" ? customDarkTheme.colors : customLightTheme.colors),
      connectButtonBackground: orangeColor,
      connectButtonBackgroundError: "#FF494A",
      connectButtonInnerBackground: orangeColor,
      connectButtonText: "white",
      connectButtonTextError: "white",
    },
  };

  return (
    <RainbowKitProvider theme={themeWithCustomColors} coolMode={false}>
      {children}
    </RainbowKitProvider>
  );
}
