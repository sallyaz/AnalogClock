/**
 * Selector content component with loading and error states
 */

import React from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { TimeZoneSelector } from './TimeZoneSelector';
import type { ISelectorContentProps } from '../types/ISelectorContentProps';

export const SelectorContent = ({
  isLoading,
  error,
  timezones,
  selectedTimezone,
  setSelectedTimezone,
}: ISelectorContentProps) => {
  if (isLoading && timezones.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading timezones...</Text>
      </View>
    );
  }

  if (error && timezones.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error}
        </Text>
      </View>
    );
  }

  return (
    <TimeZoneSelector
      timezones={timezones}
      selectedTimezone={selectedTimezone}
      onSelect={setSelectedTimezone}
      isLoading={isLoading}
      error={error}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#94a3b8',
  },
  errorContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
  },
  errorText: {
    fontSize: 15,
    color: '#f87171',
  },
});
