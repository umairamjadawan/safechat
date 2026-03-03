import nacl from 'tweetnacl';
import { toBase64, fromBase64, toUTF8, fromUTF8 } from '../utils/encoding';

export interface KeyPair {
  publicKey: string; // base64
  secretKey: string; // base64
}

export interface EncryptedMessage {
  encrypted_body: string; // base64
  nonce: string; // base64
}

// Generate a new X25519 key pair
export function generateKeyPair(): KeyPair {
  const pair = nacl.box.keyPair();
  return {
    publicKey: toBase64(pair.publicKey),
    secretKey: toBase64(pair.secretKey),
  };
}

// Encrypt a direct message using nacl.box (X25519 + XSalsa20-Poly1305)
export function encryptDirectMessage(
  message: string,
  recipientPublicKey: string,
  senderSecretKey: string
): EncryptedMessage {
  const messageBytes = fromUTF8(message);
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const recipientPubKeyBytes = fromBase64(recipientPublicKey);
  const senderSecKeyBytes = fromBase64(senderSecretKey);

  const encrypted = nacl.box(messageBytes, nonce, recipientPubKeyBytes, senderSecKeyBytes);
  if (!encrypted) throw new Error('Encryption failed');

  return {
    encrypted_body: toBase64(encrypted),
    nonce: toBase64(nonce),
  };
}

// Decrypt a direct message
export function decryptDirectMessage(
  encryptedBody: string,
  nonce: string,
  senderPublicKey: string,
  recipientSecretKey: string
): string {
  const encryptedBytes = fromBase64(encryptedBody);
  const nonceBytes = fromBase64(nonce);
  const senderPubKeyBytes = fromBase64(senderPublicKey);
  const recipientSecKeyBytes = fromBase64(recipientSecretKey);

  const decrypted = nacl.box.open(encryptedBytes, nonceBytes, senderPubKeyBytes, recipientSecKeyBytes);
  if (!decrypted) throw new Error('Decryption failed');

  return toUTF8(decrypted);
}

// Generate a random 32-byte symmetric key for group chats
export function generateGroupKey(): string {
  const key = nacl.randomBytes(nacl.secretbox.keyLength);
  return toBase64(key);
}

// Encrypt the group key for a specific recipient using nacl.box
export function encryptGroupKey(
  groupKey: string,
  recipientPublicKey: string,
  senderSecretKey: string
): EncryptedMessage {
  const groupKeyBytes = fromBase64(groupKey);
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const recipientPubKeyBytes = fromBase64(recipientPublicKey);
  const senderSecKeyBytes = fromBase64(senderSecretKey);

  const encrypted = nacl.box(groupKeyBytes, nonce, recipientPubKeyBytes, senderSecKeyBytes);
  if (!encrypted) throw new Error('Group key encryption failed');

  return {
    encrypted_body: toBase64(encrypted),
    nonce: toBase64(nonce),
  };
}

// Decrypt a group key received from the server
export function decryptGroupKey(
  encryptedGroupKey: string,
  nonce: string,
  senderPublicKey: string,
  recipientSecretKey: string
): string {
  const encryptedBytes = fromBase64(encryptedGroupKey);
  const nonceBytes = fromBase64(nonce);
  const senderPubKeyBytes = fromBase64(senderPublicKey);
  const recipientSecKeyBytes = fromBase64(recipientSecretKey);

  const decrypted = nacl.box.open(encryptedBytes, nonceBytes, senderPubKeyBytes, recipientSecKeyBytes);
  if (!decrypted) throw new Error('Group key decryption failed');

  return toBase64(decrypted);
}

// Encrypt a group message using nacl.secretbox (XSalsa20-Poly1305 symmetric)
export function encryptGroupMessage(message: string, groupKey: string): EncryptedMessage {
  const messageBytes = fromUTF8(message);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const keyBytes = fromBase64(groupKey);

  const encrypted = nacl.secretbox(messageBytes, nonce, keyBytes);
  if (!encrypted) throw new Error('Group message encryption failed');

  return {
    encrypted_body: toBase64(encrypted),
    nonce: toBase64(nonce),
  };
}

// Decrypt a group message using nacl.secretbox
export function decryptGroupMessage(
  encryptedBody: string,
  nonce: string,
  groupKey: string
): string {
  const encryptedBytes = fromBase64(encryptedBody);
  const nonceBytes = fromBase64(nonce);
  const keyBytes = fromBase64(groupKey);

  const decrypted = nacl.secretbox.open(encryptedBytes, nonceBytes, keyBytes);
  if (!decrypted) throw new Error('Group message decryption failed');

  return toUTF8(decrypted);
}
