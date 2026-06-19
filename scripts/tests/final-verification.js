const { chromium } = require('playwright');

(async () => {
  console.log('🧪 التحقق النهائي من جميع الإصلاحات...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  try {
    console.log('1️⃣ الوصول إلى التطبيق (المنفذ 3002)...');
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(2000);
    console.log('✅ تم تحميل التطبيق بنجاح\n');

    // المشكلة 1: اختبار عرض المرفقات
    console.log('2️⃣ اختبار المشكلة 1: منطق عرض المرفقات...');
    console.log('   رفع ملف PDF...');

    const fileInput = await page.locator('input[type="file"]').first();
    await fileInput.setInputFiles({
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PD4+Pj4KZW5kb2JqCnhyZWYKMCA0CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxNSAwMDAwMCBuIAowMDAwMDAwMDY0IDAwMDAwIG4gCjAwMDAwMDAxMjEgMDAwMDAgbiAKdHJhaWxlcgo8PC9TaXplIDQvUm9vdCAxIDAgUj4+CnN0YXJ0eHJlZgoyMDIKJSVFT0Y=', 'base64')
    });
    await page.waitForTimeout(1000);

    // إرسال الرسالة
    await page.fill('textarea[placeholder*="صِف"]', 'اختبار عرض المرفقات');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // التحقق مما إذا تم استخدام FileAttachmentIcon
    const hasFileIcon = await page.locator('.inline-flex.items-center.gap-2').count();
    console.log(`   عرض أيقونة المرفق: ${hasFileIcon > 0 ? '✅' : '❌'}`);

    // التحقق مما إذا كان التمرير فوق العنصر يُظهر النافذة المنبثقة
    if (hasFileIcon > 0) {
      await page.locator('.inline-flex.items-center.gap-2').first().hover();
      await page.waitForTimeout(500);
      const hasTooltip = await page.locator('[role="tooltip"]').count();
      console.log(`   النافذة المنبثقة عند التمرير: ${hasTooltip > 0 ? '✅' : '❌'}`);
    }
    console.log('');

    // المشكلة 3: اختبار عرض النموذج
    console.log('3️⃣ اختبار المشكلة 3: عرض النموذج بالعرض الكامل...');
    await page.fill('textarea[placeholder*="صِف"]', 'اكتب لي خطة اختبار');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(8000);

    // التحقق من عرض النموذج
    const formCards = await page.locator('.border-primary\\/20').all();
    if (formCards.length > 0) {
      const box = await formCards[0].boundingBox();
      const viewportSize = page.viewportSize();
      const widthPercent = box ? (box.width / viewportSize.width * 100).toFixed(1) : 0;
      console.log(`   عرض النموذج: ${box?.width}px (${widthPercent}% من نافذة العرض)`);
      console.log(`   ${box && box.width > 1200 ? '✅ عرض كامل' : '❌ لا يزال ضيقًا'}\n`);
    }

    // المشكلة 2: اختبار عرض المعاينة بملء الشاشة
    console.log('4️⃣ اختبار المشكلة 2: عرض المعاينة بملء الشاشة...');
    const fullscreenBtn = await page.locator('button[title*="ملء الشاشة"]').first();
    if (await fullscreenBtn.count() > 0) {
      await fullscreenBtn.click();
      await page.waitForTimeout(1000);

      const modal = await page.locator('.fixed.inset-0').first();
      const modalBox = await modal.boundingBox();
      const modalWidthPercent = modalBox ? (modalBox.width / viewportSize.width * 100).toFixed(1) : 0;
      console.log(`   عرض ملء الشاشة: ${modalBox?.width}px (${modalWidthPercent}% من نافذة العرض)`);
      console.log(`   ${modalBox && modalBox.width > 1500 ? '✅ عريض بما يكفي' : '❌ لا يزال ضيقًا'}\n`);

      // إغلاق وضع ملء الشاشة
      await page.keyboard.press('Escape');
    }

    console.log('📝 يُرجى التحقق يدويًا:');
    console.log('   1. هل تُعرض المرفقات باستخدام أيقونة SVG');
    console.log('   2. هل يُظهر التمرير فوق المرفق نافذة منبثقة');
    console.log('   3. هل يشغل النموذج معظم العرض');
    console.log('   4. هل المعاينة بملء الشاشة أعرض من الوضع الافتراضي\n');

    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ فشل الاختبار:', error.message);
  } finally {
    await browser.close();
    console.log('\n🎉 اكتمل الاختبار!');
  }
})();
