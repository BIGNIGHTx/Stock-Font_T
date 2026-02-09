/** @type {import('tailwindcss').Config} */
export default {
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
      }
    },
  },
  plugins: [],
}
