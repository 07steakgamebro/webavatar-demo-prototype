import { getLocaleTag } from "@/lib/dateUtils";
import { getCityDetails } from "@/lib/cities";

export function parseDateForCard(dateStr: string, fallbackDays = 0, language: string = 'en') {
  let target = dateStr;
  if (!target) {
    const d = new Date();
    d.setDate(d.getDate() + fallbackDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    target = `${y}-${m}-${day}`;
  }
  const d = new Date(target + "T00:00:00");
  const locale = getLocaleTag(language);
  if (isNaN(d.getTime())) {
    const now = new Date();
    return {
      day: "02",
      month: now.toLocaleString(locale, { month: "long" }),
      weekday: now.toLocaleString(locale, { weekday: "long" }),
      year: "2026"
    };
  }
  const day = String(d.getDate()).padStart(2, "0");
  const month = d.toLocaleString(locale, { month: "long" });
  const weekday = d.toLocaleString(locale, { weekday: "long" });
  const year = String(d.getFullYear());
  return { day, month, weekday, year };
}

export function getCityLabelForLang(city: string, language: string) {
  if (!city) return "";
  const details = getCityDetails(city, language);
  return `${details.cityName} (${details.code})`;
}

export function getTodayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getNextDayString(dateStr: string) {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T00:00:00');
  date.setDate(date.getDate() + 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
