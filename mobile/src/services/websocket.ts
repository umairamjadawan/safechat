import { createConsumer, Consumer, Subscription } from '@rails/actioncable';
import { getToken } from './keyManager';
import { getApiUrl } from './api';

let consumer: Consumer | null = null;
const subscriptions: Map<string, Subscription> = new Map();

export async function connectWebSocket(): Promise<Consumer> {
  if (consumer) return consumer;

  const token = await getToken();
  if (!token) throw new Error('No auth token available');

  const wsUrl = getApiUrl().replace('http', 'ws') + `/cable?token=${token}`;
  consumer = createConsumer(wsUrl);
  return consumer;
}

export function disconnectWebSocket(): void {
  if (consumer) {
    consumer.disconnect();
    consumer = null;
    subscriptions.clear();
  }
}

export async function subscribeToChatChannel(
  conversationId: string,
  onMessage: (data: any) => void
): Promise<Subscription> {
  const ws = await connectWebSocket();

  const existing = subscriptions.get(`chat_${conversationId}`);
  if (existing) return existing;

  const subscription = ws.subscriptions.create(
    { channel: 'ChatChannel', conversation_id: conversationId },
    {
      received(data: any) {
        onMessage(data);
      },
      connected() {
        console.log(`Connected to ChatChannel for conversation ${conversationId}`);
      },
      disconnected() {
        console.log(`Disconnected from ChatChannel for conversation ${conversationId}`);
      },
    }
  );

  subscriptions.set(`chat_${conversationId}`, subscription);
  return subscription;
}

export async function subscribeToNotifications(
  onNotification: (data: any) => void
): Promise<Subscription> {
  const ws = await connectWebSocket();

  const existing = subscriptions.get('notifications');
  if (existing) return existing;

  const subscription = ws.subscriptions.create(
    { channel: 'NotificationChannel' },
    {
      received(data: any) {
        onNotification(data);
      },
      connected() {
        console.log('Connected to NotificationChannel');
      },
      disconnected() {
        console.log('Disconnected from NotificationChannel');
      },
    }
  );

  subscriptions.set('notifications', subscription);
  return subscription;
}

export function unsubscribeFromChat(conversationId: string): void {
  const key = `chat_${conversationId}`;
  const sub = subscriptions.get(key);
  if (sub) {
    sub.unsubscribe();
    subscriptions.delete(key);
  }
}
