import { useCallback } from 'react'
import { useTranslation } from '../../localization'

const locales = { en: 'en-GB', uk: 'uk-UA', pl: 'pl-PL', de: 'de-DE' } as const

/** Bilingual copy (English / Ukrainian) and money formatting shared by the desktop workspace pages. */
export function useWorkspaceText() {
  const { language, setLanguage } = useTranslation()
  const text = useCallback((en: string, uk: string) => language === 'uk' ? uk : en, [language])
  const locale = locales[language]
  const format = useCallback((value: number, currency: string) => new Intl.NumberFormat(locale, {
    style: 'currency', currency, maximumFractionDigits: 2,
  }).format(value), [locale])
  const date = useCallback((value: string | number | Date, options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }) =>
    new Date(value).toLocaleDateString(locale, options), [locale])
  return { text, locale, format, date, language, setLanguage }
}

export type WorkspaceText = ReturnType<typeof useWorkspaceText>
