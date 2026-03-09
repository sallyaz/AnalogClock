/**
 * Props interface for TimeZoneSelector component
 */

import type { TimeZoneInfo } from './ITimeZone';

export interface ITimeZoneSelectorProps {
  timezones: TimeZoneInfo[];
  selectedTimezone: string;
  onSelect: (zoneName: string) => void;
  isLoading?: boolean;
  error?: string | null;
}
