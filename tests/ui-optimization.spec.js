const { test, expect } = require('@playwright/test');

test.describe('اختبار تحسين واجهة المستخدم', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('اختبار واجهة مربع البحث', async ({ page }) => {
    // التحقق من وجود مربع البحث
    const searchInput = page.locator('input[placeholder="ابحث في المحادثات..."]');
    await expect(searchInput).toBeVisible();

    // اختبار وظيفة البحث
    await searchInput.fill('اختبار');

    // التحقق من ظهور زر المسح
    const clearButton = page.locator('button:has(svg)').filter({ hasText: '' }).first();
    await expect(clearButton).toBeVisible();

    // النقر على زر المسح
    await clearButton.click();
    await expect(searchInput).toHaveValue('');
  });

  test('اختبار محدد النموذج', async ({ page }) => {
    // التحقق من وجود محدد النموذج
    const modelSelect = page.locator('button:has-text("deepseek")').first();
    await expect(modelSelect).toBeVisible();

    // النقر لفتح القائمة المنسدلة
    await modelSelect.click();

    // انتظار ظهور القائمة المنسدلة
    await page.waitForTimeout(500);
  });

  test('اختبار تحميل الصفحة الرئيسية', async ({ page }) => {
    // التحقق من وجود العنوان
    await expect(page.locator('text=Prompt Iterator')).toBeVisible();

    // التحقق من أزرار الأمثلة السريعة
    await expect(page.locator('text=مقال تحليل اتجاهات الذكاء الاصطناعي')).toBeVisible();
    await expect(page.locator('text=إنشاء مخطط عرض تقديمي')).toBeVisible();
    await expect(page.locator('text=مساعد تحسين الشيفرة')).toBeVisible();
    await expect(page.locator('text=تصميم استبيان')).toBeVisible();
  });

  test('اختبار حقل الإدخال وزر الإرسال', async ({ page }) => {
    // التحقق من حقل الإدخال
    const input = page.locator('input[placeholder="صِف مهمتك..."]');
    await expect(input).toBeVisible();

    // إدخال النص
    await input.fill('رسالة اختبار');

    // التحقق مما إذا كان زر الإرسال متاحًا
    const sendButton = page.locator('button[type="submit"]');
    await expect(sendButton).toBeEnabled();
  });
});
