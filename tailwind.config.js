/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // ใช้ Font Inter ตามดีไซน์
      },
      colors: {
        primary: "#2563EB",       // สีน้ำเงินปุ่มกด / Logo
        secondary: "#64748B",     // สีเทาข้อความรอง
        success: "#10B981",       // สีเขียว (ยอดบวก)
        danger: "#EF4444",        // สีแดง (แจ้งเตือน)
        warning: "#F59E0B",       // สีส้ม
        background: "#F8FAFC",    // สีพื้นหลัง App (เทาอ่อนมาก)
        surface: "#FFFFFF",       // สีพื้นหลัง Card (ขาว)

        // Custom Dark Mode Colors
        'dark-bg': '#121212',     // Dark Grey requested by user
        'dark-surface': '#1E1E1E', // Slightly lighter for cards
        'dark-border': '#333333', // Subtle border
        'dark-text': '#E2E8F0',   // Light grey text (slate-200 equivalent)
        'dark-muted': '#94A3B8',  // Muted text (slate-400 equivalent)
        lapis: '#26619C',         // Lapis Blue
      },
      animation: {
        wave: 'wave 2.5s infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        gradient: 'gradient 8s linear infinite',
      },
      keyframes: {
        gradient: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        wave: {
          '0%': { transform: 'rotate(0.0deg)' },
          '10%': { transform: 'rotate(14.0deg)' },
          '20%': { transform: 'rotate(-8.0deg)' },
          '30%': { transform: 'rotate(14.0deg)' },
          '40%': { transform: 'rotate(-4.0deg)' },
          '50%': { transform: 'rotate(10.0deg)' },
          '60%': { transform: 'rotate(0.0deg)' },
          '100%': { transform: 'rotate(0.0deg)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
