export const locales = ['en', 'zh'] as const;
export type Locale = (typeof locales)[number];

export const languages = {
  en: { label: 'English', flag: '🇺🇸' },
  zh: { label: '中文', flag: '🇨🇳' },
} as const;

