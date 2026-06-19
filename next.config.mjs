import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // توليد ملفات HTML ثابتة (Static Export) ليقرأها Tauri
  output: 'export',
  // مطلوب مع next-intl static export
  trailingSlash: true,
  // Next Image لا يعمل مع static export، لذا نعطّل التحسين
  images: { unoptimized: true },
  // تحسين أداء الترجمة في وضع التطوير
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // تقليل عمليات إعادة الترجمة غير الضرورية
      config.watchOptions = {
        ...config.watchOptions,
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
