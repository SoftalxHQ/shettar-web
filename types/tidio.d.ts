export {};

declare global {
  interface Window {
    tidioChatApi?: {
      display: (show: boolean) => void;
      open: () => void;
      close: () => void;
      on: (event: string, callback: () => void) => void;
    };
  }
}
