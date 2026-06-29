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
