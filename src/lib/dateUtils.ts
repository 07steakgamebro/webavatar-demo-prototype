export type SupportedLanguage = 'en' | 'th' | 'zh' | 'ja' | 'ko' | 'es' | 'fr';

export const LOCALE_MAP: Record<string, string> = {
  th: 'th-TH',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
  es: 'es-ES',
  fr: 'fr-FR',
  en: 'en-US',
};

export function getLocaleTag(lang?: string): string {
  if (!lang) return 'en-US';
  return LOCALE_MAP[lang] || 'en-US';
}

export function parseDate(val: string | number | Date | undefined | null): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof val === 'string') {
    // If it's a YYYY-MM-DD string without time, parse with local midnight to avoid timezone day shift
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const d = new Date(val + 'T00:00:00');
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

export function formatDateTime(
  val: string | number | Date | undefined | null,
  lang: string = 'en',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  const d = parseDate(val);
  if (!d) return val ? String(val) : '';
  const locale = getLocaleTag(lang);
  try {
    return d.toLocaleString(locale, options);
  } catch {
    return d.toLocaleString('en-US', options);
  }
}

export function formatDate(
  val: string | number | Date | undefined | null,
  lang: string = 'en',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
): string {
  const d = parseDate(val);
  if (!d) return val ? String(val) : '';
  const locale = getLocaleTag(lang);
  try {
    return d.toLocaleDateString(locale, options);
  } catch {
    return d.toLocaleDateString('en-US', options);
  }
}

export function formatTime(
  val: string | number | Date | undefined | null,
  lang: string = 'en',
  options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }
): string {
  const d = parseDate(val);
  if (!d) return val ? String(val) : '';
  const locale = getLocaleTag(lang);
  try {
    return d.toLocaleTimeString(locale, options);
  } catch {
    return d.toLocaleTimeString('en-US', options);
  }
}

export function formatFlightDuration(dur: string = '', lang: string = 'en'): string {
  if (!dur) return '';
  let hours = 0;
  let mins = 0;

  const thaiMatch = dur.match(/(\d+)\s*ชม\.?\s*(?:(\d+)\s*นาที)?/);
  const engMatch = dur.match(/(\d+)\s*h(?:ours?)?\s*(?:(\d+)\s*m(?:ins?)?)?/i);

  if (thaiMatch) {
    hours = parseInt(thaiMatch[1], 10);
    mins = thaiMatch[2] ? parseInt(thaiMatch[2], 10) : 0;
  } else if (engMatch) {
    hours = parseInt(engMatch[1], 10);
    mins = engMatch[2] ? parseInt(engMatch[2], 10) : 0;
  } else {
    const nums = dur.match(/\d+/g);
    if (nums) {
      hours = parseInt(nums[0], 10);
      mins = nums[1] ? parseInt(nums[1], 10) : 0;
    } else {
      return dur;
    }
  }

  if (lang === 'th') {
    return mins > 0 ? `${hours} ชม. ${mins} นาที` : `${hours} ชม.`;
  }
  if (lang === 'zh') {
    return mins > 0 ? `${hours}小时 ${mins}分` : `${hours}小时`;
  }
  if (lang === 'ja') {
    return mins > 0 ? `${hours}時間 ${mins}分` : `${hours}時間`;
  }
  if (lang === 'ko') {
    return mins > 0 ? `${hours}시간 ${mins}분` : `${hours}시간`;
  }
  if (lang === 'es' || lang === 'fr') {
    return mins > 0 ? `${hours} h ${mins} min` : `${hours} h`;
  }
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
