/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "bg-primary": "#121212",
        "bg-surface": "#1E1E1E",
        "eco-success": "#2E8B57",
        "alert-anomaly": "#FF4500",
        "warning-reserved": "#FFD700",
        "system-info": "#00BFFF",
        "slot-empty": "#333333",
        "text-high-contrast": "#FFFFFF",
        "text-muted": "#9E9E9E"
      }
    },
  },
  plugins: [],
}
