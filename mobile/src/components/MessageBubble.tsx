import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme';

interface Props {
  text: string;
  isOwn: boolean;
  timestamp: string;
  senderName?: string;
  showSender?: boolean;
}

export default function MessageBubble({ text, isOwn, timestamp, senderName, showSender }: Props) {
  const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View style={[styles.container, isOwn ? styles.ownContainer : styles.otherContainer]}>
      {showSender && senderName && !isOwn && (
        <Text style={styles.senderName}>{senderName}</Text>
      )}
      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text style={styles.text}>{text}</Text>
        <View style={styles.meta}>
          <Text style={styles.time}>{time}</Text>
          {isOwn && (
            <Ionicons
              name="checkmark-done"
              size={14}
              color={colors.primary}
              style={styles.checkIcon}
            />
          )}
        </View>
      </View>
      {/* Bubble tail */}
      <View
        style={[
          styles.tail,
          isOwn ? styles.ownTail : styles.otherTail,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 1,
    marginHorizontal: 12,
    position: 'relative',
  },
  ownContainer: {
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingTop: 6,
    paddingBottom: 6,
    borderRadius: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 1,
    elevation: 1,
  },
  ownBubble: {
    backgroundColor: colors.sentBubble,
    borderTopRightRadius: 2,
  },
  otherBubble: {
    backgroundColor: colors.receivedBubble,
    borderTopLeftRadius: 2,
  },
  text: {
    fontSize: 15.5,
    lineHeight: 20,
    color: colors.textPrimary,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  checkIcon: {
    marginLeft: 3,
  },
  tail: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderBottomWidth: 0,
    borderStyle: 'solid',
    backgroundColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  ownTail: {
    right: -4,
    borderLeftWidth: 6,
    borderRightWidth: 0,
    borderTopColor: colors.sentBubble,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  otherTail: {
    left: -4,
    borderRightWidth: 6,
    borderLeftWidth: 0,
    borderTopColor: colors.receivedBubble,
    borderRightColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  senderName: {
    fontSize: 12.5,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 2,
    marginLeft: 10,
  },
});
