const GUEST_ID_KEY = 'shettar_guest_id';

function generateGuestId(): string {
  const suffix = Math.random().toString(36).slice(2, 12);
  return `guest_${Date.now()}_${suffix}`;
}

export function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') return '';

  let id = localStorage.getItem(GUEST_ID_KEY);
  if (!id) {
    id = generateGuestId();
    localStorage.setItem(GUEST_ID_KEY, id);
  }
  return id;
}
