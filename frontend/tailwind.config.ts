import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      gridTemplateColumns: {
        "20": "repeat(20, minmax(0, 1fr))",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "#C3FF00",
        background: {
          DEFAULT: "#1F1F1F", // Dark gray (almost black)
          paper: "#393939", // Medium gray for content areas
        },
        foreground: "#FFFFFF",
        primary: {
          DEFAULT: "#C3FF00",
          foreground: "#1F1F1F",
          light: "#D4FF33",
          dark: "#A3D600",
        },
        secondary: {
          DEFAULT: "#393939",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "#444444",
          foreground: "#E0E0E0",
        },
        accent: {
          DEFAULT: "#D4FF33",
          foreground: "#1F1F1F",
        },
        popover: {
          DEFAULT: "#393939",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "#393939",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "rotate-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        float: "float 6s ease-in-out infinite",
        "rotate-slow": "rotate-slow 12s linear infinite",
      },
      boxShadow: {
        "3d-normal":
          "0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.15), 0 -2px 0 0 rgba(195, 255, 0, 0.3) inset, 0 2px 0 0 rgba(0, 0, 0, 0.2) inset",
        "3d-hover":
          "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.14), 0 -2px 0 0 rgba(195, 255, 0, 0.4) inset, 0 2px 0 0 rgba(0, 0, 0, 0.2) inset",
        "3d-pressed":
          "0 5px 10px -3px rgba(0, 0, 0, 0.3), 0 2px 3px -2px rgba(0, 0, 0, 0.15), 0 -1px 0 0 rgba(195, 255, 0, 0.4) inset, 0 1px 0 0 rgba(0, 0, 0, 0.2) inset, 0 2px 0 0 rgba(0, 0, 0, 0.15) inset",
        "3d-card":
          "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.14), 0 -2px 0 0 rgba(195, 255, 0, 0.1) inset, 0 2px 0 0 rgba(0, 0, 0, 0.15) inset",
      },
      fontFamily: {
        clash: ["var(--font-clash-display)", "sans-serif"],
      },
      zIndex: {
        "100": "100",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config

export default config
