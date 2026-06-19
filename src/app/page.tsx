'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { defaultLocale, locales, type Locale } from '@/i18n/config';

const STORAGE_KEY = 'preferred-locale';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // الأولوية: اللغة المحفوظة سابقًا ← لغة المتصفح ← اللغة الافتراضية
    let target: string = defaultLocale;

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && locales.includes(stored as Locale)) {
      target = stored;
    } else {
      const browser = navigator.language.toLowerCase();
      const match = locales.find((loc) => browser.startsWith(loc));
      if (match) target = match;
    }

    router.replace(`/${target}`);
  }, [router]);

  return null;
}
