/** Parse YYYY-MM-DD as local calendar date (no time-of-day). */
export function parseDateFromLocalISO(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDaysToDate(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** Pure stay range from URL params; returns [] when dates are missing or invalid. */
export function stayForFromSearchParams(
  startDate: string | null,
  endDate: string | null,
): Date[] {
  if (!startDate || !endDate) return [];

  const start = parseDateFromLocalISO(startDate);
  const end = parseDateFromLocalISO(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return [];

  return [start, end];
}

const EMPTY_STAY: Date[] = [];
let cachedDefaultStay: Date[] | null = null;
let cachedDefaultStayDay = '';

function localDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/** Cached today/tomorrow pair for client defaults — stable reference per calendar day. */
export function getClientDefaultStayForSnapshot(): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayKey = localDayKey(today);

  if (cachedDefaultStay && cachedDefaultStayDay === dayKey) {
    return cachedDefaultStay;
  }

  cachedDefaultStayDay = dayKey;
  cachedDefaultStay = [today, addDaysToDate(today, 1)];
  return cachedDefaultStay;
}

export function getServerDefaultStayForSnapshot(): Date[] {
  return EMPTY_STAY;
}
