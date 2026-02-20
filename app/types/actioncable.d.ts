declare module '@rails/actioncable' {
  export function createConsumer(url?: string): Consumer;

  export interface Consumer {
    subscriptions: Subscriptions;
    connect(): void;
    disconnect(): void;
    ensureActiveConnection(): void;
  }

  export interface Subscriptions {
    create(channel: string | ChannelSpec, handlers: SubscriptionHandlers): Subscription;
  }

  export interface ChannelSpec {
    channel: string;
    [key: string]: any;
  }

  export interface SubscriptionHandlers {
    connected?(): void;
    disconnected?(): void;
    received?(data: any): void;
    rejected?(): void;
  }

  export interface Subscription {
    unsubscribe(): void;
    send(data: any): boolean;
    perform(action: string, data?: object): boolean;
  }
}
