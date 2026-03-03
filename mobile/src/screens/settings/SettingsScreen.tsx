import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { getPublicKey } from '../../services/keyManager';
import { colors, getAvatarColor } from '../../theme';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [publicKey, setPublicKey] = useState<string>('');

  useEffect(() => {
    getPublicKey().then((key) => {
      if (key) setPublicKey(key);
    });
  }, []);

  const displayName = user?.display_name || 'User';
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  const avatarBg = getAvatarColor(displayName);

  function handleSignOut() {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out? Your encryption keys will be removed from this device.')) {
        signOut();
      }
    } else {
      Alert.alert(
        'Sign Out',
        'Are you sure you want to sign out? Your encryption keys will be removed from this device.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign Out', style: 'destructive', onPress: signOut },
        ]
      );
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={[styles.profileAvatar, { backgroundColor: avatarBg }]}>
          <Text style={styles.profileInitials}>{initials}</Text>
        </View>
        <Text style={styles.profileName}>{displayName}</Text>
        <Text style={styles.profileEmail}>{user?.email || ''}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.infoRow}>
          <View style={styles.rowLeft}>
            <Ionicons name="mail-outline" size={20} color={colors.primary} />
            <Text style={styles.label}>Email</Text>
          </View>
          <Text style={styles.value}>{user?.email || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.rowLeft}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <Text style={styles.label}>Display Name</Text>
          </View>
          <Text style={styles.value}>{displayName}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.infoRow}>
          <View style={styles.rowLeft}>
            <Ionicons name="key-outline" size={20} color={colors.primary} />
            <Text style={styles.label}>Public Key</Text>
          </View>
          <Text style={styles.valueSmall} numberOfLines={2}>{publicKey || 'Not generated'}</Text>
        </View>
        <View style={styles.hintRow}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.hint}>
            Your private key is stored securely on this device and never leaves it.
            All messages are encrypted end-to-end.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoRow}>
          <View style={styles.rowLeft}>
            <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
            <Text style={styles.label}>Version</Text>
          </View>
          <Text style={styles.value}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.rowLeft}>
            <MaterialIcons name="enhanced-encryption" size={20} color={colors.primary} />
            <Text style={styles.label}>Encryption</Text>
          </View>
          <Text style={styles.value}>X25519 + XSalsa20-Poly1305</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color={colors.white} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 28,
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileInitials: {
    color: colors.white,
    fontSize: 30,
    fontWeight: '700',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    backgroundColor: colors.white,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.divider,
  },
  sectionTitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 15,
    color: colors.textPrimary,
  },
  value: {
    fontSize: 15,
    color: colors.textSecondary,
    maxWidth: '50%',
    textAlign: 'right',
  },
  valueSmall: {
    fontSize: 11,
    color: colors.textSecondary,
    maxWidth: '50%',
    textAlign: 'right',
    fontFamily: 'Courier',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    gap: 6,
  },
  hint: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  signOutButton: {
    margin: 20,
    height: 50,
    backgroundColor: '#E53935',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  signOutText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
});
