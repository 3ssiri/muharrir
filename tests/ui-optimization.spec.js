const { test, expect } = require('@playwright/test');

test.describe('اختبار تحسين واجهة المستخدم', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ar');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/ar');
    await page.waitForLoadState('networkidle');
  });

  test('اختبار واجهة مربع البحث', async ({ page }) => {
    // التحقق من وجود مربع البحث
    const searchInput = page.locator('input[placeholder="ابحث في المحادثات..."]');
    await expect(searchInput).toBeVisible();

    // اختبار وظيفة البحث
    await searchInput.fill('اختبار');

    // التحقق من ظهور زر المسح
    const clearButton = page.getByRole('button', { name: 'مسح البحث' });
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
    await expect(page.locator('text=Muharrir')).toBeVisible();
    await expect(page.getByText('لست بحاجة إلى مفتاح API للتجربة الأولى')).toBeVisible();
    await expect(page.getByRole('button', { name: 'جرّب بدون مفتاح' })).toBeVisible();
    const ollamaButton = page.getByRole('button', { name: 'استخدم Ollama المحلي' });
    if (await ollamaButton.isVisible().catch(() => false)) {
      await expect(page.getByText(/تم العثور على Ollama محليًا/)).toBeVisible();
    }

    // التحقق من أزرار الأمثلة السريعة
    await expect(page.locator('text=مقال تحليل اتجاهات الذكاء الاصطناعي')).toBeVisible();
    await expect(page.locator('text=إنشاء مخطط عرض تقديمي')).toBeVisible();
    await expect(page.locator('text=مساعد تحسين الشيفرة')).toBeVisible();
    await expect(page.locator('text=تصميم استبيان')).toBeVisible();
  });

  test('اختبار تحميل الواجهة الإنجليزية', async ({ page }) => {
    await page.goto('/en');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/en');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: 'Build Perfect Prompts' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Describe your task...' })).toBeVisible();
    await expect(page.getByRole('button', { name: /EN/ })).toBeVisible();
  });

  test('اختبار تبديل اللغة من العربية إلى الإنجليزية', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'ابنِ موجّهات مثالية' })).toBeVisible();

    await page.getByRole('button', { name: /AR/ }).click();

    await expect(page).toHaveURL(/\/en\/?$/);
    await expect(page.getByRole('heading', { name: 'Build Perfect Prompts' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Describe your task...' })).toBeVisible();
  });

  test('اختبار حقل الإدخال وزر الإرسال', async ({ page }) => {
    const input = page.getByRole('textbox', { name: /مهمتك/ });
    await expect(input).toBeVisible();

    await input.fill('رسالة اختبار');

    const sendButton = page.getByRole('button', { name: 'إرسال' });
    await expect(sendButton).toBeEnabled();
  });

  test('تفعيل الوضع التجريبي من الإعدادات وتشغيل تدفق prompt', async ({ page }) => {
    await page.getByRole('button', { name: 'جرّب بدون مفتاح' }).click();
    await expect(page.getByText('الوضع التجريبي مفعّل محليًا')).toBeVisible();

    const input = page.getByRole('textbox', { name: /مهمتك/ });
    await input.fill('حوّل فكرة دورة قصيرة عن أساسيات الذكاء الاصطناعي إلى موجه منظم');
    await page.getByRole('button', { name: 'إرسال' }).click();

    await expect(page.getByText('اقتراحات التحسين')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Document-to-Prompt Assistant')).toBeVisible();
  });

  test('نسخ وحفظ وتصدير مقترح الوضع التجريبي', async ({ page }) => {
    await page.locator('[data-settings-trigger]').click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'تفعيل التجربة' }).click();
    await dialog.getByRole('button', { name: 'حفظ التغييرات' }).click();
    await expect(dialog).toBeHidden();

    await page.getByRole('textbox', { name: /مهمتك/ }).fill('جهّز موجهًا منظّمًا لفكرة منتج تعليمي');
    await page.getByRole('button', { name: 'إرسال' }).click();
    await expect(page.getByText('Document-to-Prompt Assistant')).toBeVisible({ timeout: 10000 });

    await page.getByRole('tab', { name: 'معاينة' }).click();
    await expect(page.getByText('الموجّه النهائي', { exact: true })).toBeVisible();
    await page.getByTestId('prompt-copy-button').click();

    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('prompt-export-button').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/^muharrir-prompt-\d+\.md$/);

    await page.getByTestId('prompt-favorite-button').click();
    await expect(page.getByText('تمت الإضافة إلى المفضّلة')).toBeVisible();

    await page.getByRole('button', { name: 'المفضّلة', exact: true }).click();
    await expect(page.getByText('Document-to-Prompt Assistant')).toBeVisible();
  });

  test('اختبار رفع ملفات نصية وPDF وDOCX محليًا', async ({ page }) => {
    const fileInput = page.locator('#file-input');

    await fileInput.setInputFiles({
      name: 'sample-notes.md',
      mimeType: 'text/markdown',
      buffer: Buffer.from('# ملاحظات\n\nهذا ملف اختبار محلي.'),
    });
    await expect(page.getByText('sample-notes.md')).toBeVisible();
    await expect(page.getByText('تُحلّل الملفات محليًا أولًا')).toBeVisible();

    await fileInput.setInputFiles('tests/test-sample.pdf');
    await expect(page.getByText('test-sample.pdf')).toBeVisible({ timeout: 10000 });

    const docxBase64 =
      'UEsDBBQAAAAIAEyg6FzrshtFtQAAACsBAAALAAAAX3JlbHMvLnJlbHONz7GOwjAQBND+JP7B2p44XIHQKQ4NQqJF4QMse5NY2LuW13eEv7+GAk5X0I5GbzTdfklR/WCRwGRg07SgkBz7QJOBy3Bc70BJteRtZEIDdxTY990Zo62BSeaQRS0pkhiYa81fWoubMVlpOCMtKY5ckq3ScJl0tu5qJ9SfbbvV5dmAV1OdvIFy8htQwz3jOzaPY3B4YPedkOo/E38aoAZbJqwGbly89o+4WVIE3Xf65WK/+vgFUEsDBBQAAAAIAEyg6Fx/vF6/rwAAAN4AAAARAAAAd29yZC9kb2N1bWVudC54bWxFzjFPwzAQBeAdif9geW+cMlQoStKBig11KRKriY/Ewndn3bkk/ffIZWD53nB6T9cfN0zmB0Qj02D3TWsN0MQh0jzY98vr7tkaLZ6CT0ww2BuoPY792gWerghUzIaJtFsHu5SSO+d0WgC9NpyBNkxfLOiLNiyzW1lCFp5ANdKMyT217cGhj2Tr5CeHW81ckUoZ366LF4liTueXD6PI39C7eqjK3Xz3r+z+HxsfH34BUEsDBBQAAAAIAEyg6Fx/3FVA8AAAAK8BAAATAAAAW0NvbnRlbnRfVHlwZXNdLnhtbH2QvU7DMBSFdyTewfKKYgcGhFCdDvyMwFAewLJvEqv2vZavG9K3R2lLB1SYz893dFbrOUUxQeFAaOStaqUAdOQDDkZ+bl6bBym4WvQ2EoKRe2C57labfQYWc4rIRo615ket2Y2QLCvKgHOKPZVkKysqg87Wbe0A+q5t77UjrIC1qUuH7FbP0NtdrOJlroDHHQUiS/F0NC4sI23OMThbA6Ge0P+iNCeCKhAPHh5D5ps5RakvEhblb8Ap9z5BKcGD+LClvtkERuovKl57crsEWNX/NRd2Ut8HB+f80pYLOWAOOKSozkqyAX/268Pd3fXVN1BLAQIUABQAAAAIAEyg6FzrshtFtQAAACsBAAALAAAAAAAAAAAAAAAAAAAAAABfcmVscy8ucmVsc1BLAQIUABQAAAAIAEyg6Fx/vF6/rwAAAN4AAAARAAAAAAAAAAAAAAAAAN4AAAB3b3JkL2RvY3VtZW50LnhtbFBLAQIUABQAAAAIAEyg6Fx/3FVA8AAAAK8BAAATAAAAAAAAAAAAAAAAALwBAABbQ29udGVudF9UeXBlc10ueG1sUEsFBgAAAAADAAMAuQAAAN0CAAAAAA==';
    await fileInput.setInputFiles({
      name: 'sample.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      buffer: Buffer.from(docxBase64, 'base64'),
    });
    await expect(page.getByText('sample.docx')).toBeVisible({ timeout: 10000 });
  });
});
