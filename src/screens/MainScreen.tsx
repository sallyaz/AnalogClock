/**
 * Main screen: Analog clock and timezone selector
 */

import React from 'react';
import { StyleSheet, View, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnalogClock } from '../components/AnalogClock';
import { SelectorContent } from '../components/SelectorContent';
import { useTimezones } from '../hooks/useTimezones';

export const MainScreen = () => {
  const { height, width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const isLandscape = width > height;
  
  const {
    timezones,
    selectedTimezone,
    setSelectedTimezone,
    isLoading,
    error,
  } =useTimezones();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isLandscape ? styles.scrollContentLandscape : styles.scrollContentPortrait,
          { 
            minHeight: height - insets.top - insets.bottom,
            paddingBottom: 40 + insets.bottom 
          }
        ]}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Clock */}
        <View style={[
          styles.clockWrapper,
          isLandscape && styles.clockWrapperLandscape
        ]}>
          <AnalogClock
            key={selectedTimezone}
            timezone={selectedTimezone || undefined}
          />
        </View>

        {/* Timezone selector button */}
        <View style={[
          styles.selectorWrapper,
          isLandscape && styles.selectorWrapperLandscape
        ]}>
          <SelectorContent
            isLoading={isLoading}
            error={error}
            timezones={timezones}
            selectedTimezone={selectedTimezone}
            setSelectedTimezone={setSelectedTimezone}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 40,
  },
  scrollContentPortrait: {
    justifyContent: 'space-between',
  },
  scrollContentLandscape: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 40,
  },
  clockWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  clockWrapperLandscape: {
    paddingVertical: 20,
    paddingRight: 40,
  },
  selectorWrapper: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
  },
  selectorWrapperLandscape: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
    maxWidth: 400,
  },
});
