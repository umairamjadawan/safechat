import axios from 'axios';
import { Platform } from 'react-native';
import { getToken } from './keyManager';

// iOS simulator uses localhost, Android emulator uses 10.0.2.2
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${DEV_HOST}:3000`;

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});

// Add JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getApiUrl = () => API_URL;

// Auth
export const register = (email: string, password: string, displayName: string, publicKey: string) =>
  api.post('/auth/register', {
    user: { email, password, password_confirmation: password, display_name: displayName, public_key: publicKey },
  });

export const login = (email: string, password: string) =>
  api.post('/auth/login', { user: { email, password } });

export const logout = () => api.delete('/auth/logout');

// Users
export const searchUsers = (query: string) => api.get(`/users/search?q=${encodeURIComponent(query)}`);

export const getUserKeys = (userId: string) => api.get(`/users/${userId}/keys`);

export const updateMyKeys = (publicKey: string) => api.put('/users/keys', { public_key: publicKey });

// Conversations
export const getConversations = () => api.get('/conversations');

export const getConversation = (id: string) => api.get(`/conversations/${id}`);

export const createConversation = (participantIds: string[], isGroup: boolean = false, title?: string) =>
  api.post('/conversations', { participant_ids: participantIds, is_group: isGroup, title });

// Messages
export const getMessages = (conversationId: string, page: number = 1) =>
  api.get(`/conversations/${conversationId}/messages?page=${page}`);

export const sendMessage = (conversationId: string, encryptedBody: string, nonce: string, messageType: string = 'text') =>
  api.post(`/conversations/${conversationId}/messages`, {
    message: { encrypted_body: encryptedBody, nonce, message_type: messageType },
  });

// Group Keys
export const getGroupKey = (conversationId: string) =>
  api.get(`/conversations/${conversationId}/group_keys`);

export const distributeGroupKeys = (conversationId: string, keys: Array<{ recipient_id: string; encrypted_group_key: string; nonce: string }>) =>
  api.post(`/conversations/${conversationId}/group_keys`, { group_keys: keys });

export default api;
