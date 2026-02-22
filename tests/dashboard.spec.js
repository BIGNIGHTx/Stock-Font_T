import { test, expect } from "@playwright/test";

test.describe("Dashboard Features", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display main stats summary", async ({ page }) => {
    // Wait for at least one stat card to be visible
    await expect(page.getByText("Total Products")).toBeVisible();
    await expect(page.getByText("Total Revenue")).toBeVisible();
    await expect(page.getByText("Gross Profit")).toBeVisible();
  });

  test("should open Low Stock modal when clicking alert card", async ({ page }) => {
    await page.getByText("Low Stock Alert").click();
    await expect(page.getByRole("heading", { name: "Low Stock Items" })).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("heading", { name: "Low Stock Items" })).not.toBeVisible();
  });

  test("should navigate to Inventory from 'Add Product' button", async ({ page }) => {
    await page.getByRole("button", { name: /Add Product/i }).click();
    // Should be on Inventory page (Categories or Modal)
    await expect(page.getByText(/Inventory/i)).toBeVisible();
    await expect(page.getByText(/Add New Product|Add Category/i)).toBeVisible();
  });

  test("should allow export (UI check)", async ({ page }) => {
    const exportBtn = page.getByRole("button", { name: /Export/i });
    await expect(exportBtn).toBeVisible();
    await expect(exportBtn).toBeEnabled();
  });

  test("accessibility check", async ({ page }) => {
    // Check for main heading
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    // Check that topbar nav is accessible
    await expect(page.getByRole("button", { name: "Dashboard" })).toBeVisible();
  });
});
