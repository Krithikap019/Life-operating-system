/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#EEEDFE",
          100: "#CECBF6",
          200: "#AFA9EC",
          400: "#7F77DD",
          600: "#534AB7",
          800: "#3C3489",
          900: "#26215C",
        },
        teal: {
          50:  "#E1F5EE",
          100: "#9FE1CB",
          600: "#0F6E56",
          800: "#085041",
        },
        coral: {
          50:  "#FAECE7",
          600: "#993C1D",
          800: "#712B13",
          900: "#4A1B0C",
        },
        amber2: {
          50:  "#FAEEDA",
          600: "#854F0B",
          800: "#633806",
          900: "#412402",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xl: "12px",
        "2xl": "16px",
      },
    },
  },
  plugins: [],
}
