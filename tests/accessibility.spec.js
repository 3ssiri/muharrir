const { test, expect } = require('@playwright/test');

test.describe('إمكانية الوصول: لوحة المفاتيح وقارئ الشاشة', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ar');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/ar');
    await page.waitForLoadState('networkidle');
  });

  test('ضبط lang وdir على عنصر html للعربية', async ({ page }) => {
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'ar');
    await expect(html).toHaveAttribute('dir', 'rtl');
  });

  test('ضبط lang وdir على عنصر html للإنجليزية', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
    await expect(html).toHaveAttribute('dir', 'ltr');
  });

  test('الأزرار الأيقونية لها أسماء ميسّرة', async ({ page }) => {
    // أزرار أيقونية محددة بأسمائها العربية
    await expect(page.getByRole('button', { name: 'تبديل المظهر' })).toBeVisible();
    await expect(page.locator('[data-settings-trigger]')).toHaveAttribute('aria-label', 'الإعدادات');
    await expect(page.getByRole('button', { name: 'طيّ الشريط الجانبي' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'مسح المحادثة' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'رفع ملف' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'إرسال' })).toBeAttached();
    // مبدّل اللغة يحتفظ باسمه النصي
    await expect(page.getByRole('button', { name: /AR/ })).toBeVisible();

    // مسح شامل: كل زر مرئي يجب أن يملك اسماً ميسّراً غير فارغ
    const buttons = await page.locator('button:visible').all();
    expect(buttons.length).toBeGreaterThan(0);
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const text = (await button.innerText()).trim();
      const name = (ariaLabel || text).trim();
      expect(name.length, 'زر مرئي بلا اسم ميسّر').toBeGreaterThan(0);
    }
  });

  test('الأسماء الميسّرة بالإنجليزية', async ({ page }) => {
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('button', { name: 'Toggle theme' })).toBeVisible();
    await expect(page.locator('[data-settings-trigger]')).toHaveAttribute('aria-label', 'Settings');
    await expect(page.getByRole('button', { name: 'Collapse sidebar' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Upload file' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send' })).toBeAttached();
  });

  test('مفتاح Tab يصل إلى عناصر تفاعلية وحقل الإدخال قابل للتركيز', async ({ page }) => {
    // التنقل بمفتاح Tab يجب أن يصل إلى عنصر تفاعلي واحد على الأقل خلال بضع ضغطات
    const interactiveTags = new Set(['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'A']);
    let reachedInteractive = false;
    for (let i = 0; i < 15 && !reachedInteractive; i++) {
      await page.keyboard.press('Tab');
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      reachedInteractive = interactiveTags.has(tag || '');
    }
    expect(reachedInteractive, 'لم يصل Tab إلى أي عنصر تفاعلي').toBe(true);

    // حقل الإدخال يستقبل التركيز تلقائياً عند التحميل ويقبل التركيز بالنقر/التنقل
    const input = page.getByRole('textbox', { name: /مهمتك/ });
    await input.focus();
    await expect(input).toBeFocused();
  });

  test('إرسال الرسالة بمفتاح Enter من حقل الإدخال', async ({ page }) => {
    await page.getByRole('button', { name: 'جرّب بدون مفتاح' }).click();
    await expect(page.getByText('الوضع التجريبي مفعّل محليًا')).toBeVisible();

    const input = page.getByRole('textbox', { name: /مهمتك/ });
    await input.fill('حوّل فكرة دورة قصيرة عن أساسيات الذكاء الاصطناعي إلى موجه منظم');
    await input.press('Enter');

    await expect(page.getByText('اقتراحات التحسين')).toBeVisible({ timeout: 10000 });
  });

  test('التركيز ينتقل إلى مربع حوار الإعدادات ويعود عند Escape', async ({ page }) => {
    const trigger = page.locator('[data-settings-trigger]');
    await trigger.focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // التركيز داخل مربع الحوار (مصيدة تركيز Radix)
    const focusInside = await page.evaluate(() => {
      const dialogEl = document.querySelector('[role="dialog"]');
      return !!dialogEl && dialogEl.contains(document.activeElement);
    });
    expect(focusInside).toBe(true);

    // Escape يغلق الحوار ويعيد التركيز إلى الزر المفتِح
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('عناصر جلسات الشريط الجانبي تعمل بلوحة المفاتيح', async ({ page }) => {
    // زرع جلسة ورسالة مباشرة في IndexedDB (نفس مخطط Dexie في src/lib/db.ts)
    await page.evaluate(async () => {
      const db = await new Promise((resolve, reject) => {
        const req = indexedDB.open('PromptIteratorDB');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      const sessionId = await new Promise((resolve, reject) => {
        const tx = db.transaction('chatSessions', 'readwrite');
        const req = tx.objectStore('chatSessions').add({
          title: 'جلسة لوحة المفاتيح',
          previewText: 'معاينة الجلسة',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
      await new Promise((resolve, reject) => {
        const tx = db.transaction('messages', 'readwrite');
        const req = tx.objectStore('messages').add({
          sessionId,
          role: 'user',
          content: 'رسالة محفوظة للاختبار',
          createdAt: new Date(),
        });
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });
    });

    // إعادة التحميل كي تلتقط القائمة الجانبية الجلسة المزروعة
    await page.goto('/ar');
    await page.waitForLoadState('networkidle');

    const sessionItem = page.getByRole('button', { name: /جلسة لوحة المفاتيح/ });
    await expect(sessionItem).toBeVisible();

    await sessionItem.focus();
    await expect(sessionItem).toBeFocused();
    await page.keyboard.press('Enter');

    // تفعيل الجلسة يعرض رسالتها المحفوظة
    await expect(page.getByText('رسالة محفوظة للاختبار')).toBeVisible({ timeout: 10000 });
  });
});
