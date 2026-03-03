// Web-only: use sessionStorage for per-tab isolation
// (localStorage is shared across tabs, which breaks multi-user testing)
import { generateKeyPair, KeyPair } from './crypto';

const PRIVATE_KEY_STORE = 'safechat_private_key';
const PUBLIC_KEY_STORE = 'safechat_public_key';
const TOKEN_STORE = 'safechat_jwt_token';

export async function getOrCreateKeyPair(): Promise<KeyPair> {
  const existingSecret = sessionStorage.getItem(PRIVATE_KEY_STORE);
  const existingPublic = sessionStorage.getItem(PUBLIC_KEY_STORE);

  if (existingSecret && existingPublic) {
    return { publicKey: existingPublic, secretKey: existingSecret };
  }

  const keyPair = generateKeyPair();
  sessionStorage.setItem(PRIVATE_KEY_STORE, keyPair.secretKey);
  sessionStorage.setItem(PUBLIC_KEY_STORE, keyPair.publicKey);
  return keyPair;
}

export async function getSecretKey(): Promise<string | null> {
  return sessionStorage.getItem(PRIVATE_KEY_STORE);
}

export async function getPublicKey(): Promise<string | null> {
  return sessionStorage.getItem(PUBLIC_KEY_STORE);
}

export async function clearKeys(): Promise<void> {
  sessionStorage.removeItem(PRIVATE_KEY_STORE);
  sessionStorage.removeItem(PUBLIC_KEY_STORE);
}

export async function storeToken(token: string): Promise<void> {
  sessionStorage.setItem(TOKEN_STORE, token);
}

export async function getToken(): Promise<string | null> {
  return sessionStorage.getItem(TOKEN_STORE);
}

export async function clearToken(): Promise<void> {
  sessionStorage.removeItem(TOKEN_STORE);
}
