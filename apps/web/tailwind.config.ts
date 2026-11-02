import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        sidebar: "var(--sidebar)",
        card: "var(--card)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        muted: "var(--muted-foreground)",
        hover: "var(--hover)",
        secondary: "var(--secondary)",
        "selected-fg": "var(--selected-fg)",
        accent: "var(--accent)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          foreground: "var(--primary-foreground)",
        },
      },
    },
  },
  plugins: [],
};
export default config;
