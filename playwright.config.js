const { defineConfig, devices } = require('@playwright/test');

// منفذ مخصص لاختبارات E2E (9173) — منفذ غير شائع لتجنّب التعارض مع تطبيبات محلية أخرى
// قد تحتجز المنافذ الشائعة مثل 3000/3001. يمكن تغييره عبر PLAYWRIGHT_PORT،
// أو توجيه الاختبارات إلى خادم قائم عبر PLAYWRIGHT_BASE_URL (عندئذٍ لا يبدأ Playwright خادمًا تلقائيًّا).
const PORT = process.env.PLAYWRIGHT_PORT || 9173;
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${PORT}`;

const config = {
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
};

// يبدأ Playwright خادم التطوير تلقائيًّا على المنفذ المخصص ما لم يوجّه المستخدم BASE_URL
// إلى خادم قائم (مثل PLAYWRIGHT_BASE_URL=http://localhost:3002).
if (!process.env.PLAYWRIGHT_BASE_URL) {
  config.webServer = {
    command: `npm run dev -- -p ${PORT}`,
    // نستهدف /ar/ بدل الجذر لتسخين ترجمة هذا المسار أثناء الفحص،
    // فلا تتسابق العمال الستة على ترجمة باردة في أول اختبار.
    url: `${BASE_URL}/ar/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  };
}

module.exports = defineConfig(config);
