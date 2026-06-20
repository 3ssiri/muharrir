import { NextIntlClientProvider } from 'next-intl';
import { getMessages, unstable_setRequestLocale } from 'next-intl/server';
import { Rubik } from "next/font/google";
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { IconProvider } from '@/components/icon-provider';
import { getLocaleDir } from '@/i18n/config';
import { routing } from '@/i18n/routing';
import "../globals.css";

// Rubik covers both Arabic and Latin, giving a single cohesive, modern typeface
// across the whole bilingual UI. Used for body text and (heavier) headings alike.
const rubik = Rubik({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

// PWA: make the app installable (manifest + theme color).
export const metadata = {
  manifest: '/manifest.webmanifest',
  applicationName: 'Prompt Iterator',
  appleWebApp: { capable: true, title: 'Muharrir', statusBarStyle: 'default' as const },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5efdd' },
    { media: '(prefers-color-scheme: dark)', color: '#2b2420' },
  ],
};

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

  // Determine the page direction based on the language (RTL for Arabic)
  const dir = getLocaleDir(locale);

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${rubik.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NextIntlClientProvider messages={messages}>
            <IconProvider>
              {children}
              <Toaster richColors closeButton position="top-center" />
            </IconProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
