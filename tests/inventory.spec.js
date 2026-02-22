import { test, expect } from "@playwright/test";

/**
 * INVENTORY TEST SUITE
 * -----------------------------------------
 * ⚠️  Strategy: Data-Agnostic Tests
 *     ไม่ hardcode ชื่อ Category เพราะข้อมูลใน DB เปลี่ยนได้เสมอ
 *     ใช้วิธีหยิบ Category "อันแรกที่มีอยู่จริง" มาทดสอบแทน
 *
 * Test Plan:
 * 1. Navigate to Inventory page
 * 2. Display categories loaded from API
 * 3. Add Category (Happy Path) → เพิ่มใหม่ แล้วตรวจว่าการ์ดขึ้นมา
 * 4. Edit Category (Happy Path) → แก้ไขการ์ดที่มีอยู่จริง
 * 5. Navigate into first category → ดูหน้า Product List
 * 6. Open Add Product modal
 * 7. Validate required fields
 * 8. Search/Filter Products
 * 9. Add Brand
 * 10. Go back to Category list
 */

const goToInventory = async (page) => {
  await page.getByRole("button", { name: "Inventory" }).first().click();
  await page.waitForSelector(".group", { timeout: 10000 });
};

// Helper: หยิบการ์ด Category อันแรก
const getFirstCategoryCard = (page) => page.locator(".group").first();

// Helper: ปิด Custom Alert Modal (กด OK) ถ้ามีขึ้นมา
const dismissAlert = async (page) => {
  const okBtn = page.getByRole("button", { name: /OK|ตกลง/i });
  const visible = await okBtn.isVisible({ timeout: 3000 }).catch(() => false);
  if (visible) await okBtn.click();
};

