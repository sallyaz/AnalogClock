/**
 * Timezone helper functions
 */

import type { TimeZoneInfo } from '../types/ITimeZone';

/**
 * Format timezone display name with country information
 */
export const formatTimezoneDisplayName = (
  timezone: string,
  timezones: TimeZoneInfo[]
): string => {
  const selectedZone = timezones.find((z) => z.zoneName === timezone);
  
  if (selectedZone?.countryName) {
    const cityName = selectedZone.zoneName.split('/').pop()?.replaceAll('_', ' ');
    return `${cityName}, ${selectedZone.countryName}`;
  }
  
  return timezone.split('/').pop()?.replaceAll('_', ' ') || 'Select Timezone';
};
