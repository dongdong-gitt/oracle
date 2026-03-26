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
        background: "var(--background)",
        foreground: "var(--foreground)",
        neon: {
          blue: "#00D4FF",
          purple: "#B829F7",
          pink: "#FF2D92",
          cyan: "#00F5FF",
          violet: "#8B5CF6",
        },
        surface: {
          DEFAULT: "rgba(255, 255, 255, 0.03)",
          hover: "rgba(255, 255, 255, 0.06)",
          active: "rgba(255, 255, 255, 0.1)",
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        display: ['var(--font-space)', 'Space Grotesk', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #00D4FF 0%, #B829F7 50%, #FF2D92 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #00F5FF 0%, #8B5CF6 100%)',
        'gradient-warm': 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
      },
      boxShadow: {
        'glow-blue': '0 0 40px rgba(0, 212, 255, 0.3), 0 0 80px rgba(0, 212, 255, 0.1)',
        'glow-purple': '0 0 40px rgba(184, 41, 247, 0.3), 0 0 80px rgba(184, 41, 247, 0.1)',
        'glow-pink': '0 0 40px rgba(255, 45, 146, 0.3), 0 0 80px rgba(255, 45, 146, 0.1)',
      },
      animation: {
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
export default config;
