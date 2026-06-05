import type { Config } from "tailwindcss";

/**
 * Theming via CSS variables (channels "R G B") so light/dark switch by toggling
 * the `dark` class on <html>. Values live in globals.css (:root = light,
 * .dark = dark). The gold brand accent stays the same in both modes.
 */
const channel = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

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
        // Surfaces (theme-aware)
        background: channel("--c-background"),
        surface: channel("--c-surface"),
        "surface-2": channel("--c-surface-2"),
        "surface-3": channel("--c-surface-3"),
        border: channel("--c-border"),
        // Text (theme-aware)
        foreground: channel("--c-foreground"),
        muted: channel("--c-muted"),
        // Brand accent (gold/yellow) — shared across themes
        brand: {
          DEFAULT: channel("--c-brand"),
          50: "#fef9e7",
          400: "#f5c518",
          500: "#eab308",
          600: "#ca9a04",
        },
        // Semantic status colors — shared across themes
        success: channel("--c-success"),
        warning: channel("--c-warning"),
        danger: channel("--c-danger"),
        info: channel("--c-info"),
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
