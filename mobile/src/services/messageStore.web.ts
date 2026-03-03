// Web-only: in-memory message store (no SQLite on web)
const webStore: Map<string, any[]> = new Map();

export async function initDatabase(): Promise<void> {}

export async function saveMessage(message: {
  id: string;
  conversation_id: string;
  sender_id: string;
  decrypted_body?: string;
  encrypted_body: string;
  nonce: string;
  message_type: string;
  created_at: string;
}): Promise<void> {
  const msgs = webStore.get(message.conversation_id) || [];
  const idx = msgs.findIndex((m) => m.id === message.id);
  if (idx >= 0) msgs[idx] = message;
  else msgs.push(message);
  webStore.set(message.conversation_id, msgs);
}

export async function getLocalMessages(conversationId: string, limit: number = 50): Promise<any[]> {
  const msgs = webStore.get(conversationId) || [];
  return msgs.slice(-limit).reverse();
}

export async function clearLocalMessages(): Promise<void> {
  webStore.clear();
}
