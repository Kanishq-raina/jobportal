/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],

  darkMode: "class", // Enable dark mode via class strategy

  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      dropShadow: {
        glowWhite: "0 0 12px rgba(255,255,255,0.5)",
        glowBlue: "0 0 10px rgba(59,130,246,0.6)",
        glowPurple: "0 0 10px rgba(139,92,246,0.6)",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(-10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        bounceOnce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        pulseGlow: {
          '0%, 100%': {
            textShadow: '0 0 5px rgba(147,51,234,0.5), 0 0 10px rgba(236,72,153,0.6)',
          },
          '50%': {
            textShadow: '0 0 10px rgba(147,51,234,0.7), 0 0 20px rgba(236,72,153,0.8)',
          },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 0.6s ease-out forwards",
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spinSlow 30s linear infinite",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "bounce-once": "bounceOnce 0.4s ease-in-out",
        slideIn: "slideIn 0.3s ease-out forwards",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
