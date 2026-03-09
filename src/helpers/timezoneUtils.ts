/**
 * Timezone utility functions
 */

import type { TimeZoneInfo } from '../types/ITimeZone';

/**
 * Gets the user's current timezone using Intl API
 */
export const getCurrentTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return '';
  }
};

/**
 * Determines the best timezone to select based on priority:
 * 1. Last selected timezone (user preference)
 * 2. Current device timezone
 * 3. First available timezone
 */
export const selectBestTimezone = (
  zones: TimeZoneInfo[],
  lastSelected: string | null,
  currentTimezone: string
): string => {
  if (lastSelected && zones.some((z) => z.zoneName === lastSelected)) {
    return lastSelected;
  }
  
  if (currentTimezone && zones.some((z) => z.zoneName === currentTimezone)) {
    return currentTimezone;
  }
  
  return zones[0].zoneName;
};

/**
 * Extracts error message from RTK Query error object
 */
export const extractErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as Error).message;
  }
  return typeof error === 'string' ? error : 'An unknown error occurred';
};
