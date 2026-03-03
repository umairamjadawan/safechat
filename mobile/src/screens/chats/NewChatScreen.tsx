import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, TextInput } from 'react-native';
import ContactPicker from '../../components/ContactPicker';
import { useChats } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { getSecretKey } from '../../services/keyManager';
import { getUserKeys } from '../../services/api';
import { generateGroupKey, encryptGroupKey } from '../../services/crypto';
import { distributeGroupKeys } from '../../services/api';
import { showAlert } from '../../utils/alert';

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
          <Text style={styles.groupLabel}>Group Chat</Text>
          <Switch value={isGroup} onValueChange={setIsGroup} trackColor={{ true: '#0084ff' }} />
        </View>

        {isGroup && (
          <TextInput
            style={styles.groupInput}
            placeholder="Group name"
            placeholderTextColor="#999"
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
        >
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
    backgroundColor: '#fff',
  },
  options: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 12,
  },
  groupToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupLabel: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  groupInput: {
    height: 44,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 8,
    color: '#1a1a1a',
  },
  selected: {
    marginTop: 4,
  },
  selectedLabel: {
    fontSize: 13,
    color: '#0084ff',
    fontWeight: '600',
    marginBottom: 2,
  },
  selectedNames: {
    fontSize: 13,
    color: '#666',
  },
  createButton: {
    margin: 16,
    height: 50,
    backgroundColor: '#0084ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#ccc',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
