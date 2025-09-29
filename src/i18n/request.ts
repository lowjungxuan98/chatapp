import { getRequestConfig } from 'next-intl/server';
import type { Locale } from '@/lib/i18n';

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) ?? 'en' as Locale;
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});

