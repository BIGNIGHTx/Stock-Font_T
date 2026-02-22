import { test, expect } from "@playwright/test";

test.describe("Appearance & Theme Settings", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should toggle dark mode and persist in localStorage", async ({ page }) => {
    // Navigate to Settings
    await page.getByRole("button", { name: "Settings" }).first().click();

    // รอให้หน้า Settings โหลดและ Checkbox ปรากฏก่อน
    const themeToggle = page.locator('input[type="checkbox"]');
    await themeToggle.waitFor({ timeout: 10000 });

    const isDark = await themeToggle.isChecked();

    // Toggle theme โดยกดที่ label wrapper (เพราะ checkbox เป็น sr-only)
    await page.locator("label").filter({ has: page.locator('input[type="checkbox"]') }).click();

    // รอให้ DOM อัปเดต
    await page.waitForTimeout(500);

    if (isDark) {
      await expect(page.locator("html")).not.toHaveClass(/dark/);
    } else {
      await expect(page.locator("html")).toHaveClass(/dark/);
    }

    // Refresh แล้วตรวจว่ายังคงค่าเดิม
    await page.reload();
    await page.waitForTimeout(500); // รอ localStorage apply
    if (isDark) {
      await expect(page.locator("html")).not.toHaveClass(/dark/);
    } else {
      await expect(page.locator("html")).toHaveClass(/dark/);
    }
  });

  test("should toggle dark mode from Topbar icon", async ({ page }) => {
    const topBarThemeBtn = page.locator('button[title*="Mode"]');
    await topBarThemeBtn.click();
    
    // Verify dark class presence
    const htmlClasses = await page.locator("html").getAttribute("class") || "";
    const isDarkNow = htmlClasses.includes("dark");

    // Toggle back from Settings to verify they stay sync
    await page.getByRole("button", { name: "Settings" }).first().click();
    const settingsToggle = page.locator('input[type="checkbox"]');
    
    if (isDarkNow) {
        await expect(settingsToggle).toBeChecked();
    } else {
        await expect(settingsToggle).not.toBeChecked();
    }
  });
});
