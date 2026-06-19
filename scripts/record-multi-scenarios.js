/**
 * سكربت تسجيل أمثلة تطبيقية متعددة المشاهد باستخدام Playwright
 * يوضح توليد المطالبات في مشاهد مختلفة
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// الإعدادات
const CONFIG = {
  baseUrl: 'https://interactive-prompt-iterator.vercel.app',
  outputDir: path.join(__dirname, '../docs/screenshots'),
  viewport: { width: 1280, height: 800 },
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
 * تسجيل أمثلة تطبيقية متعددة المشاهد
 */
async function recordMultiScenarios(page) {
  console.log('📹 بدء التسجيل: أمثلة تطبيقية متعددة المشاهد');

  // الوصول إلى الصفحة الرئيسية
  await page.goto(CONFIG.baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await wait(2000);

  // المشهد 1: إنشاء المحتوى - مقالة مدونة
  console.log('  📝 المشهد 1: إنشاء المحتوى - مقالة مدونة');
  await page.fill('input[placeholder="صِف مهمتك..."]', 'اكتب لي مقالة مدونة حول اتجاهات تطور الذكاء الاصطناعي');
  await wait(1000);
  await page.click('button[type="submit"]');
  await wait(5000);

  console.log('✅ اكتمل تسجيل الأمثلة التطبيقية متعددة المشاهد');
}

/**
 * الدالة الرئيسية
 */
async function main() {
  console.log('🎬 بدء تسجيل ملف GIF للأمثلة التطبيقية متعددة المشاهد...\n');

  const browser = await chromium.launch({
    headless: true,
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
    await recordMultiScenarios(page);
    console.log('✅ اكتمل التسجيل!');
  } catch (error) {
    console.error('❌ خطأ أثناء التسجيل:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

main().catch(console.error);
