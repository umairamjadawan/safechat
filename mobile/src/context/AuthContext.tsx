import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as api from '../services/api';
import { storeToken, getToken, clearToken, clearKeys, getOrCreateKeyPair } from '../services/keyManager';
import { initDatabase, clearLocalMessages } from '../services/messageStore';

interface User {
  id: string;
  email: string;
  display_name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await getToken();
      if (token) {
        // Decode JWT payload to get user ID
        const payload = JSON.parse(atob(token.split('.')[1]));

        // Validate token by making an API call
        await api.getConversations();

        // Ensure encryption keys exist and sync to server
        const keyPair = await getOrCreateKeyPair();
        await api.updateMyKeys(keyPair.publicKey);

        setUser({ id: payload.sub, email: '', display_name: '' });
      }
    } catch {
      await clearToken();
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    const res = await api.login(email, password);
    const { user: userData, token } = res.data;
    await storeToken(token);
    await initDatabase();

    // Ensure encryption keys exist and sync public key to server
    const keyPair = await getOrCreateKeyPair();
    await api.updateMyKeys(keyPair.publicKey);

    setUser(userData);
  }

  async function signUp(email: string, password: string, displayName: string) {
    const keyPair = await getOrCreateKeyPair();
    const res = await api.register(email, password, displayName, keyPair.publicKey);
    const { user: userData, token } = res.data;
    await storeToken(token);
    await initDatabase();
    setUser(userData);
  }

  async function signOut() {
    try {
      await api.logout();
    } catch {}
    await clearToken();
    await clearKeys();
    await clearLocalMessages();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
