/**
 * سكربت تسجيل عرض توضيحي بصيغة GIF باستخدام Playwright
 * يُستخدم لتسجيل عرض توضيحي في بيئة Vercel وتوليد ملف GIF
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// الإعدادات
const CONFIG = {
  baseUrl: 'http://localhost:3000',
  outputDir: path.join(__dirname, '../docs/screenshots'),
  viewport: { width: 1280, height: 800 },
  slowMo: 300, // إبطاء سرعة العمليات
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
 * تسجيل المشهد 1: مسار توليد المطالبات التفاعلي
 */
async function recordInteractiveFlow(page, context) {
  console.log('📹 المشهد 1: مسار توليد المطالبات التفاعلي');

  // الوصول إلى الصفحة الرئيسية
  await page.goto(CONFIG.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await wait(2000);

  // النقر على المثال السريع
  await page.click('text=مقال تحليل اتجاهات الذكاء الاصطناعي');
  await wait(1000);

  // النقر على الإرسال
  await page.click('button[type="submit"]');
  await wait(3000);

  console.log('✅ اكتمل تسجيل المشهد 1');
}

/**
 * الدالة الرئيسية
 */
async function main() {
  console.log('🎬 بدء تسجيل العرض التوضيحي بصيغة GIF...\n');

  const browser = await chromium.launch({
    headless: true, // التسجيل في وضع بدون واجهة
  });

  const context = await browser.newContext({
    viewport: CONFIG.viewport,
    recordVideo: {
      dir: CONFIG.outputDir,
      size: CONFIG.viewport,
    },
  });

  const page = await context.newPage();
  page.setDefaultTimeout(60000);

  try {
    await recordInteractiveFlow(page, context);

    console.log('✅ اكتمل التسجيل!');
    console.log('📁 تم حفظ الفيديو في:', CONFIG.outputDir);
    console.log('\n💡 تلميح: استخدم ffmpeg لتحويل الفيديو إلى GIF:');
    console.log('   ffmpeg -i video.webm -vf "fps=10,scale=800:-1:flags=lanczos" output.gif');

  } catch (error) {
    console.error('❌ خطأ أثناء التسجيل:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch(console.error);
