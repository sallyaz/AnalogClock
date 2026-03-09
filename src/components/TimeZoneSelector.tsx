/**
 * TimeZoneSelector - Dropdown/list for selecting timezone
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  View,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { TimeZoneInfo } from '../types/ITimeZone';
import type { ITimeZoneSelectorProps } from '../types/ITimeZoneSelectorProps';

const formatDisplayName = (zone: TimeZoneInfo): string => {
  const parts: string[] = [zone.zoneName];
  if (zone.countryName) {
    parts.push(` (${zone.countryName})`);
  }
  return parts.join('');
};

export const TimeZoneSelector = ({
  timezones,
  selectedTimezone,
  onSelect,
  isLoading = false,
  error = null,
}: ITimeZoneSelectorProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTimezones = timezones.filter(
    (z) =>
      z.zoneName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (z.countryName?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const handleSelect = (zoneName: string) => {
    onSelect(zoneName);
    setModalVisible(false);
  };

  const selectedZone = timezones.find((z) => z.zoneName === selectedTimezone);

  if (isLoading && timezones.length === 0) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#212529" />
        <Text style={styles.loadingText}>Loading timezones...</Text>
      </View>
    );
  }

  if (error && timezones.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <View style={styles.selectorContent}>
          <Text style={styles.selectorLabel}>Select Timezone</Text>
          <Text style={styles.selectorText} numberOfLines={1}>
            {selectedZone
              ? formatDisplayName(selectedZone)
              : 'Choose a timezone'}
          </Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Timezone</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Done</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Search timezone or country..."
              placeholderTextColor="#6c757d"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />

            <FlashList
              data={filteredTimezones}
              keyExtractor={(item) => item.zoneName}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.listItem,
                    item.zoneName === selectedTimezone && styles.listItemSelected,
                  ]}
                  onPress={() => handleSelect(item.zoneName)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.listItemText} numberOfLines={2}>
                    {formatDisplayName(item)}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No matching timezones</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    minHeight: 80,
    justifyContent: 'center',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  selectorContent: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  selectorText: {
    fontSize: 16,
    color: '#f1f5f9',
    fontWeight: '600',
  },
  chevron: {
    fontSize: 32,
    color: '#64748b',
    marginLeft: 12,
    fontWeight: '300',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#94a3b8',
  },
  errorText: {
    fontSize: 14,
    color: '#f87171',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f1f5f9',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 17,
    color: '#3b82f6',
    fontWeight: '600',
  },
  searchInput: {
    margin: 20,
    padding: 16,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#334155',
    fontSize: 16,
    color: '#f1f5f9',
  },
  listItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  listItemSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  listItemText: {
    fontSize: 16,
    color: '#e2e8f0',
  },
  emptyText: {
    padding: 32,
    textAlign: 'center',
    color: '#64748b',
    fontSize: 16,
  },
});
