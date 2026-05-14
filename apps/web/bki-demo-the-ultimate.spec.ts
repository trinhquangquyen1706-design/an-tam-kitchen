/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║     BKI DEMO — THE ULTIMATE — An Tâm Kitchen Final Demo        ║
 * ║     Video Demo cho Vòng Chung kết Bách Khoa Innovation 2026     ║
 * ║     One-shot Full Walkthrough: Landing → CRUD → QR Scan         ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Chạy:
 *   cd apps/web
 *   npx playwright test bki-demo-the-ultimate.spec.ts --headed
 *
 * Output: apps/web/demo-video-output/
 */

import { test, expect } from '@playwright/test';

// ─── Timing: Snappy nhưng đủ cho BGK theo dõi ──────────────
const BEAT     = 500;   // micro beat — chuyển cảnh nhanh
const GLANCE   = 700;   // đủ mắt nhận 1 element
const BREATHE  = 1200;  // audience absorb toàn cảnh
const LINGER   = 2000;  // dừng lâu cho "wow moment"
const SHOWCASE = 2500;  // dừng rất lâu cho killer moment
const TYPE_MS  = 25;    // gõ phím tay pro

test.use({
  video: { mode: 'on', size: { width: 1920, height: 1080 } },
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 15_000,
});

/**
 * Smooth scroll helper — cuộn mượt đến element hoặc tọa độ
 */
async function smoothScroll(
  page: import('@playwright/test').Page,
  target: string | number
) {
  if (typeof target === 'string') {
    await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, target);
  } else {
    await page.evaluate((y) => {
      window.scrollTo({ top: y, behavior: 'smooth' });
    }, target);
  }
  await page.waitForTimeout(GLANCE);
}