test.describe("Inventory Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await goToInventory(page);
  });

  // ─── 1. Category List ──────────────────────────────────────────────────────

  test("should load category list from API", async ({ page }) => {
    // ตรวจว่ามีการ์ดอย่างน้อย 1 ใบ (ไม่สนว่าชื่ออะไร)
    const cards = page.locator(".group");
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  // ─── 2. Add Category ───────────────────────────────────────────────────────

  test("[Happy Path] should add a new category", async ({ page }) => {
    const uniqueName = `AutoCat-${Date.now()}`;
    const uniqueThai = "ทดสอบอัตโนมัติ";

    await page.getByRole("button", { name: /Add Category/i }).click();
    await expect(page.getByRole("heading", { name: "Add Category" })).toBeVisible();

    await page.getByPlaceholder(/e.g. Air Conditioner/i).fill(uniqueName);
    await page.getByPlaceholder(/เช่น เครื่องปรับอากาศ/i).fill(uniqueThai);
    await page.getByRole("button", { name: "Add Category" }).last().click();

    // ปิด Alert "สำเร็จ" ที่โผล่ขึ้นมาหลังบันทึก
    await dismissAlert(page);

    // ตรวจว่าการ์ดใหม่แสดงขึ้นมา
    await expect(page.getByText(uniqueName)).toBeVisible({ timeout: 10000 });
  });

  // ─── 3. Edit Category ──────────────────────────────────────────────────────

  test("[Happy Path] should edit an existing category", async ({ page }) => {
    // รอให้การ์ดโหลดก่อน
    const card = getFirstCategoryCard(page);
    await card.waitFor({ timeout: 10000 });

    // Hover เพื่อให้ปุ่ม Edit ปรากฏ
    await card.hover();

    // กดปุ่ม Edit — หาด้วย svg icon แทนการใช้ title ภาษาไทย (หลีกเลี่ยงปัญหา encoding)
    // ปุ่ม Edit คือปุ่มอันแรกใน group action div (ก่อนปุ่ม Delete)
    const actionBtns = card.locator("div.absolute button");
    await actionBtns.first().waitFor({ timeout: 5000 });
    await actionBtns.first().click();

    await expect(page.getByRole("heading", { name: "Edit Category" })).toBeVisible();

    // ใส่ชื่อใหม่ที่ไม่ซ้ำ
    const updatedName = `Edited-${Date.now()}`;
    await page.getByPlaceholder(/e.g. Air Conditioner/i).fill(updatedName);
    await page.getByRole("button", { name: "Save Changes" }).click();

    // ปิด Alert "สำเร็จ" ที่โผล่มาหลังบันทึก
    await dismissAlert(page);

    // ตรวจว่าชื่อใหม่แสดงบนหน้าจอ
    await expect(page.getByText(updatedName)).toBeVisible({ timeout: 10000 });
  });

  // ─── 4. Navigate into Category ────────────────────────────────────────────

  test("[Happy Path] should navigate into first category and see product list", async ({ page }) => {
    const card = getFirstCategoryCard(page);
    await card.waitFor({ timeout: 10000 });
    await card.click();

    // หน้า product list ต้องมีปุ่ม Add Product
    await expect(page.getByRole("button", { name: /Add Product/i })).toBeVisible({ timeout: 10000 });
  });

  // ─── 5. Add Product Modal ─────────────────────────────────────────────────

  test("[Happy Path] should open and close Add Product modal", async ({ page }) => {
    // เข้าไปในการ์ดอันแรก
    await getFirstCategoryCard(page).click();
    await page.getByRole("button", { name: /Add Product/i }).click();
    await expect(page.getByRole("heading", { name: "Add New Product" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(page.getByRole("heading", { name: "Add New Product" })).not.toBeVisible();
  });

  // ─── 6. Validation ────────────────────────────────────────────────────────

  test("[Validation] should require all fields to save product", async ({ page }) => {
    await getFirstCategoryCard(page).click();
    await page.getByRole("button", { name: /Add Product/i }).click();

    // กด Save โดยไม่กรอกอะไร
    await page.getByRole("button", { name: "Save Product" }).click();

    // Modal ต้องยังอยู่ (ไม่ถูกปิด)
    await expect(page.getByRole("heading", { name: "Add New Product" })).toBeVisible();
  });

  // ─── 7. Search/Filter ─────────────────────────────────────────────────────

  test("[Happy Path] should filter products with search", async ({ page }) => {
    await getFirstCategoryCard(page).click();

    // ค้นหาคำที่ไม่มีในระบบแน่ๆ
    const searchInput = page.getByRole("textbox").first();
    await searchInput.fill("xyznotexist999");

    // Empty state หรือข้อความแจ้งว่าไม่พบสินค้า
    await expect(page.getByText(/ไม่พบ|no product|empty/i)).toBeVisible({ timeout: 5000 });
    await searchInput.fill("");
  });

  // ─── 8. Add Brand ─────────────────────────────────────────────────────────

  test("[Happy Path] should add a new brand", async ({ page }) => {
    await getFirstCategoryCard(page).click();

    const uniqueBrand = `AutoBrand-${Date.now() % 10000}`;
    await page.getByRole("button", { name: "Add Brand" }).click();
    await expect(page.getByPlaceholder(/e.g. Sony/i)).toBeVisible();
    await page.getByPlaceholder(/e.g. Sony/i).fill(uniqueBrand);
    await page.getByRole("button", { name: "Add Brand" }).last().click();

    await expect(page.getByText(uniqueBrand)).toBeVisible({ timeout: 5000 });
  });

  // ─── 9. Navigation Back ───────────────────────────────────────────────────

  test("should go back to category list from product view", async ({ page }) => {
    await getFirstCategoryCard(page).click();
    await expect(page.getByRole("button", { name: /Add Product/i })).toBeVisible();

    // กดปุ่มย้อนกลับ
    await page.locator("button:has(.lucide-arrow-left)").click();

    // ต้องกลับมาหน้า Category Grid
    const cards = page.locator(".group");
    await expect(cards.first()).toBeVisible({ timeout: 5000 });
  });
});
