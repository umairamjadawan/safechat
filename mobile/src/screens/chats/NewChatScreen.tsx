import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ContactPicker from '../../components/ContactPicker';
import { useChats } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { getSecretKey } from '../../services/keyManager';
import { getUserKeys } from '../../services/api';
import { generateGroupKey, encryptGroupKey } from '../../services/crypto';
import { distributeGroupKeys } from '../../services/api';
import { showAlert } from '../../utils/alert';
import { colors } from '../../theme';

interface SelectedUser {
  id: string;
  email: string;
  display_name: string;
}

export default function NewChatScreen({ navigation }: any) {
  const { createDirectChat, createGroupChat } = useChats();
  const { user } = useAuth();
  const [isGroup, setIsGroup] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [creating, setCreating] = useState(false);

  function handleSelectUser(selectedUser: SelectedUser) {
    if (selectedUsers.find((u) => u.id === selectedUser.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== selectedUser.id));
    } else {
      setSelectedUsers([...selectedUsers, selectedUser]);
    }
  }

  async function handleCreate() {
    if (selectedUsers.length === 0) {
      showAlert('Error', 'Please select at least one person');
      return;
    }
    if (isGroup && !groupTitle.trim()) {
      showAlert('Error', 'Please enter a group name');
      return;
    }

    setCreating(true);
    try {
      if (isGroup) {
        const conv = await createGroupChat(groupTitle.trim(), selectedUsers.map((u) => u.id));

        // Generate and distribute group key
        const secretKey = await getSecretKey();
        if (secretKey) {
          const groupKey = generateGroupKey();
          const encryptedKeys = [];

          for (const member of selectedUsers) {
            const keysRes = await getUserKeys(member.id);
            const encrypted = encryptGroupKey(groupKey, keysRes.data.public_key, secretKey);
            encryptedKeys.push({
              recipient_id: member.id,
              encrypted_group_key: encrypted.encrypted_body,
              nonce: encrypted.nonce,
            });
          }

          // Also encrypt for self
          const myKeysRes = await getUserKeys(user!.id);
          const myEncrypted = encryptGroupKey(groupKey, myKeysRes.data.public_key, secretKey);
          encryptedKeys.push({
            recipient_id: user!.id,
            encrypted_group_key: myEncrypted.encrypted_body,
            nonce: myEncrypted.nonce,
          });

          await distributeGroupKeys(conv.id, encryptedKeys);
        }

        navigation.replace('Chat', { conversation: conv });
      } else {
        const conv = await createDirectChat(selectedUsers[0].id);
        navigation.replace('Chat', { conversation: conv });
      }
    } catch (err: any) {
      console.error('Create chat error:', err);
      showAlert('Error', 'Failed to create conversation');
    } finally {
      setCreating(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.options}>
        <View style={styles.groupToggle}>
          <View style={styles.groupLabelRow}>
            <Ionicons name="people" size={20} color={colors.textPrimary} />
            <Text style={styles.groupLabel}>Group Chat</Text>
          </View>
          <Switch
            value={isGroup}
            onValueChange={setIsGroup}
            trackColor={{ false: '#E0E0E0', true: colors.primaryLight }}
            thumbColor={colors.white}
          />
        </View>

        {isGroup && (
          <TextInput
            style={styles.groupInput}
            placeholder="Group name"
            placeholderTextColor={colors.textSecondary}
            value={groupTitle}
            onChangeText={setGroupTitle}
          />
        )}

        {selectedUsers.length > 0 && (
          <View style={styles.selected}>
            <Text style={styles.selectedLabel}>
              Selected ({selectedUsers.length}):
            </Text>
            <Text style={styles.selectedNames} numberOfLines={2}>
              {selectedUsers.map((u) => u.display_name).join(', ')}
            </Text>
          </View>
        )}
      </View>

      <ContactPicker
        onSelect={handleSelectUser}
        selectedIds={selectedUsers.map((u) => u.id)}
      />

      {selectedUsers.length > 0 && (
        <TouchableOpacity
          style={[styles.createButton, creating && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={creating}
          activeOpacity={0.8}
        >
          <Ionicons name={isGroup ? 'people' : 'chatbubble'} size={20} color={colors.white} />
          <Text style={styles.createButtonText}>
            {creating ? 'Creating...' : isGroup ? 'Create Group' : 'Start Chat'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  options: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.divider,
    paddingBottom: 12,
  },
  groupToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  groupLabel: {
    fontSize: 16,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  groupInput: {
    height: 44,
    backgroundColor: '#F0F2F5',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 8,
    color: colors.textPrimary,
  },
  selected: {
    marginTop: 4,
  },
  selectedLabel: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  selectedNames: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  createButton: {
    margin: 16,
    height: 50,
    backgroundColor: colors.primaryDark,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '600',
  },
});
