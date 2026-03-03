// Native-only: SQLite message store
import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  db = await SQLite.openDatabaseAsync('safechat.db');
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      decrypted_body TEXT,
      encrypted_body TEXT NOT NULL,
      nonce TEXT NOT NULL,
      message_type TEXT NOT NULL DEFAULT 'text',
      created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at);
  `);
}

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
  if (!db) await initDatabase();
  await db!.runAsync(
    `INSERT OR REPLACE INTO messages (id, conversation_id, sender_id, decrypted_body, encrypted_body, nonce, message_type, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [message.id, message.conversation_id, message.sender_id, message.decrypted_body || null, message.encrypted_body, message.nonce, message.message_type, message.created_at]
  );
}

export async function getLocalMessages(conversationId: string, limit: number = 50): Promise<any[]> {
  if (!db) await initDatabase();
  return await db!.getAllAsync(
    'SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?',
    [conversationId, limit]
  );
}

export async function clearLocalMessages(): Promise<void> {
  if (!db) await initDatabase();
  await db!.execAsync('DELETE FROM messages');
}
