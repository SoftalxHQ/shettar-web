const TIDIO_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_TIDIO_KEY || 'h4kqanzcrjj4xybpmovq7wp5pprgyyqn';

let loadPromise: Promise<void> | null = null;

export function loadTidioChat(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  if (window.tidioChatApi) return Promise.resolve();

  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve) => {
    const onReady = () => {
      document.removeEventListener('tidioChat-ready', onReady);
      resolve();
    };

    document.addEventListener('tidioChat-ready', onReady);

    if (!document.getElementById('tidio-chat-script')) {
      const script = document.createElement('script');
      script.id = 'tidio-chat-script';
      script.src = `https://code.tidio.co/${TIDIO_PUBLIC_KEY}.js`;
      script.async = true;
      document.body.appendChild(script);
    }
  });

  return loadPromise;
}

export function setTidioVisible(visible: boolean) {
  window.tidioChatApi?.display(visible);
}

export function openTidioChat() {
  window.tidioChatApi?.open();
}

export function closeTidioChat() {
  window.tidioChatApi?.close();
}

export function onTidioEvent(event: 'chat:open' | 'chat:close', handler: () => void) {
  window.tidioChatApi?.on(event, handler);
}
