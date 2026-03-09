/**
 * Helper functions for timezone data loading and selection
 */

import type { TimeZoneInfo } from '../types/ITimeZone';
import {
  loadLastSelectedTimezone,
  saveTimeZones,
} from '../services/database';
import {
  getCurrentTimezone,
  selectBestTimezone,
} from './timezoneUtils';

/**
 * Loads and selects the appropriate timezone from a list
 */
export const loadAndSelectTimezone = async (
  zones: TimeZoneInfo[],
  dispatch: (action: any) => void,
  setSelectedTimezoneAction: (timezone: string) => any
): Promise<void> => {
  const lastSelected = await loadLastSelectedTimezone();
  const currentTimezone = getCurrentTimezone();
  const timezoneToSelect = selectBestTimezone(zones, lastSelected, currentTimezone);
  dispatch(setSelectedTimezoneAction(timezoneToSelect));
};

/**
 * Updates cache with fresh API data
 */
export const updateCacheWithFreshData = async (
  data: TimeZoneInfo[],
  setTimezones: (zones: TimeZoneInfo[]) => void,
  setIsOfflineMode: (isOffline: boolean) => void,
  dispatch: (action: any) => void,
  setSelectedTimezoneAction: (timezone: string) => any
): Promise<void> => {
  await saveTimeZones(data);
  setTimezones(data);
  setIsOfflineMode(false);
  
  const lastSelected = await loadLastSelectedTimezone();
  const currentTimezone = getCurrentTimezone();
  const freshTimezoneToSelect = selectBestTimezone(data, lastSelected, currentTimezone);
  dispatch(setSelectedTimezoneAction(freshTimezoneToSelect));
};