test('🎬 THE ULTIMATE — An Tâm Kitchen Final Demo BKI 2026', async ({ page }) => {

  // ═══════════════════════════════════════════════════════════════
  // SCENE 0: LANDING PAGE — Ấn tượng đầu tiên
  // ═══════════════════════════════════════════════════════════════

  await test.step('Scene 0 — Landing Page First Impression', async () => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(BREATHE);

    // Hero headline — audience đọc tagline
    await page.waitForTimeout(LINGER);

    // Cuộn nhẹ xuống hero preview
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(BREATHE);

    // Features section
    await smoothScroll(page, '#features');
    await page.waitForTimeout(BREATHE);

    // Cách hoạt động
    await smoothScroll(page, '#add-food');
    await page.waitForTimeout(GLANCE);

    // Scroll lên lại
    await smoothScroll(page, 0);
    await page.waitForTimeout(BEAT);
  });

  // ═══════════════════════════════════════════════════════════════
  // SCENE 1: GUEST LOGIN — 1-click Đăng nhập
  // ═══════════════════════════════════════════════════════════════

  await test.step('Scene 1 — Đăng nhập bằng tài khoản khách', async () => {
    // Click "Đăng nhập" trên header
    const loginLink = page.locator('header a[href="/login"], header a:has-text("Đăng nhập")').first();
    await loginLink.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(BREATHE);

    // Audience thấy form login pro
    await page.waitForTimeout(GLANCE);

    // 1-click guest login
    const guestBtn = page.locator('button:has-text("Dùng tài khoản khách")');
    await expect(guestBtn).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(BEAT);
    await guestBtn.click();

    // Chờ redirect
    await page.waitForURL('**/', { timeout: 10000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(BREATHE);
  });

  // ═══════════════════════════════════════════════════════════════
  // SCENE 2: DASHBOARD OVERVIEW — Stat Cards + Food List
  // ═══════════════════════════════════════════════════════════════

  await test.step('Scene 2 — Dashboard Tủ lạnh số', async () => {
    // Scroll đến dashboard
    await smoothScroll(page, '#digital-fridge');
    await page.waitForTimeout(BREATHE);

    // Audience thấy stat cards
    await page.waitForTimeout(LINGER);

    // Cuộn thấy food cards
    await page.mouse.wheel(0, 350);
    await page.waitForTimeout(BREATHE);

    // ─── Tab Filter Demo ───
    const useSoonTab = page.locator('button[role="tab"]:has-text("Nên dùng sớm")');
    if (await useSoonTab.isVisible().catch(() => false)) {
      await useSoonTab.click();
      await page.waitForTimeout(GLANCE);
    }

    const checkTab = page.locator('button[role="tab"]:has-text("Cần kiểm tra")');
    if (await checkTab.isVisible().catch(() => false)) {
      await checkTab.click();
      await page.waitForTimeout(GLANCE);
    }

    // Quay lại "Tất cả"
    const allTab = page.locator('button[role="tab"]:has-text("Tất cả")');
    if (await allTab.isVisible().catch(() => false)) {
      await allTab.click();
      await page.waitForTimeout(GLANCE);
    }
    await page.waitForTimeout(BEAT);
  });

  // ═══════════════════════════════════════════════════════════════
  // TRẠM 1: SKELETON UI — Click detail → Skeleton → Nội dung
  // ═══════════════════════════════════════════════════════════════

  await test.step('Trạm 1 — Chi tiết thực phẩm (Skeleton → Detail)', async () => {
    // Click "Xem chi tiết" item đầu
    const detailLink = page.locator('a:has-text("Xem chi tiết")').first();
    await detailLink.scrollIntoViewIfNeeded();
    await page.waitForTimeout(BEAT);
    await detailLink.click();

    // 🎯 KEY MOMENT: Skeleton UI flash → transition mượt
    await page.waitForTimeout(BREATHE);

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(GLANCE);

    // Cuộn xem thông tin chi tiết
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(BREATHE);

    // Section "Vì sao có trạng thái này?"
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(GLANCE);

    // Quay lại dashboard
    const backBtn = page.locator('a:has-text("Quay lại tủ lạnh")');
    if (await backBtn.isVisible().catch(() => false)) {
      await backBtn.click();
    } else {
      await page.goBack();
    }
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(BREATHE);
  });

  // ═══════════════════════════════════════════════════════════════
  // TRẠM 2: THÊM THỦ CÔNG — Form + Optimistic Update
  // ═══════════════════════════════════════════════════════════════

  await test.step('Trạm 2 — Thêm thực phẩm thủ công (Optimistic Update)', async () => {
    // Click "Thêm thực phẩm"
    const addBtn = page.locator('a:has-text("Thêm thực phẩm")').first();
    await addBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(BEAT);
    await addBtn.click();

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(BREATHE);

    // ─── Gõ thủ công (pro speed) ───
    const nameInput = page.locator('#name');
    await nameInput.click();
    await page.waitForTimeout(BEAT);
    await nameInput.pressSequentially('Phô mai Mozzarella', { delay: TYPE_MS });
    await page.waitForTimeout(GLANCE);

    // Chọn nhóm thực phẩm
    const categoryTrigger = page.locator('#category');
    await categoryTrigger.click();
    await page.waitForTimeout(BEAT);
    const dairyOption = page.locator('[role="option"]:has-text("Sữa")').first();
    if (await dairyOption.isVisible().catch(() => false)) {
      await dairyOption.click();
    } else {
      await page.locator('[role="option"]').first().click();
    }
    await page.waitForTimeout(GLANCE);

    // Chọn vị trí bảo quản
    const storageTrigger = page.locator('#storageLocation');
    await storageTrigger.click();
    await page.waitForTimeout(BEAT);
    const fridgeOption = page.locator('[role="option"]:has-text("Ngăn mát")').first();
    if (await fridgeOption.isVisible().catch(() => false)) {
      await fridgeOption.click();
    } else {
      await page.locator('[role="option"]').first().click();
    }
    await page.waitForTimeout(GLANCE);

    // Ngày mở nắp
    const openedAtInput = page.locator('#openedAt');
    const today = new Date().toISOString().split('T')[0];
    await openedAtInput.fill(today);
    await page.waitForTimeout(GLANCE);

    // Ghi chú
    const notesInput = page.locator('#notes');
    await notesInput.click();
    await notesInput.pressSequentially('Demo BKI 2026 - An Tam Kitchen', { delay: TYPE_MS });
    await page.waitForTimeout(GLANCE);

    // Scroll xuống thấy submit
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(BEAT);

    // 🎯 KEY MOMENT: Click "Lưu thực phẩm" → "Đang lưu..." cực nhanh
    const saveBtn = page.locator('button[type="submit"]:has-text("Lưu thực phẩm")');
    await saveBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(BEAT);
    await saveBtn.click();

    // Hold for optimistic update → redirect
    await page.waitForTimeout(BREATHE);

    try {
      await page.waitForURL('**/#digital-fridge', { timeout: 8000 });
    } catch {
      // redirect to / is ok
    }
    await page.waitForTimeout(BREATHE);

    // ─── Xác nhận món mới trên Dashboard ───
    await smoothScroll(page, '#digital-fridge');
    await page.waitForTimeout(GLANCE);

    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(BREATHE);

    // Tìm card Phô mai Mozzarella vừa thêm
    const newCard = page.locator('article:has-text("Phô mai Mozzarella"), h3:has-text("Phô mai Mozzarella")').first();
    if (await newCard.isVisible().catch(() => false)) {
      await newCard.scrollIntoViewIfNeeded();
      await page.waitForTimeout(LINGER); // WOW: nó đã có ở đây!
    }
    await page.waitForTimeout(BEAT);
  });

  // ═══════════════════════════════════════════════════════════════
  // TRẠM 3: THE KILLER FEATURE — Quét QR Hóa đơn Siêu thị
  // ═══════════════════════════════════════════════════════════════

  await test.step('Trạm 3 — Killer Feature: Quét QR hóa đơn siêu thị', async () => {

    // ─── Navigate to scan page ───
    // Click nút "Quét hóa đơn" trên Dashboard (nếu visible) hoặc đi trực tiếp
    const scanBtn = page.locator('a:has-text("Quét hóa đơn")').first();
    if (await scanBtn.isVisible().catch(() => false)) {
      await scanBtn.scrollIntoViewIfNeeded();
      await page.waitForTimeout(BEAT);
      await scanBtn.click();
    } else {
      await page.goto('/foods/scan');
    }
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(BREATHE);

    // ─── Audience thấy giao diện scan QR ───
    // Camera viewport (sẽ hiện camera thật trên điện thoại, vùng đen trên test)
    await page.waitForTimeout(LINGER);

    // Scroll xuống thấy nút Demo
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(GLANCE);

    // ─── Click "Giả lập quét hóa đơn" ───
    const demoScanBtn = page.locator('button:has-text("Giả lập quét hóa đơn")');
    await expect(demoScanBtn).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(BEAT);
    await demoScanBtn.click();

    // Chờ API response + transition sang Preview
    await page.waitForTimeout(BREATHE);

    // ═══ PREVIEW PHASE ═══
    // 🎯 KEY MOMENT: Danh sách sản phẩm siêu thị hiện ra

    // Scroll lên đầu để thấy receipt header (store name, tổng tiền)
    await smoothScroll(page, 0);
    await page.waitForTimeout(BREATHE);

    // Dừng lâu — BGK đọc store name + tổng hóa đơn
    await page.waitForTimeout(LINGER);

    // Cuộn chậm xuống xem danh sách items
    await page.mouse.wheel(0, 250);
    await page.waitForTimeout(BREATHE);

    // 🎯 WOW: Barcode, NSX, HSD chính xác — data siêu thị thật
    await page.waitForTimeout(SHOWCASE);

    // Cuộn tiếp xem hết danh sách
    await page.mouse.wheel(0, 250);
    await page.waitForTimeout(BREATHE);

    // Cuộn đến nút "Lưu ... sản phẩm vào tủ lạnh"
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(GLANCE);

    // ─── Click "Lưu N sản phẩm vào tủ lạnh" ───
    const bulkSaveBtn = page.locator('button:has-text("sản phẩm vào tủ lạnh")');
    await expect(bulkSaveBtn).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(BEAT);
    await bulkSaveBtn.click();

    // 🎯 KEY MOMENT: Bulk add processing → Success animation
    await page.waitForTimeout(LINGER);

    // ═══ DONE PHASE ═══
    // Chờ success screen
    const successHeading = page.locator('h2:has-text("thành công")');
    await expect(successHeading).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(SHOWCASE);

    // Click "Xem tủ lạnh" → về Dashboard
    const viewFridgeBtn = page.locator('button:has-text("Xem tủ lạnh")');
    await expect(viewFridgeBtn).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(BEAT);
    await viewFridgeBtn.click();

    await page.waitForTimeout(BREATHE);
  });

  // ═══════════════════════════════════════════════════════════════
  // FINALE: THE RESULT — Tất cả thực phẩm trong tủ lạnh số
  // ═══════════════════════════════════════════════════════════════

  await test.step('Finale — Tủ lạnh số đầy đủ', async () => {
    // Đảm bảo về trang chủ
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(GLANCE);

    // Scroll đến dashboard
    await smoothScroll(page, '#digital-fridge');
    await page.waitForTimeout(BREATHE);

    // 🎯 FINAL WOW: Stat cards cập nhật — tổng số món tăng lên
    await page.waitForTimeout(LINGER);

    // Cuộn chậm xuống danh sách — thấy cả món thêm tay lẫn quét hóa đơn
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(BREATHE);

    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(BREATHE);

    // Cuộn thêm — show hết food cards
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(LINGER);

    // ─── Final Shot: Scroll lên hero — branding shot ───
    await smoothScroll(page, 0);
    await page.waitForTimeout(BREATHE);

    // Dừng tại hero headline — closing shot
    await page.waitForTimeout(SHOWCASE);

    // 📸 Final screenshot
    await page.screenshot({ path: 'bki-ultimate-final.png', fullPage: false });
  });
});
