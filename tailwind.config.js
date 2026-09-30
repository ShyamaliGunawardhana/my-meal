/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Palette agreed in decisions.md, based on the course notes'
        // "psychology of marketing" slide and Material Design guidance.
        // primary: "#EAB308", // yellow - creativity/happiness/positivity
        primary: "#ffcc00",
        secondary: "#338A2E", // green - health/growth/safety, used on buttons
        background: "#FFF8F0",
        "background-dark": "#1C1815",
        surface: "#FFFFFF",
        "surface-dark": "#2A2420",
        "text-main": "#2B2320",
        "text-main-dark": "#F3EAE2",
        danger: "#C4432B",
      },
    },
  },
  plugins: [],
};
