import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Inter, Cairo } from "next/font/google";
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { getLocaleDir } from '@/i18n/config';
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });
// خط عربي لعرض واجهة RTL بجودة عالية
const cairo = Cairo({ subsets: ["arabic"] });

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  // تحديد اتجاه الصفحة والخط المناسب حسب اللغة (RTL للعربية)
  const dir = getLocaleDir(locale);
  const fontClass = locale === 'ar' ? cairo.className : inter.className;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${fontClass} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            {children}
            <Toaster />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
