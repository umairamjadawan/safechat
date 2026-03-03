import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Conversation } from '../context/ChatContext';

interface Props {
  conversation: Conversation;
  onPress: () => void;
}

export default function ChatListItem({ conversation, onPress }: Props) {
  const title = conversation.display_title || conversation.title || 'Chat';
  const lastMsg = conversation.last_message;
  const time = lastMsg
    ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const initials = title
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {time ? <Text style={styles.time}>{time}</Text> : null}
        </View>
        <Text style={styles.preview} numberOfLines={1}>
          {lastMsg ? '🔒 Encrypted message' : 'No messages yet'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0084ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  preview: {
    fontSize: 14,
    color: '#666',
  },
});
