import { Poppins } from "next/font/google";
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        brand: {
          primary: "var(--brand-primary)",
          "primary-hover": "var(--brand-primary-hover)",
          secondary: "var(--brand-secondary)",
          "secondary-hover": "var(--brand-secondary-hover)",
          text: "var(--brand-text)",
          "text-light": "var(--brand-text-light)",
          bg: "var(--brand-bg)",
          "bg-section": "var(--brand-bg-section)",
        },
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        // Biotic Naturals palette
        biotic: {
          bg: "#F7F1DE",
          "bg-alt": "#EFE6C8",
          paper: "#FFFDF6",
          ink: "#241D14",
          "ink-soft": "#5B5240",
          green: "#2F4A3C",
          "green-dark": "#1C2C23",
          "green-tint": "#DCE6DA",
          gold: "#C68A2E",
          "gold-tint": "#F1DFB4",
          red: "#A6402F",
          sand: "#D9C7A3",
          line: "#E1D6B8",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        Poppins: ["var(--font-poppins)", "sans-serif"],
        sans: ["var(--font-poppins)", "sans-serif"],
        fraunces: ["var(--font-fraunces)", "Georgia", "serif"],
        "work-sans": ["var(--font-work-sans)", "sans-serif"],
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      fontSize: {
        h1: ["3rem", { lineHeight: "1.2", fontWeight: "700" }],
        h2: ["2.25rem", { lineHeight: "1.2", fontWeight: "700" }],
        h3: ["1.75rem", { lineHeight: "1.3", fontWeight: "600" }],
        h4: ["1.5rem", { lineHeight: "1.3", fontWeight: "600" }],
        h5: ["1.25rem", { lineHeight: "1.4", fontWeight: "500" }],
        h6: ["1.125rem", { lineHeight: "1.4", fontWeight: "500" }],
        body: ["1rem", { lineHeight: "1.6", fontWeight: "400" }],
        small: ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
      },
      boxShadow: {
        card: "0 4px 20px rgba(0, 0, 0, 0.05)",
        "card-hover": "0 8px 30px rgba(0, 0, 0, 0.08)",
        biotic: "0 12px 30px -14px rgba(28,44,35,.28)",
      },
      transitionDuration: {
        "300": "300ms",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
