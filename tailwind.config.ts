import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dae6ff",
          500: "#3b6fd6",
          600: "#2f5bb8",
          700: "#274a96",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Yu Gothic",
          "Meiryo",
          "Hiragino Kaku Gothic ProN",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
