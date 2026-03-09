/**
 * Analog Clock App
 * Displays an analog clock with timezone support and offline caching.
 * Uses RTK Query for API calls and SQLite for offline persistence.
 *
 * @format
 */

import React from 'react';
import {  StyleSheet, useColorScheme, View } from 'react-native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from './src/store';
import { MainScreen } from './src/screens/MainScreen';

const App = () => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <View style={[styles.container, isDarkMode && styles.containerDark]}>
          <MainScreen />
        </View>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
});

export default App;
