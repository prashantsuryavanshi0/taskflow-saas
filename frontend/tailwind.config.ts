import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./features/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        muted: "hsl(var(--muted))",
        primary: "hsl(var(--primary))",
        card: "hsl(var(--card))",
      },
      borderRadius: { xl: "1rem", "2xl": "1.25rem" },
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui"] },
      boxShadow: {
        glow: "0 0 60px rgba(52, 211, 153, 0.12)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
