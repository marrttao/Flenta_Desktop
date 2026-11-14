import { useCallback } from 'react'
import { useTranslation } from '../../localization'

const moneyNumber = new Intl.NumberFormat('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const locales = { en: 'en-US', uk: 'uk-UA', pl: 'pl-PL', de: 'de-DE' } as const

/** Bilingual copy (English / Ukrainian) and money formatting shared by the desktop workspace pages. */
export function useWorkspaceText() {
  const { language, setLanguage } = useTranslation()
  const text = useCallback((en: string, uk: string) => language === 'uk' ? uk : en, [language])
  const locale = locales[language]
  // Figma money format: "40 543,20 UAH" (space-grouped, decimal comma, ISO code after the amount).
  const format = useCallback((value: number, currency: string) => `${moneyNumber.format(value)} ${currency}`, [])
  const date = useCallback((value: string | number | Date, options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }) =>
    new Date(value).toLocaleDateString(locale, options), [locale])
  return { text, locale, format, date, language, setLanguage }
}

export type WorkspaceText = ReturnType<typeof useWorkspaceText>
