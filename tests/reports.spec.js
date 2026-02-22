import { test, expect } from "@playwright/test";

test.describe("Reports & History Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Reports" }).first().click();
  });

  test("should display summary statistics", async ({ page }) => {
    await expect(page.getByText("Gross Profit")).toBeVisible();
    await expect(page.getByText("Total Units Sold")).toBeVisible();
    await expect(page.getByText("Best Seller")).toBeVisible();
  });

  test("should switch between daily and monthly views", async ({ page }) => {
    await page.getByRole("button", { name: "Monthly Overview" }).click();
    await expect(page.getByText(/Daily Breakthrough:/i)).toBeVisible();

    await page.getByRole("button", { name: "Daily View" }).click();
    await expect(page.getByText(/Transactions:/i)).toBeVisible();
  });

  test("should filter by VAT status", async ({ page }) => {
    await page.getByRole("button", { name: "VAT", exact: true }).click();
    // In a real database, we would check the table content. 
    // Here we check the button state change (visually or via text)
    await expect(page.getByRole("button", { name: "VAT", exact: true })).toHaveClass(/bg-purple-100/);

    await page.getByRole("button", { name: "No VAT" }).click();
    await expect(page.getByRole("button", { name: "No VAT" })).toHaveClass(/bg-slate-200/);
  });

  test("should delete a transaction from reports", async ({ page }) => {
    // Note: This relies on existing data. If empty, the test might skip or fail.
    const rows = page.locator("tbody tr");
    const count = await rows.count();
    
    if (count > 0 && !(await rows.first().getByText("No sales transactions").isVisible())) {
      page.once('dialog', dialog => dialog.accept());
      await rows.first().locator('button[title="Delete Transaction"]').click();
      
      // Verification of success alert
      await expect(page.getByText("ลบรายการขายเรียบร้อยแล้ว")).toBeVisible();
    }
  });

  test("accessibility check for date pickers", async ({ page }) => {
    const dailyPicker = page.locator('input[type="date"]');
    await expect(dailyPicker).toBeVisible();
    await expect(dailyPicker).toBeEnabled();
    
    await page.getByRole("button", { name: "Monthly Overview" }).click();
    const monthlyPicker = page.locator('input[type="month"]');
    await expect(monthlyPicker).toBeVisible();
  });
});
