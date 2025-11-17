/**
 * Date and Time Formatting Utilities
 * Reusable date/time formatting functions
 */

export type TimeFormat = '12h' | '24h';
export type DateFormat = 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';

/**
 * Interface for date/time parts
 */
export interface DateTimeParts {
  yyyy: string;
  MM: string;
  DD: string;
  hh: string;
  mm: string;
  ss: string;
  ampm: string;
}

/**
 * Parse a date into its component parts
 * @param date - The date to parse
 * @param timeFormat - Time format ('12h' or '24h')
 * @param timezone - Timezone string (e.g., 'UTC', 'America/New_York')
 * @returns Object containing date/time parts
 */
export function getDateTimeParts(
  date: Date,
  timeFormat: TimeFormat = '12h',
  timezone: string = 'UTC'
): DateTimeParts {
  const parts = new Intl.DateTimeFormat(undefined, {
    hour12: timeFormat === '12h',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: timezone,
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value || '';

  return {
    yyyy: get('year'),
    MM: get('month'),
    DD: get('day'),
    hh: get('hour'),
    mm: get('minute'),
    ss: get('second'),
    ampm: get('dayPeriod'),
  };
}

/**
 * Format a date according to the specified format pattern
 * @param date - The date to format
 * @param dateFormat - Format pattern (e.g., 'MM/DD/YYYY', 'DD/MM/YYYY')
 * @param timezone - Timezone string
 * @returns Formatted date string
 */
export function formatDate(
  date: Date,
  dateFormat: string = 'MM/DD/YYYY',
  timezone: string = 'UTC'
): string {
  const { yyyy, MM, DD } = getDateTimeParts(date, '12h', timezone);
  return dateFormat
    .replace('YYYY', yyyy)
    .replace('MM', MM)
    .replace('DD', DD);
}

/**
 * Format a date and time according to the specified formats
 * @param date - The date to format
 * @param dateFormat - Date format pattern
 * @param timeFormat - Time format ('12h' or '24h')
 * @param timezone - Timezone string
 * @returns Formatted date and time string
 */
export function formatDateTime(
  date: Date,
  dateFormat: string = 'MM/DD/YYYY',
  timeFormat: TimeFormat = '12h',
  timezone: string = 'UTC'
): string {
  const { yyyy, MM, DD, hh, mm, ss, ampm } = getDateTimeParts(
    date,
    timeFormat,
    timezone
  );

  const dateStr = dateFormat
    .replace('YYYY', yyyy)
    .replace('MM', MM)
    .replace('DD', DD);

  const timeStr =
    timeFormat === '12h'
      ? `${hh}:${mm}:${ss} ${ampm || ''}`.trim()
      : `${hh}:${mm}:${ss}`;

  return `${timeStr}, ${dateStr}`;
}

/**
 * Format a time according to the specified format
 * @param date - The date/time to format
 * @param timeFormat - Time format ('12h' or '24h')
 * @param timezone - Timezone string
 * @param includeSeconds - Whether to include seconds (default: true)
 * @returns Formatted time string
 */
export function formatTime(
  date: Date,
  timeFormat: TimeFormat = '12h',
  timezone: string = 'UTC',
  includeSeconds: boolean = true
): string {
  const { hh, mm, ss, ampm } = getDateTimeParts(date, timeFormat, timezone);

  if (timeFormat === '12h') {
    const time = includeSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
    return `${time} ${ampm || ''}`.trim();
  }

  return includeSeconds ? `${hh}:${mm}:${ss}` : `${hh}:${mm}`;
}

/**
 * Get relative time string (e.g., '2 hours ago', 'in 3 days')
 * @param date - The date to compare
 * @param baseDate - The base date to compare against (default: now)
 * @param locale - Locale for formatting
 * @returns Relative time string
 */
export function getRelativeTime(
  date: Date,
  baseDate: Date = new Date(),
  locale?: string
): string {
  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const diffInSeconds = (date.getTime() - baseDate.getTime()) / 1000;

    // Less than a minute
    if (Math.abs(diffInSeconds) < 60) {
      return rtf.format(Math.round(diffInSeconds), 'seconds');
    }

    // Less than an hour
    const diffInMinutes = diffInSeconds / 60;
    if (Math.abs(diffInMinutes) < 60) {
      return rtf.format(Math.round(diffInMinutes), 'minutes');
    }

    // Less than a day
    const diffInHours = diffInMinutes / 60;
    if (Math.abs(diffInHours) < 24) {
      return rtf.format(Math.round(diffInHours), 'hours');
    }

    // Less than a month
    const diffInDays = diffInHours / 24;
    if (Math.abs(diffInDays) < 30) {
      return rtf.format(Math.round(diffInDays), 'days');
    }

    // Less than a year
    const diffInMonths = diffInDays / 30;
    if (Math.abs(diffInMonths) < 12) {
      return rtf.format(Math.round(diffInMonths), 'months');
    }

    // Years
    const diffInYears = diffInMonths / 12;
    return rtf.format(Math.round(diffInYears), 'years');
  } catch {
    // Fallback
    return date.toLocaleDateString(locale);
  }
}

/**
 * Check if a date is today
 * @param date - The date to check
 * @param timezone - Timezone string
 * @returns true if the date is today
 */
export function isToday(date: Date, timezone: string = 'UTC'): boolean {
  const today = new Date();
  const { yyyy: todayYear, MM: todayMonth, DD: todayDay } = getDateTimeParts(
    today,
    '12h',
    timezone
  );
  const { yyyy: dateYear, MM: dateMonth, DD: dateDay } = getDateTimeParts(
    date,
    '12h',
    timezone
  );

  return todayYear === dateYear && todayMonth === dateMonth && todayDay === dateDay;
}

/**
 * Check if a date is in the past
 * @param date - The date to check
 * @returns true if the date is in the past
 */
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Check if a date is in the future
 * @param date - The date to check
 * @returns true if the date is in the future
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}
