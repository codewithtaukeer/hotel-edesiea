import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        edesiea: {
          navy: {
            DEFAULT: "#0E1A2B",
            50: "#F0F4F8",
            100: "#D9E2EC",
            200: "#BCCCDC",
            300: "#9FB3C8",
            400: "#627D98",
            500: "#486581",
            600: "#334E68",
            700: "#243B53",
            800: "#102A43",
            900: "#0E1A2B",
            950: "#070E17",
          },
          gold: {
            DEFAULT: "#C59B27",
            light: "#E5C158",
            dark: "#997316",
            50: "#FCF9EE",
            100: "#F7F0D4",
            500: "#C59B27",
            600: "#A88019",
          },
          cream: {
            DEFAULT: "#FBF9F5",
            50: "#FFFFFF",
            100: "#FAF7F2",
            200: "#F4EFE6",
            300: "#EDE5D8",
          },
          veg: {
            DEFAULT: "#15803D",
            light: "#22C55E",
            bg: "#F0FDF4",
          }
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
