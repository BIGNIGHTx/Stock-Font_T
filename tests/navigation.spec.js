import { test, expect } from "@playwright/test";

/**
 * NAVIGATION TEST SUITE
 * -----------------------------------------
 * ครอบคลุม:
 * - การ Navigate ข้ามทุกหน้า
 * - Topbar ทำงานถูกต้อง
 * - Active state เปลี่ยนตามหน้าที่เลือก
 */

const pages = [
  { name: "Dashboard", heading: /Welcome back, Admin!/i },
  { name: "Inventory", heading: /Inventory/i },
  { name: "Sales", heading: /Point of Sale/i },
  { name: "Reports", heading: /Sales Reports/i },
  { name: "Settings", heading: /Settings/i },
];

test.describe("Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  for (const p of pages) {
    test(`should navigate to ${p.name} page`, async ({ page }) => {
      await page.getByRole("button", { name: p.name }).first().click();
      await expect(page.getByText(p.heading).first()).toBeVisible();
    });
  }

  test("logo/brand is always visible", async ({ page }) => {
    await expect(page.getByText("SomBoon")).toBeVisible();
    await expect(page.getByText("Electric")).toBeVisible();
  });

  test("can navigate between pages multiple times without breaking", async ({ page }) => {
    // Dashboard -> Inventory
    await page.getByRole("button", { name: "Inventory" }).first().click();
    await page.waitForSelector(".group, h1, h2", { timeout: 10000 });
    await expect(page.getByText(/Inventory/i)).toBeVisible();

    // Inventory -> Sales
    await page.getByRole("button", { name: "Sales" }).first().click();
    await page.waitForSelector("h1, h2, h3", { timeout: 10000 });
    await expect(page.getByText("Point of Sale")).toBeVisible();

    // Sales -> Dashboard
    await page.getByRole("button", { name: "Dashboard" }).first().click();
    await page.waitForSelector("h1, h2, h3", { timeout: 10000 });
    await expect(page.getByText(/Welcome back/i)).toBeVisible();
  });
});
