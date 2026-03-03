// Native-only: use SecureStore for key storage
import * as SecureStore from 'expo-secure-store';
import { generateKeyPair, KeyPair } from './crypto';

const PRIVATE_KEY_STORE = 'safechat_private_key';
const PUBLIC_KEY_STORE = 'safechat_public_key';
const TOKEN_STORE = 'safechat_jwt_token';

export async function getOrCreateKeyPair(): Promise<KeyPair> {
  const existingSecret = await SecureStore.getItemAsync(PRIVATE_KEY_STORE);
  const existingPublic = await SecureStore.getItemAsync(PUBLIC_KEY_STORE);

  if (existingSecret && existingPublic) {
    return { publicKey: existingPublic, secretKey: existingSecret };
  }

  const keyPair = generateKeyPair();
  await SecureStore.setItemAsync(PRIVATE_KEY_STORE, keyPair.secretKey);
  await SecureStore.setItemAsync(PUBLIC_KEY_STORE, keyPair.publicKey);
  return keyPair;
}

export async function getSecretKey(): Promise<string | null> {
  return await SecureStore.getItemAsync(PRIVATE_KEY_STORE);
}

export async function getPublicKey(): Promise<string | null> {
  return await SecureStore.getItemAsync(PUBLIC_KEY_STORE);
}

export async function clearKeys(): Promise<void> {
  await SecureStore.deleteItemAsync(PRIVATE_KEY_STORE);
  await SecureStore.deleteItemAsync(PUBLIC_KEY_STORE);
}

export async function storeToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_STORE, token);
}

export async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync(TOKEN_STORE);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_STORE);
}
