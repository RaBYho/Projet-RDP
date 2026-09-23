/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ---- Surfaces (L0 → L3) ----
        surface: {
          DEFAULT: "#F8FAFC", // L0 workbench
          panel: "#FFFFFF", // L1
          raised: "#FFFFFF", // L2
          modal: "#FFFFFF", // L3
          muted: "#F1F5F9",
        },
        // ---- Structure ----
        border: {
          DEFAULT: "#E2E8F0",
          strong: "#CBD5E1",
          focus: "#94A3B8",
        },
        // ---- Texte ----
        ink: {
          DEFAULT: "#0F172A",
          muted: "#475569",
          caption: "#64748B",
          disabled: "#94A3B8",
        },
        // ---- Domaines fonctionnels ----
        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          active: "#1E40AF",
          soft: "#DBEAFE",
        },
        secondary: {
          DEFAULT: "#059669",
          hover: "#047857",
          soft: "#D1FAE5",
        },
        tertiary: {
          DEFAULT: "#D97706",
          warning: "#EA580C", // réservé warnings capacité
          soft: "#FEF3C7",
        },
        danger: {
          DEFAULT: "#DC2626",
          hover: "#B91C1C",
          soft: "#FEE2E2",
        },
        pedestrian: {
          DEFAULT: "#7C3AED",
          soft: "#EDE9FE",
        },
        // ---- Catégories (mapping direct briefing) ----
        cat: {
          normal: "#2563EB",
          bus: "#D97706",
          urgence: "#DC2626",
          pieton: "#7C3AED",
        },
      },

      fontFamily: {
        sans: ["Geist", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },

      fontSize: {
        // Design system — chaque entrée inclut size + line-height + weight
        display: [
          "32px",
          { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "600" },
        ],
        "headline-lg": [
          "24px",
          { lineHeight: "32px", letterSpacing: "-0.015em", fontWeight: "600" },
        ],
        "headline-md": [
          "18px",
          { lineHeight: "24px", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "headline-sm": ["15px", { lineHeight: "20px", fontWeight: "600" }],
        "body-lg": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "body-md": ["13px", { lineHeight: "18px", fontWeight: "400" }],
        "body-sm": ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "label-md": ["12px", { lineHeight: "16px", fontWeight: "500" }],
        "label-sm": ["11px", { lineHeight: "14px", fontWeight: "500" }],
        "badge-mono": [
          "10px",
          { lineHeight: "12px", letterSpacing: "0.04em", fontWeight: "600" },
        ],
        "code-lg": ["14px", { lineHeight: "20px", fontWeight: "500" }],
        "code-md": ["12px", { lineHeight: "16px", fontWeight: "500" }],
        "code-sm": ["11px", { lineHeight: "14px", fontWeight: "500" }],
      },

      borderRadius: {
        sm: "0.125rem", // 2px
        DEFAULT: "0.25rem", // 4px
        md: "0.375rem", // 6px
        lg: "0.5rem", // 8px
        xl: "0.75rem", // 12px
      },

      boxShadow: {
        l1: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
        l2: "0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        l3: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
      },

      spacing: {
        gutter: "1rem",
        "gutter-dense": "0.5rem",
        margin: "1.5rem",
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "0.75rem",
        "space-lg": "1rem",
        "space-xl": "1.5rem",
        "space-2xl": "2rem",
      },
      // ---- Animations & micro-interactions ----
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        ring: {
          "0%": { transform: "scale(0.95)", opacity: "0.7" },
          "50%": { transform: "scale(1.08)", opacity: "0.25" },
          "100%": { transform: "scale(0.95)", opacity: "0.7" },
        },
        indeterminate: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(350%)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 300ms ease-out both",
        fadeIn: "fadeIn 250ms ease-out both",
        pulseSoft: "pulseSoft 2s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear infinite",
        ring: "ring 2.4s ease-in-out infinite",
        indeterminate: "indeterminate 1.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
