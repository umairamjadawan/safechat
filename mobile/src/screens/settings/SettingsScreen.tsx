import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { getPublicKey } from '../../services/keyManager';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [publicKey, setPublicKey] = useState<string>('');

  useEffect(() => {
    getPublicKey().then((key) => {
      if (key) setPublicKey(key);
    });
  }, []);

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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user?.email || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Display Name</Text>
          <Text style={styles.value}>{user?.display_name || 'N/A'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Public Key</Text>
          <Text style={styles.valueSmall} numberOfLines={2}>{publicKey || 'Not generated'}</Text>
        </View>
        <Text style={styles.hint}>
          Your private key is stored securely on this device and never leaves it.
          All messages are encrypted end-to-end.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Version</Text>
          <Text style={styles.value}>1.0.0</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Encryption</Text>
          <Text style={styles.value}>X25519 + XSalsa20-Poly1305</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 15,
    color: '#1a1a1a',
  },
  value: {
    fontSize: 15,
    color: '#666',
    maxWidth: '60%',
    textAlign: 'right',
  },
  valueSmall: {
    fontSize: 11,
    color: '#666',
    maxWidth: '60%',
    textAlign: 'right',
    fontFamily: 'Courier',
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    lineHeight: 18,
  },
  signOutButton: {
    margin: 20,
    height: 50,
    backgroundColor: '#ff3b30',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
