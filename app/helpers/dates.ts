/** Converts "14:00:00" or "2:00 PM" → "2:00 PM" */
export function formatBusinessTime(timeStr: string | null | undefined, fallback: string): string {
  if (!timeStr) return fallback;
  try {
    if (/am|pm/i.test(timeStr)) return timeStr;
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${ampm}`;
  } catch {
    return fallback;
  }
}
