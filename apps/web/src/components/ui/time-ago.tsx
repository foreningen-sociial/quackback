import { useEffect, useState } from 'react'
import { formatDistanceToNow, type Locale } from 'date-fns'
import { ar, da, de, es, fr, ptBR, ru, zhCN, zhTW } from 'date-fns/locale'
import { useIntl } from 'react-intl'
import type { SupportedLocale } from '@/lib/shared/i18n'

interface TimeAgoProps {
  date: Date | string
  className?: string
}

/** Maps our locale ids to date-fns locale objects. 'en' is omitted —
 *  formatDistanceToNow already defaults to enUS with no `locale` option. */
const DATE_FNS_LOCALES: Partial<Record<SupportedLocale, Locale>> = {
  de,
  fr,
  es,
  ar,
  ru,
  'pt-br': ptBR,
  'zh-cn': zhCN,
  'zh-tw': zhTW,
  da,
}

/** The relative-time label `<TimeAgo>` renders, for static (no-interval)
 *  consumers like CitationFreshness; '' for a missing or invalid date. */
export function getTimeAgo(
  date: Date | string | null | undefined,
  locale?: SupportedLocale
): string {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  // Check for invalid date
  if (isNaN(d.getTime())) return ''
  const dateFnsLocale = locale ? DATE_FNS_LOCALES[locale] : undefined
  return formatDistanceToNow(d, { addSuffix: true, locale: dateFnsLocale })
}

export function TimeAgo({ date, className }: TimeAgoProps) {
  const { locale } = useIntl()
  const supportedLocale = locale as SupportedLocale

  // Initialize with computed value for SSR
  const [timeAgo, setTimeAgo] = useState<string>(() => getTimeAgo(date, supportedLocale))

  useEffect(() => {
    // Update immediately in case server/client time differs slightly
    setTimeAgo(getTimeAgo(date, supportedLocale))

    // Update every minute
    const interval = setInterval(() => {
      setTimeAgo(getTimeAgo(date, supportedLocale))
    }, 60000)

    return () => clearInterval(interval)
  }, [date, supportedLocale])

  return <span className={className}>{timeAgo}</span>
}
