import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#FFF5F0",
          100: "#FFE8DC",
          200: "#FFD4C2",
          300: "#FFB89D",
          400: "#FF9A75",
          500: "#FF8C42", // برتقالي فاتح
          600: "#FF6B35", // برتقالي أساسي
          700: "#E55A2B", // برتقالي داكن
          800: "#CC4A1F",
          900: "#B33A15",
          light: "#FF8C42",
          DEFAULT: "#FF6B35",
          dark: "#E55A2B",
        },
        footer: {
          light: "#1F2A37",
          dark: "#000000",
        },
        background: {
          light: "#FFFFFF",
          dark: "#0F172A",
        },
        surface: {
          light: "#F8F9FA",
          dark: "#1E293B",
        },
      },
      fontFamily: {
        arabic: ["Cairo", "sans-serif"],
      },
      boxShadow: {
        soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
        medium: "0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};
export default config;

