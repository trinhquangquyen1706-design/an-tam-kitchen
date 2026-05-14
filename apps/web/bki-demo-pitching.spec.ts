/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║          BKI DEMO PITCHING — An Tâm Kitchen                ║
 * ║     Video Demo cho Bách Khoa Innovation 2026                ║
 * ║     v2 — Snappy pace, vẫn giữ Skeleton & Optimistic        ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * Chạy: npx playwright test bki-demo-pitching.spec.ts --headed
 * Output: apps/web/demo-video-output/
 */

import { test, expect } from '@playwright/test';

// ─── Timing: Snappy nhưng vẫn readable ─────────────────────
const BEAT = 500;          // nhịp ngắn — chuyển cảnh micro
const GLANCE = 800;        // đủ để mắt nhận diện UI element
const BREATHE = 1200;      // dừng nhẹ — audience absorb toàn cảnh
const TYPING_DELAY = 35;   // gõ nhanh, tay quen

test.use({
  video: { mode: 'on', size: { width: 1920, height: 1080 } },
  viewport: { width: 1920, height: 1080 },
  actionTimeout: 15000,
});

test('🎬 An Tâm Kitchen — Demo Pitching BKI 2026 v2', async ({ page }) => {

  // ═══════════════════════════════════════════════════════════
  // SCENE 1: LOGIN
  // ═══════════════════════════════════════════════════════════

  await test.step('Scene 1: Đăng nhập', async () => {
    await page.goto('http://localhost:3000/login');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(BREATHE);

    // Email
    const emailInput = page.locator('input[type="email"], input[name="email"], #email');
    await emailInput.click();
    await page.waitForTimeout(BEAT);
    await emailInput.pressSequentially('demo@antam.vn', { delay: TYPING_DELAY });
    await page.waitForTimeout(GLANCE);

    // Password
    const passwordInput = page.locator('input[type="password"], input[name="password"], #password');
    await passwordInput.click();
    await page.waitForTimeout(BEAT);
    await passwordInput.pressSequentially('Demo@2026', { delay: TYPING_DELAY });
    await page.waitForTimeout(GLANCE);

    // Submit
    const loginBtn = page.locator('button[type="submit"]');
    await loginBtn.click();
    await page.waitForTimeout(BREATHE);

    await page.waitForURL('**/');
    await page.waitForTimeout(GLANCE);
  });

  // ═══════════════════════════════════════════════════════════
  // SCENE 2: DASHBOARD — Skeleton + Tủ lạnh số
  // ═══════════════════════════════════════════════════════════

  await test.step('Scene 2: Dashboard Tủ lạnh số', async () => {
    await page.waitForTimeout(BREATHE);

    // Smooth scroll → dashboard
    await page.evaluate(() => {
      const el = document.querySelector('#digital-fridge')
        || document.querySelector('[id*="fridge"]')
        || document.querySelector('section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    await page.waitForTimeout(BREATHE);

    // Scroll thêm để thấy food cards
    await page.mouse.wheel(0, 350);
    await page.waitForTimeout(BREATHE);
  });

  // ═══════════════════════════════════════════════════════════
  // SCENE 3: THÊM THỰC PHẨM — Optimistic Update
  // ═══════════════════════════════════════════════════════════

  await test.step('Scene 3: Thêm thực phẩm — Optimistic Update', async () => {
    const addBtn = page.locator('a:has-text("Thêm thực phẩm"), button:has-text("Thêm thực phẩm")').first();
    await addBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(BEAT);
    await addBtn.click();

    // Chờ form load — đây là lúc Skeleton có thể flash
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(BREATHE);

    // Auto-fill bằng "Dùng sản phẩm mẫu"
    const sampleBtn = page.locator('button:has-text("Dùng sản phẩm mẫu")');
    await sampleBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(BEAT);
    await sampleBtn.click();
    await page.waitForTimeout(BREATHE);

    // Lưu — audience sẽ thấy nút chuyển → "Đang lưu..."
    const saveBtn = page.locator('button[type="submit"]:has-text("Lưu thực phẩm")');
    await saveBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(BEAT);
    await saveBtn.click();

    // Giữ BREATHE ở đây để camera bắt được "Đang lưu..." → redirect
    await page.waitForTimeout(BREATHE);

    try {
      await page.waitForURL('**/#digital-fridge', { timeout: 6000 });
    } catch { /* redirect về / cũng ok */ }
    await page.waitForTimeout(BREATHE);
  });

  // ═══════════════════════════════════════════════════════════
  // SCENE 4: FINAL SHOT
  // ═══════════════════════════════════════════════════════════

  await test.step('Scene 4: Final — Toàn cảnh', async () => {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(BREATHE);

    await page.evaluate(() => {
      const el = document.querySelector('#digital-fridge');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    await page.waitForTimeout(BREATHE);

    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(BREATHE);

    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(BREATHE);
  });
});
