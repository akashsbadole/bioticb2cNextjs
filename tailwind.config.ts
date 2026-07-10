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
          DEFAULT: "#2b2c37",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#FF6B6B",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F8F9FA",
          foreground: "#666666",
        },
        accent: {
          DEFAULT: "#F8F9FA",
          foreground: "#333333",
        },
        destructive: {
          DEFAULT: "#FF6B6B",
          foreground: "#FFFFFF",
        },
        border: "#E5E7EB",
        input: "#E5E7EB",
        ring: "#2b2c37",
        brand: {
          primary: "#2b2c37",
          "primary-hover": "#2b2c50",
          secondary: "#FF6B6B",
          "secondary-hover": "#E55A5A",
          text: "#333333",
          "text-light": "#666666",
          bg: "#FFFFFF",
          "bg-section": "#F8F9FA",
        },
        chart: {
          "1": "#2b2c37",
          "2": "#FF6B6B",
          "3": "#666666",
          "4": "#F8F9FA",
          "5": "#333333",
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
      },
      transitionDuration: {
        "300": "300ms",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};
export default config;
