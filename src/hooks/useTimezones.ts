/**
 * Offline-first timezone hook
 * 1. Load from SQLite on mount
 * 2. If DB empty/fails -> fetch via RTK Query, save to SQLite
 * 3. Persist and restore last selected timezone
 * 4. Use NetInfo to detect network status and skip API calls when offline
 */

import { useCallback, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useLazyListTimeZonesQuery } from '../store/api/timezoneApi';
import { useAppDispatch, useAppSelector } from '../store';
import { setSelectedTimezone } from '../store/slices/timezoneSlice';
import {
  loadTimeZonesFromDb,
  saveLastSelectedTimezone,
  saveTimeZones,
} from '../services/database';
import { extractErrorMessage } from '../helpers/timezoneUtils';
import { loadAndSelectTimezone, updateCacheWithFreshData } from '../helpers/timezoneDataHelpers';
import type { TimeZoneInfo } from '../types/ITimeZone';
import type { IUseTimezonesResult } from '../types/IUseTimezonesResult';

export const useTimezones = (): IUseTimezonesResult => {
  const [timezones, setTimezones] = useState<TimeZoneInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  const selectedTimezone = useAppSelector((state) => state.timezone.selectedTimezone);
  const dispatch = useAppDispatch();
  const [fetchTimeZones] = useLazyListTimeZonesQuery();

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  const handleCachedData = useCallback(async (zones: TimeZoneInfo[]) => {
    setIsOfflineMode(true);
    setTimezones(zones);
    await loadAndSelectTimezone(zones, dispatch, setSelectedTimezone);

    // If online, refresh data in background
    if (isConnected === true) {
      try {
        const result = await fetchTimeZones();
        if (result.data && result.data.length > 0) {
          await updateCacheWithFreshData(
            result.data,
            setTimezones,
            setIsOfflineMode,
            dispatch,
            setSelectedTimezone
          );
        }
      } catch {
        // Silent fail - we already have cached data, keep using it
        setIsOfflineMode(true);
      }
    }
  }, [isConnected, fetchTimeZones, dispatch]);

  const handleFreshFetch = useCallback(async () => {
    setIsOfflineMode(false);
    const result = await fetchTimeZones();
    
    if (result.data) {
      await saveTimeZones(result.data);
      setTimezones(result.data);
      await loadAndSelectTimezone(result.data, dispatch, setSelectedTimezone);
    } else if (result.error) {
      const errMsg = extractErrorMessage(result.error);
      setError(errMsg || 'Failed to load timezones');
    }
  }, [fetchTimeZones, dispatch]);

  const handleFallbackFetch = useCallback(async () => {
    try {
      const result = await fetchTimeZones();
      if (result.data && result.data.length > 0) {
        await updateCacheWithFreshData(
          result.data,
          setTimezones,
          setIsOfflineMode,
          dispatch,
          setSelectedTimezone
        );
      }
    } catch (fallbackErr) {
      setTimezones([]);
      setIsOfflineMode(true);
      setError(fallbackErr instanceof Error ? fallbackErr.message : 'Failed to load timezones');
    }
  }, [fetchTimeZones, dispatch]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const zones = await loadTimeZonesFromDb();
      
      if (zones && zones.length > 0) {
        await handleCachedData(zones);
      } else if (isConnected === false) {
        setError('No internet connection and no cached data available');
        setIsOfflineMode(true);
      } else {
        await handleFreshFetch();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load timezones');
      
      // Fallback: Try API as last resort (only if we think we're online)
      if (isConnected !== false) {
        await handleFallbackFetch();
      }
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, handleCachedData, handleFreshFetch, handleFallbackFetch]);

  useEffect(() => {
    if (isConnected !== null) {
      loadData();
    }
  }, [loadData, isConnected]);

  const handleSetSelectedTimezone = useCallback(
    (zoneName: string) => {
      dispatch(setSelectedTimezone(zoneName));
      saveLastSelectedTimezone(zoneName).catch(() => {
        // Non-critical: selection still works in memory
      });
    },
    [dispatch]
  );

  return {
    timezones,
    selectedTimezone,
    setSelectedTimezone: handleSetSelectedTimezone,
    isLoading,
    error,
    refetch: loadData,
    isOfflineMode,
  };
};
