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
        // === Warna Semantik Utama SPCT IoT ===
        "bg-primary": "#121212",
        "bg-surface": "#1E1E1E",
        "eco-success": "#2E8B57",
        "alert-anomaly": "#FF4500",
        "warning-reserved": "#FFD700",
        "system-info": "#00BFFF",
        "slot-empty": "#333333",
        "text-high-contrast": "#FFFFFF",
        "text-muted": "#9E9E9E",

        // === Palet Material Design (Dark) ===
        "surface": "#0e1418",
        "surface-dim": "#0e1418",
        "surface-bright": "#343a3e",
        "surface-container-lowest": "#090f13",
        "surface-container-low": "#161c20",
        "surface-container": "#1a2024",
        "surface-container-high": "#252b2f",
        "surface-container-highest": "#30363a",
        "on-surface": "#dee3e8",
        "on-surface-variant": "#bcc8d1",
        "inverse-surface": "#dee3e8",
        "inverse-on-surface": "#2b3135",
        "outline": "#87929b",
        "outline-variant": "#3d4850",
        "surface-tint": "#7ad0ff",
        "surface-variant": "#30363a",
        "background": "#0e1418",
        "on-background": "#dee3e8",

        // === Primary (Biru IoT) ===
        "primary": "#8fd6ff",
        "on-primary": "#003549",
        "primary-container": "#00bfff",
        "on-primary-container": "#004a65",
        "inverse-primary": "#00668a",
        "primary-fixed": "#c3e8ff",
        "primary-fixed-dim": "#7ad0ff",
        "on-primary-fixed": "#001e2c",
        "on-primary-fixed-variant": "#004c69",

        // === Secondary (Hijau Eco) ===
        "secondary": "#7ed99e",
        "on-secondary": "#00391d",
        "secondary-container": "#00703f",
        "on-secondary-container": "#94f0b2",
        "secondary-fixed": "#9af6b8",
        "secondary-fixed-dim": "#7ed99e",
        "on-secondary-fixed": "#00210f",
        "on-secondary-fixed-variant": "#00522d",

        // === Tertiary (Oranye/Amber Warning) ===
        "tertiary": "#ffc184",
        "on-tertiary": "#492900",
        "tertiary-container": "#fb9c24",
        "on-tertiary-container": "#653a00",
        "tertiary-fixed": "#ffdcbd",
        "tertiary-fixed-dim": "#ffb86e",
        "on-tertiary-fixed": "#2c1600",
        "on-tertiary-fixed-variant": "#693c00",

        // === Error ===
        "error": "#ffb4ab",
        "on-error": "#690005",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",
      },
      fontFamily: {
        "display-lg": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "body-base": ["Inter", "sans-serif"],
        "terminal-status": ["Inter", "sans-serif"],
        "tech-mono": ["Space Grotesk", "monospace"],
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "1.2", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "1.4", fontWeight: "600" }],
        "body-base": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "terminal-status": ["32px", { lineHeight: "1.1", fontWeight: "800" }],
        "tech-mono": ["18px", { lineHeight: "1.2", letterSpacing: "0.05em", fontWeight: "500" }],
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem",
      },
      spacing: {
        "unit": "4px",
        "container-margin": "24px",
        "gutter": "16px",
        "card-padding": "20px",
      },
    },
  },
  plugins: [],
}
