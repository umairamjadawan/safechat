import React, { useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { searchUsers } from '../services/api';

interface User {
  id: string;
  email: string;
  display_name: string;
}

interface Props {
  onSelect: (user: User) => void;
  selectedIds?: string[];
}

export default function ContactPicker({ onSelect, selectedIds = [] }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch(text: string) {
    setQuery(text);
    if (text.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await searchUsers(text);
      setResults(res.data.users || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        value={query}
        onChangeText={handleSearch}
        placeholder="Search by email or name..."
        placeholderTextColor="#999"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {loading && <ActivityIndicator style={styles.loader} color="#0084ff" />}
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <TouchableOpacity
              style={[styles.item, isSelected && styles.itemSelected]}
              onPress={() => onSelect(item)}
              disabled={isSelected}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.display_name?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.display_name}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
              {isSelected && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          query.length >= 2 && !loading ? (
            <Text style={styles.empty}>No users found</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchInput: {
    height: 44,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    color: '#1a1a1a',
  },
  loader: {
    marginVertical: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  itemSelected: {
    backgroundColor: '#f0f8ff',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0084ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  email: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  check: {
    fontSize: 18,
    color: '#0084ff',
    fontWeight: '700',
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
    fontSize: 15,
  },
});
