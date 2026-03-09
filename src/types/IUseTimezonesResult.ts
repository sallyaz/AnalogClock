/**
 * Return type for useTimezonesWithOffline hook
 */

import type { TimeZoneInfo } from './ITimeZone';

export interface IUseTimezonesResult {
  timezones: TimeZoneInfo[];
  selectedTimezone: string;
  setSelectedTimezone: (zoneName: string) => void;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isOfflineMode: boolean;
}
