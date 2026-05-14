/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║       BKI DEMO PITCHING v2 — An Tâm Kitchen Grand Tour         ║
 * ║       Video Demo cho Bách Khoa Innovation 2026                  ║
 * ║       Full Walkthrough: Landing → Auth → Dashboard → CRUD       ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Chạy:
 *   cd apps/web
 *   npx playwright test bki-demo-pitching-full.spec.ts --headed
 *
 * Output: apps/web/demo-video-output/
 */

import { test, expect } from '@playwright/test';

// ─── Timing: Snappy nhưng readable cho BGK ──────────────────
const BEAT     = 500;   // nhịp micro — chuyển cảnh nhanh
const GLANCE   = 800;   // đủ mắt nhận diện 1 element
const BREATHE  = 1200;  // audience absorb toàn cảnh
const LINGER   = 2000;  // dừng lâu hơn cho "wow moment"
const TYPE_MS  = 30;    // tốc độ gõ tay quen

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

test('🎬 An Tâm Kitchen — Grand Tour Demo BKI 2026', async ({ page }) => {

  // ═══════════════════════════════════════════════════════════════
  // SCENE 0: LANDING PAGE — First Impression
  // ═══════════════════════════════════════════════════════════════

  await test.step('Scene 0 — Landing Page Tour', async () => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(BREATHE);

    // Hero — audience đọc headline
    await page.waitForTimeout(LINGER);

    // Cuộn nhẹ xuống thấy hero preview card
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(BREATHE);

    // Cuộn tiếp xuống Features section
    await smoothScroll(page, '#features');
    await page.waitForTimeout(BREATHE);

    // Lướt qua "Cách hoạt động"
    await smoothScroll(page, '#add-food');
    await page.waitForTimeout(BREATHE);

    // Scroll lên lại header
    await smoothScroll(page, 0);
    await page.waitForTimeout(GLANCE);
  });

  // ═══════════════════════════════════════════════════════════════
  // SCENE 1: GUEST LOGIN — Tài khoản khách 1-click
  // ═══════════════════════════════════════════════════════════════

  await test.step('Scene 1 — Đăng nhập bằng tài khoản khách', async () => {
    // Click "Đăng nhập" trên header
    const loginLink = page.locator('header a[href="/login"], header a:has-text("Đăng nhập")').first();
    await loginLink.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(BREATHE);

    // Audience nhìn form login — professional UI
    await page.waitForTimeout(GLANCE);

    // Click "Dùng tài khoản khách" — 1-click magic
    const guestBtn = page.locator('button:has-text("Dùng tài khoản khách")');
    await expect(guestBtn).toBeVisible({ timeout: 5000 });
    await page.waitForTimeout(BEAT);
    await guestBtn.click();

    // Chờ redirect về dashboard
    await page.waitForURL('**/', { timeout: 10000 });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(BREATHE);
  });

  // ═══════════════════════════════════════════════════════════════
  // SCENE 2: DASHBOARD TỦ LẠNH SỐ — Stat Cards + Food List
  // ═══════════════════════════════════════════════════════════════

  await test.step('Scene 2 — Dashboard Tủ lạnh số', async () => {
    // Scroll đến dashboard section
    await smoothScroll(page, '#digital-fridge');
    await page.waitForTimeout(BREATHE);

    // Audience thấy stat cards — Tổng số món, Nên dùng sớm, etc.
    await page.waitForTimeout(LINGER);

    // Cuộn thấy food cards
    await page.mouse.wheel(0, 350);
    await page.waitForTimeout(BREATHE);

    // ─── Tab Filter Interaction ───
    // Click tab "Nên dùng sớm"
    const useSoonTab = page.locator('button[role="tab"]:has-text("Nên dùng sớm")');
    if (await useSoonTab.isVisible().catch(() => false)) {
      await useSoonTab.click();
      await page.waitForTimeout(GLANCE);
    }

    // Click tab "Cần kiểm tra"
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
  // SCENE 3: FOOD DETAIL — Skeleton UI → Chi tiết sản phẩm
  // ═══════════════════════════════════════════════════════════════

  await test.step('Scene 3 — Chi tiết thực phẩm (Skeleton → Detail)', async () => {
    // Click vào "Xem chi tiết" của item đầu tiên
    const detailLink = page.locator('a:has-text("Xem chi tiết")').first();
    await detailLink.scrollIntoViewIfNeeded();
    await page.waitForTimeout(BEAT);
    await detailLink.click();

    // 🎯 KEY MOMENT: Skeleton UI loading → transition mượt
    await page.waitForTimeout(BREATHE);

    // Chờ chi tiết load xong
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(GLANCE);

    // Cuộn xem thông tin sản phẩm
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(BREATHE);

    // Nhìn section "Vì sao có trạng thái này?"
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(BREATHE);

    // Cuộn thấy nút action + disclaimer
    await page.mouse.wheel(0, 200);
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
  // SCENE 4: THÊM THỰC PHẨM — Form + Optimistic Update
  // ═══════════════════════════════════════════════════════════════

  await test.step('Scene 4 — Thêm thực phẩm (Optimistic Update)', async () => {
    // Click "Thêm thực phẩm"
    const addBtn = page.locator('a:has-text("Thêm thực phẩm")').first();
    await addBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(BEAT);
    await addBtn.click();

    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(BREATHE);

    // Audience thấy form layout đẹp
    await page.waitForTimeout(GLANCE);

    // ─── Gõ thủ công (show real typing) ───
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
      // fallback: chọn option đầu tiên
      const firstOption = page.locator('[role="option"]').first();
      await firstOption.click();
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
      const firstOption = page.locator('[role="option"]').first();
      await firstOption.click();
    }
    await page.waitForTimeout(GLANCE);

    // Ngày mở nắp — fill hôm nay
    const openedAtInput = page.locator('#openedAt');
    const today = new Date().toISOString().split('T')[0];
    await openedAtInput.fill(today);
    await page.waitForTimeout(GLANCE);

    // Ghi chú
    const notesInput = page.locator('#notes');
    await notesInput.click();
    await notesInput.pressSequentially('Demo BKI 2026 - Bếp An Tâm', { delay: TYPE_MS });
    await page.waitForTimeout(GLANCE);

    // Scroll xuống thấy action buttons
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(BEAT);

    // 🎯 KEY MOMENT: Click "Lưu thực phẩm" → "Đang lưu..." optimistic
    const saveBtn = page.locator('button[type="submit"]:has-text("Lưu thực phẩm")');
    await saveBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(BEAT);
    await saveBtn.click();

    // Hold for optimistic update state → redirect
    await page.waitForTimeout(BREATHE);

    try {
      await page.waitForURL('**/#digital-fridge', { timeout: 8000 });
    } catch {
      // Redirect to / is also fine
    }
    await page.waitForTimeout(BREATHE);
  });

  // ═══════════════════════════════════════════════════════════════
  // SCENE 5: XÁC NHẬN — Món mới xuất hiện trên Dashboard
  // ═══════════════════════════════════════════════════════════════

  await test.step('Scene 5 — Xác nhận món mới trên Dashboard', async () => {
    // Scroll tới dashboard để thấy món mới vừa thêm
    await smoothScroll(page, '#digital-fridge');
    await page.waitForTimeout(BREATHE);

    // Cuộn xuống danh sách food cards
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(BREATHE);

    // Tìm card "Phô mai Mozzarella" vừa thêm
    const newCard = page.locator('article:has-text("Phô mai Mozzarella"), h3:has-text("Phô mai Mozzarella")').first();
    if (await newCard.isVisible().catch(() => false)) {
      await newCard.scrollIntoViewIfNeeded();
      await page.waitForTimeout(LINGER);  // WOW: nó đã có ở đây!
    }

    await page.waitForTimeout(GLANCE);
  });

  // ═══════════════════════════════════════════════════════════════
  // SCENE 6: XÓA THỰC PHẨM — Delete + Confirmation Dialog
  // ═══════════════════════════════════════════════════════════════

  await test.step('Scene 6 — Xóa thực phẩm (Delete Flow)', async () => {
    // Click vào detail của món vừa thêm (hoặc bất kỳ)
    const detailLink = page.locator('a:has-text("Xem chi tiết")').first();
    await detailLink.scrollIntoViewIfNeeded();
    await page.waitForTimeout(BEAT);
    await detailLink.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(BREATHE);

    // Cuộn xuống thấy nút xóa
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(GLANCE);

    // Click "Đã dùng xong" (delete button)
    const deleteBtn = page.locator('button:has-text("Đã dùng xong")');
    if (await deleteBtn.isVisible().catch(() => false)) {
      await deleteBtn.scrollIntoViewIfNeeded();
      await page.waitForTimeout(BEAT);
      await deleteBtn.click();
      await page.waitForTimeout(GLANCE);

      // 🎯 KEY MOMENT: Confirmation Dialog xuất hiện
      await page.waitForTimeout(BREATHE);

      // Click "Xóa thực phẩm" confirm
      const confirmBtn = page.locator('button:has-text("Xóa thực phẩm")');
      if (await confirmBtn.isVisible().catch(() => false)) {
        await confirmBtn.click();
        await page.waitForTimeout(BREATHE);

        // Toast notification "Đã xóa" + redirect
        await page.waitForTimeout(LINGER);
      } else {
        // Nếu không thấy dialog, nhấn cancel / dismiss
        await page.keyboard.press('Escape');
        await page.waitForTimeout(BEAT);
      }
    }

    // Quay về dashboard nếu chưa redirect
    try {
      await page.waitForURL('**/', { timeout: 5000 });
    } catch {
      const backBtn = page.locator('a:has-text("Quay lại tủ lạnh")');
      if (await backBtn.isVisible().catch(() => false)) {
        await backBtn.click();
      } else {
        await page.goto('/');
      }
    }
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(BREATHE);
  });

  // ═══════════════════════════════════════════════════════════════
  // SCENE 7: FINAL SHOT — Hero Scroll + Branding
  // ═══════════════════════════════════════════════════════════════

  await test.step('Scene 7 — Kết thúc ấn tượng', async () => {
    // Scroll lên top — thấy lại branding header
    await smoothScroll(page, 0);
    await page.waitForTimeout(BREATHE);

    // Cuộn xuống Dashboard 1 lần cuối — mọi thứ đã sạch, gọn
    await smoothScroll(page, '#digital-fridge');
    await page.waitForTimeout(BREATHE);

    // Cuộn nhẹ thấy danh sách
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(BREATHE);

    // Scroll lại lên top — hero shot cuối cùng
    await smoothScroll(page, 0);
    await page.waitForTimeout(LINGER);

    // 📸 Final screenshot
    await page.screenshot({ path: 'bki-demo-v2-final.png', fullPage: false });
  });
});
