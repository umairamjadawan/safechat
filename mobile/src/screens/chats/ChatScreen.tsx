import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import MessageBubble from '../../components/MessageBubble';
import MessageInput from '../../components/MessageInput';
import * as api from '../../services/api';
import { getSecretKey, getOrCreateKeyPair } from '../../services/keyManager';
import {
  encryptDirectMessage,
  decryptDirectMessage,
  encryptGroupMessage,
  decryptGroupMessage,
  decryptGroupKey,
} from '../../services/crypto';
import { colors } from '../../theme';

interface DecryptedMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  isOwn: boolean;
}

export default function ChatScreen({ route, navigation }: any) {
  const { conversation } = route.params;
  const { user } = useAuth();
  const [messages, setMessages] = useState<DecryptedMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('Initializing...');
  const secretKeyRef = useRef<string | null>(null);
  const otherPubKeyRef = useRef<string | null>(null);
  const groupKeyRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    navigation.setOptions({
      title: conversation.display_title || conversation.title || 'Chat',
    });

    init();

    // Poll for new messages every 3 seconds
    pollRef.current = setInterval(() => {
      fetchAndDecryptMessages();
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  async function init() {
    try {
      // Step 1: Ensure we have encryption keys
      const keyPair = await getOrCreateKeyPair();
      secretKeyRef.current = keyPair.secretKey;
      setDebugInfo(prev => 'Keys: OK');

      if (!secretKeyRef.current) {
        setError('Failed to load encryption keys');
        setDebugInfo('Keys: FAILED');
        setLoading(false);
        return;
      }

      // Step 2: Load the other participant's public key
      const otherParticipant = conversation.participants?.find(
        (p: any) => p.id !== user?.id
      );

      if (otherParticipant) {
        try {
          const res = await api.getUserKeys(otherParticipant.id);
          otherPubKeyRef.current = res.data.public_key;
          setDebugInfo(`Keys: OK | Peer key: OK`);
        } catch (err) {
          setError(`Could not fetch ${otherParticipant.display_name}'s encryption key`);
          setDebugInfo(`Keys: OK | Peer key: FAILED`);
        }
      } else {
        setError('No other participant found in conversation');
        setDebugInfo('Keys: OK | No peer found');
      }

      // Step 3: For group chats, load group key
      if (conversation.is_group) {
        try {
          const res = await api.getGroupKey(conversation.id);
          const gk = res.data.group_key;
          if (otherParticipant && otherPubKeyRef.current && secretKeyRef.current) {
            groupKeyRef.current = decryptGroupKey(
              gk.encrypted_group_key,
              gk.nonce,
              otherPubKeyRef.current,
              secretKeyRef.current
            );
          }
        } catch {
          // Group key might not exist yet
        }
      }

      // Step 4: Load messages
      await fetchAndDecryptMessages();
    } catch (err: any) {
      setError('Initialization failed: ' + (err?.message || 'Unknown error'));
      setDebugInfo('Init: FAILED');
      setLoading(false);
    }
  }

  async function decryptMessage(msg: any): Promise<DecryptedMessage> {
    let text = '';

    try {
      if (conversation.is_group && groupKeyRef.current) {
        text = decryptGroupMessage(msg.encrypted_body, msg.nonce, groupKeyRef.current);
      } else if (!conversation.is_group && secretKeyRef.current && otherPubKeyRef.current) {
        text = decryptDirectMessage(
          msg.encrypted_body,
          msg.nonce,
          otherPubKeyRef.current,
          secretKeyRef.current
        );
      } else {
        text = '[No keys available]';
      }
    } catch (err: any) {
      text = '[Decryption error]';
    }

    const participant = conversation.participants?.find((p: any) => p.id === msg.sender_id);

    return {
      id: msg.id,
      text,
      senderId: msg.sender_id,
      senderName: participant?.display_name || 'Unknown',
      timestamp: msg.created_at,
      isOwn: msg.sender_id === user?.id,
    };
  }

  const fetchAndDecryptMessages = useCallback(async () => {
    try {
      const res = await api.getMessages(conversation.id, 1);
      const rawMessages = res.data.messages || [];
      const decrypted = await Promise.all(rawMessages.map(decryptMessage));
      setMessages(decrypted);
    } catch (err: any) {
      // Silently fail on poll, only show error on initial load
      if (loading) {
        setError('Failed to load messages');
      }
    } finally {
      setLoading(false);
    }
  }, [conversation.id, loading]);

  async function handleSend(text: string) {
    // Validate all required data is available
    if (!secretKeyRef.current) {
      setError('No encryption key. Please log out and log back in.');
      return;
    }

    if (!conversation.is_group && !otherPubKeyRef.current) {
      setError('Cannot encrypt: missing recipient key. Please go back and try again.');
      return;
    }

    setSending(true);
    setError('');

    try {
      let encrypted;

      if (conversation.is_group && groupKeyRef.current) {
        encrypted = encryptGroupMessage(text, groupKeyRef.current);
      } else {
        encrypted = encryptDirectMessage(text, otherPubKeyRef.current!, secretKeyRef.current);
      }

      await api.sendMessage(
        conversation.id,
        encrypted.encrypted_body,
        encrypted.nonce,
        'text'
      );

      // Reload messages from server to show the sent message
      await fetchAndDecryptMessages();
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.join(', ')
        || err?.response?.data?.error
        || err?.message
        || 'Send failed';
      setError('Send failed: ' + msg);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Setting up encryption...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.encryptionBanner}>
        <Ionicons name="lock-closed" size={12} color={colors.textSecondary} />
        <Text style={styles.encryptionText}>
          Messages are end-to-end encrypted
        </Text>
      </View>
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            text={item.text}
            isOwn={item.isOwn}
            timestamp={item.timestamp}
            senderName={item.senderName}
            showSender={conversation.is_group}
          />
        )}
        inverted
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No messages yet. Say hello!</Text>
          </View>
        }
      />
      <MessageInput onSend={handleSend} disabled={sending} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.chatBg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.chatBg,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textSecondary,
  },
  encryptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FDF8E1',
    paddingVertical: 5,
    gap: 4,
  },
  encryptionText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  errorBanner: {
    backgroundColor: colors.errorBg,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    fontWeight: '500',
  },
  messageList: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    transform: [{ scaleY: -1 }],
    gap: 8,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
  },
});
