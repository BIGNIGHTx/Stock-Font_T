import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  workers: 1, // รันทีละอัน ไม่รันพร้อมกัน
  use: {
    baseURL: "http://localhost:5174",
    headless: false,           // เปิด browser ให้เห็น
    launchOptions: {
      slowMo: 1000             // หน่วงทุก action 1 วินาที (ช้าลงเพื่อให้ดูทัน)
    }
  },
  webServer: {
    command: "npm run dev",
    port: 5174,
    reuseExistingServer: true,
  },
});
