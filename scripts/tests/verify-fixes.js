const { chromium } = require('playwright');

(async () => {
  console.log('🧪 التحقق من المشكلات التي تم إصلاحها...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('1️⃣ الوصول إلى التطبيق (المنفذ 3002)...');
    await page.goto('http://localhost:3002');
    await page.waitForTimeout(2000);
    console.log('✅ تم تحميل التطبيق بنجاح\n');

    // اختبار عرض النموذج
    console.log('2️⃣ اختبار ما إذا كان النموذج يُعرض بالعرض الكامل...');
    await page.fill('textarea[placeholder*="صِف"]', 'اكتب لي خطة اختبار');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(8000);

    // التحقق من عرض النموذج
    const formCards = await page.locator('.border-primary\\/20').all();
    if (formCards.length > 0) {
      const box = await formCards[0].boundingBox();
      console.log(`   عرض النموذج: ${box?.width}px`);
      console.log(`   ${box && box.width > 1000 ? '✅ عرض كامل' : '❌ لا يزال ضيقًا'}\n`);
    }

    console.log('📝 يُرجى التحقق يدويًا:');
    console.log('   1. هل يشغل النموذج العرض الكامل');
    console.log('   2. هل تُعرض المرفقات بشكل طبيعي\n');

    await page.waitForTimeout(20000);

  } catch (error) {
    console.error('❌ فشل الاختبار:', error.message);
  } finally {
    await browser.close();
    console.log('\n🎉 اكتمل الاختبار!');
  }
})();
