# SafeChat — E2E Encrypted Messaging App

End-to-end encrypted messaging app. The server never sees plaintext — all encryption/decryption happens on the client using **X25519 + XSalsa20-Poly1305** (via tweetnacl).

## Architecture

| Layer | Technology |
|-------|-----------|
| Mobile Client | React Native (Expo) |
| Backend | Ruby on Rails 8 (API-only) |
| Database | PostgreSQL 16 |
| Real-time | ActionCable (WebSockets via Redis) |
| Encryption | tweetnacl-js (X25519 + XSalsa20-Poly1305) |
| Auth | Devise + JWT |
| Key Storage | expo-secure-store (Keychain/Keystore) |

## Quick Start

### 1. Start the Backend (Docker)

```bash
docker compose up -d
```

This starts:
- **PostgreSQL** on port 5432
- **Redis** on port 6379
- **Rails API** on port 3000

The database is automatically created and migrated on first start.

### 2. Start the Mobile App

```bash
cd mobile
npm install
npx expo start
```

Then press `i` for iOS simulator or `a` for Android emulator.

### 3. Test It

1. Register two accounts in the app
2. Search for the other user by email
3. Start a chat — messages are encrypted on-device before sending
4. Check the database: `docker compose exec db psql -U safechat safechat_development -c "SELECT encrypted_body FROM messages;"` — only ciphertext!

## How Encryption Works

### Registration
1. Client generates **X25519 key pair** (`nacl.box.keyPair()`)
2. Private key → stored in device Keychain (never leaves device)
3. Public key → uploaded to server

### Direct Messages
1. Sender fetches recipient's public key
2. Encrypts with `nacl.box(message, nonce, recipientPubKey, senderSecretKey)`
3. Server stores only the ciphertext + nonce
4. Recipient decrypts with `nacl.box.open(ciphertext, nonce, senderPubKey, recipientSecretKey)`

### Group Messages
1. Group creator generates random 32-byte symmetric key
2. Key is encrypted per-member using `nacl.box` and stored on server
3. Messages encrypted with `nacl.secretbox(message, nonce, groupKey)`

## API Endpoints

```
POST   /api/v1/auth/register          — Create account + upload public key
POST   /api/v1/auth/login             — Get JWT token
DELETE /api/v1/auth/logout             — Revoke token

GET    /api/v1/users/search?q=        — Find users by email/name
GET    /api/v1/users/:id/keys         — Get user's public key

GET    /api/v1/conversations           — List my conversations
POST   /api/v1/conversations           — Create 1-on-1 or group chat
GET    /api/v1/conversations/:id       — Conversation details

GET    /api/v1/conversations/:id/messages    — Paginated encrypted messages
POST   /api/v1/conversations/:id/messages    — Send encrypted message

POST   /api/v1/conversations/:id/group_keys  — Distribute group key
GET    /api/v1/conversations/:id/group_keys  — Get my encrypted group key
```

## Project Structure

```
safechat/
├── docker-compose.yml          # Orchestrates all services
├── backend/                    # Rails API
│   ├── Dockerfile
│   ├── app/
│   │   ├── models/             # User, Conversation, Message, etc.
│   │   ├── controllers/api/v1/ # REST endpoints
│   │   ├── channels/           # ActionCable (ChatChannel, NotificationChannel)
│   │   └── serializers/        # JSON serialization
│   └── db/migrate/             # Database schema
└── mobile/                     # React Native (Expo)
    ├── App.tsx                 # Root with providers
    └── src/
        ├── services/
        │   ├── crypto.ts       # tweetnacl encryption/decryption
        │   ├── keyManager.ts   # SecureStore key management
        │   ├── api.ts          # Axios + JWT interceptor
        │   ├── websocket.ts    # ActionCable client
        │   └── messageStore.ts # Local SQLite cache
        ├── screens/            # Login, Register, ChatList, Chat, NewChat, Settings
        ├── components/         # MessageBubble, ChatListItem, MessageInput, ContactPicker
        ├── context/            # AuthContext, ChatContext
        └── navigation/         # Stack + Tab navigation
```

## Development

### Reset Database
```bash
docker compose exec backend bundle exec rails db:drop db:create db:migrate
```

### View Logs
```bash
docker compose logs -f backend
```

### Stop Everything
```bash
docker compose down
```

### Stop and Remove Data
```bash
docker compose down -v
```
