import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        ndgGreen: {
          DEFAULT: "#50C878",
          50: "#e8f7ed",
          100: "#c5ebd3",
          200: "#9fdfb8",
          300: "#78d39c",
          400: "#5bca88",
          500: "#50C878",
          600: "#45b56c",
          700: "#389e5c",
          800: "#2c874d",
          900: "#1d5c34",
        },
        card: {
          DEFAULT: "#1d1d1d",
          hover: "#2d2d2d",
          border: "#2d2d2d",
        },
      },
    },
  },
  plugins: [],
};
export default config;
