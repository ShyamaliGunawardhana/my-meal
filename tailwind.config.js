/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Palette agreed in decisions.md (replaces the earlier
        // yellow/green palette in full).
        primary: "#2E7D5B", // forest green - buttons, active nav icons, important actions
        background: "#FFF4E5", // warm cream - screens, recipe cards, empty states
        "background-dark": "#1C1815", // dark mode not covered by this palette yet
        surface: "#FFFFFF", // cards and input fields
        "surface-dark": "#2A2420",
        "text-main": "#24332B", // headings and body text
        "text-main-dark": "#F3EAE2",
        accent: "#A7C957", // fresh accent - small highlights/decorative elements only
        "user-bubble": "#FFF6DF", // very light yellow - user message bubbles
        "agent-bubble": "#E7F3EC", // very light green - agent bubbles and cards
        danger: "#B42318", // allergy conflicts and critical errors
        success: "#237A45", // validated success states (see decisions.md on how this may be used)
      },
    },
  },
  plugins: [],
};
