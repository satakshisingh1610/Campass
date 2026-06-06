/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'DM Sans'", "system-ui", "sans-serif"],
      },
      colors: {
        cream: "#FDFAF4",
        gold: {
          DEFAULT: "#C8963E",
          light: "#F5E6C8",
          pale: "#FBF4E3",
        },
        sage: {
          DEFAULT: "#4A6741",
          light: "#E8F0E6",
        },
        rust: {
          DEFAULT: "#8B3A2A",
          light: "#F5E8E5",
        },
        ink: "#1A1208",
        muted: "#7A6A50",
        border: "#E8DFC8",
      },
      boxShadow: {
        card: "0 2px 16px rgba(26,18,8,0.08)",
        "card-hover": "0 8px 32px rgba(26,18,8,0.14)",
      },
    },
  },
  plugins: [],
};
