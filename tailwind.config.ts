import type { Config } from "tailwindcss";

/**
 * Dark-first design system inspired by the "Moto Rental" mockup:
 * near-black surfaces, layered dark cards, and a gold/yellow accent for actions.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces
        background: "#0a0a0b",
        surface: "#141417",
        "surface-2": "#1c1c21",
        "surface-3": "#26262d",
        border: "#2a2a31",
        // Text
        foreground: "#f5f5f4",
        muted: "#9b9ba3",
        // Brand accent (gold/yellow)
        brand: {
          DEFAULT: "#f5c518",
          50: "#fef9e7",
          400: "#f5c518",
          500: "#eab308",
          600: "#ca9a04",
        },
        // Semantic status colors
        success: "#22c55e",
        warning: "#f59e0b",
        danger: "#ef4444",
        info: "#3b82f6",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        app: "480px",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
