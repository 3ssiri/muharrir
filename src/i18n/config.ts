export const locales = ['ar', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ar';

export const localeNames: Record<Locale, string> = {
  'ar': 'العربية',
  'en': 'English'
};

export const localeFlags: Record<Locale, string> = {
  'ar': '🇸🇦',
  'en': '🇺🇸'
};

// Locales that are displayed right-to-left (RTL)
export const rtlLocales: Locale[] = ['ar'];

export function getLocaleDir(locale: string): 'rtl' | 'ltr' {
  return rtlLocales.includes(locale as Locale) ? 'rtl' : 'ltr';
}
