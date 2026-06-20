import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { Inter, Cairo, Sora } from "next/font/google";
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { getLocaleDir } from '@/i18n/config';
import { routing } from '@/i18n/routing';
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
// Arabic font for rendering a high-quality RTL interface
const cairo = Cairo({ subsets: ["arabic"], variable: "--font-sans" });
// Expressive display font for the brand wordmark and headings
const sora = Sora({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700", "800"] });

// Generate static pages for each language (required with output: 'export')
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Enable static rendering for next-intl for this language
  unstable_setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  // Determine the page direction and the appropriate font based on the language (RTL for Arabic)
  const dir = getLocaleDir(locale);
  const bodyFont = locale === 'ar' ? cairo.variable : inter.variable;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${bodyFont} ${sora.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Decorative aurora mesh that sits behind the entire app */}
          <div className="aurora-bg" aria-hidden="true" />
          <NextIntlClientProvider messages={messages}>
            {children}
            <Toaster richColors closeButton position="top-center" />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
