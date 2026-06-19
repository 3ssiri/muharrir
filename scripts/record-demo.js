/**
 * سكربت تسجيل العروض التوضيحية تلقائيًا باستخدام Playwright
 * يُستخدم لتسجيل فيديو يوضح ميزات التطبيق
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// الإعدادات
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  outputDir: path.join(__dirname, '../docs/screenshots'),
  viewport: { width: 1920, height: 1080 },
  slowMo: 500, // إبطاء سرعة العمليات لتسهيل التسجيل
};

// التأكد من وجود مجلد المخرجات
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

/**
 * الانتظار لمدة زمنية محددة
 */
async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * تسجيل مسار توليد المطالبات التفاعلي
 */
async function recordInteractiveFlow(page) {
  console.log('📹 بدء التسجيل: مسار توليد المطالبات التفاعلي');

  // انتظار تحميل الصفحة
  await page.waitForLoadState('domcontentloaded');
  await wait(2000);

  // لقطة شاشة: الصفحة الأولية
  await page.screenshot({
    path: path.join(CONFIG.outputDir, 'demo-01-homepage.png'),
    fullPage: true
  });

  console.log('✅ تم التقاط لقطة الشاشة: الصفحة الأولية');

  // النقر على المثال السريع
  await page.click('text=مقال تحليل اتجاهات الذكاء الاصطناعي');
  await wait(500);

  // لقطة شاشة: تم ملء حقل الإدخال
  await page.screenshot({
    path: path.join(CONFIG.outputDir, 'demo-02-input-filled.png'),
    fullPage: true
  });

  console.log('✅ تم التقاط لقطة الشاشة: تم ملء حقل الإدخال');

  // النقر على زر الإرسال
  await page.click('button[type="submit"]');
  await wait(2000);

  // انتظار استجابة الذكاء الاصطناعي
  await page.waitForSelector('text=جارٍ التفكير', { timeout: 5000 }).catch(() => {});
  await wait(3000);

  // لقطة شاشة: الذكاء الاصطناعي يستجيب
  await page.screenshot({
    path: path.join(CONFIG.outputDir, 'demo-03-ai-responding.png'),
    fullPage: true
  });

  console.log('✅ تم التقاط لقطة الشاشة: الذكاء الاصطناعي يستجيب');

  // انتظار ظهور النموذج التفاعلي
  await page.waitForSelector('text=اقتراحات التحسين', { timeout: 15000 }).catch(() => {});
  await wait(1000);

  // لقطة شاشة: النموذج التفاعلي
  await page.screenshot({
    path: path.join(CONFIG.outputDir, 'demo-04-interactive-form.png'),
    fullPage: true
  });

  console.log('✅ تم التقاط لقطة الشاشة: النموذج التفاعلي');

  // اختيار بعض الخيارات
  const buttons = await page.$$('button:has-text("احترافي")');
  if (buttons.length > 0) {
    await buttons[0].click();
    await wait(500);
  }

  // لقطة شاشة: بعد اختيار الخيارات
  await page.screenshot({
    path: path.join(CONFIG.outputDir, 'demo-05-options-selected.png'),
    fullPage: true
  });

  console.log('✅ تم التقاط لقطة الشاشة: بعد اختيار الخيارات');

  // النقر على زر التوليد
  await page.click('text=إنشاء مستند الموجّه النهائي');
  await wait(3000);

  // لقطة شاشة: النتيجة النهائية
  await page.screenshot({
    path: path.join(CONFIG.outputDir, 'demo-06-final-result.png'),
    fullPage: true
  });

  console.log('✅ تم التقاط لقطة الشاشة: النتيجة النهائية');
  console.log('✅ اكتمل تسجيل المسار التفاعلي\n');
}

/**
 * تسجيل عرض توضيحي لرفع الملفات
 */
async function recordFileUpload(page) {
  console.log('📹 بدء التسجيل: عرض توضيحي لرفع الملفات');

  // النقر على إنشاء محادثة جديدة
  await page.click('button:has-text("مسح المحادثة")');
  await wait(1000);

  console.log('✅ اكتمل تسجيل العرض التوضيحي لرفع الملفات\n');
}

/**
 * الدالة الرئيسية
 */
async function main() {
  console.log('🎬 بدء تسجيل العرض التوضيحي...\n');

  const browser = await chromium.launch({
    headless: false, // إظهار نافذة المتصفح
    slowMo: CONFIG.slowMo,
  });

  const context = await browser.newContext({
    viewport: CONFIG.viewport,
    recordVideo: {
      dir: CONFIG.outputDir,
      size: CONFIG.viewport,
    },
  });

  const page = await context.newPage();

  // زيادة المهلة الافتراضية
  page.setDefaultTimeout(60000);

  try {
    // الوصول إلى التطبيق
    console.log(`🌐 الوصول إلى: ${CONFIG.baseUrl}`);
    await page.goto(CONFIG.baseUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // تسجيل المشاهد المختلفة
    await recordInteractiveFlow(page);
    await recordFileUpload(page);

    console.log('✅ اكتمل تسجيل جميع العروض التوضيحية!');
    console.log(`📁 مجلد المخرجات: ${CONFIG.outputDir}`);

  } catch (error) {
    console.error('❌ خطأ أثناء التسجيل:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

// التشغيل
main().catch(console.error);
