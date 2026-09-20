const TAWK_PROPERTY_ID =
  process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || '6aafe4025dcd6f34456fc926';
const TAWK_WIDGET_ID =
  process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || '1k2vh5aql';

let loadPromise: Promise<void> | null = null;
let hideTimer: number | null = null;

function isTawkReady(): boolean {
  return typeof window !== 'undefined' && typeof window.Tawk_API?.maximize === 'function';
}

export function loadTawkChat(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (hideTimer !== null) {
    window.clearTimeout(hideTimer);
    hideTimer = null;
  }
  if (isTawkReady()) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const previousOnLoad = window.Tawk_API.onLoad;
    window.Tawk_API.onLoad = () => {
      previousOnLoad?.();
      resolve();
    };

    if (!document.getElementById('tawk-chat-script')) {
      const script = document.createElement('script');
      script.id = 'tawk-chat-script';
      script.async = true;
      script.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
      // Do not set crossorigin: "*" — browsers treat that as CORS mode and
      // Tawk's later ES-module + audio XHRs then fail.
      document.body.appendChild(script);
    }

    window.setTimeout(() => {
      if (isTawkReady()) resolve();
    }, 8000);
  });

  return loadPromise;
}

export function setTawkVisible(visible: boolean) {
  if (visible) {
    window.Tawk_API?.showWidget?.();
    return;
  }

  if (hideTimer !== null) window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => {
    window.Tawk_API?.hideWidget?.();
    hideTimer = null;
  }, 150);
}

export function openTawkChat() {
  window.Tawk_API?.showWidget?.();
  window.Tawk_API?.maximize?.();
}

export function closeTawkChat() {
  window.Tawk_API?.minimize?.();
}

export function onTawkEvent(event: 'chat:open' | 'chat:close', handler: () => void) {
  const api = window.Tawk_API;
  if (!api) return;

  if (event === 'chat:open') {
    api.onChatMaximized = handler;
    return;
  }

  api.onChatMinimized = handler;
}
