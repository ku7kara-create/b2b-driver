import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#091426",
        "primary-container": "#1e293b",
        "primary-fixed": "#d8e3fb",
        "primary-fixed-dim": "#bcc7de",

        "on-primary": "#ffffff",
        "on-primary-container": "#8590a6",
        "on-primary-fixed": "#111c2d",
        "on-primary-fixed-variant": "#3c475a",

        secondary: "#9d4300",
        "secondary-container": "#E05A2B",
        "secondary-fixed": "#ffdbca",
        "secondary-fixed-dim": "#ffb690",

        "on-secondary": "#ffffff",
        "on-secondary-container": "#5c2400",
        "on-secondary-fixed": "#341100",
        "on-secondary-fixed-variant": "#783200",

        tertiary: "#001624",
        "tertiary-container": "#002c42",
        "tertiary-fixed": "#c9e6ff",
        "tertiary-fixed-dim": "#89ceff",

        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#0099d9",
        "on-tertiary-fixed": "#001e2f",
        "on-tertiary-fixed-variant": "#004c6e",

        background: "#f8f9ff",
        "on-background": "#0b1c30",

        surface: "#f8f9ff",
        "surface-dim": "#cbdbf5",
        "surface-bright": "#f8f9ff",
        "surface-variant": "#d3e4fe",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#45474c",

        "surface-container": "#e5eeff",
        "surface-container-low": "#eff4ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d3e4fe",

        outline: "#75777d",
        "outline-variant": "#c5c6cd",

        "inverse-surface": "#213145",
        "inverse-primary": "#bcc7de",
        "inverse-on-surface": "#eaf1ff",

        "surface-tint": "#545f73",

        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
      },
      fontFamily: {
        arabic: ['"Noto Kufi Arabic"', '"Noto Sans Arabic"', "sans-serif"],
      },
      borderRadius: {
        lg: "0.5rem",
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
