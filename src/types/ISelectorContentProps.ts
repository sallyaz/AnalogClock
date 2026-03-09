/**
 * Props interface for SelectorContent component
 */

import type { TimeZoneInfo } from './ITimeZone';

export interface ISelectorContentProps {
  isLoading: boolean;
  error: string | null;
  timezones: TimeZoneInfo[];
  selectedTimezone: string;
  setSelectedTimezone: (zone: string) => void;
}
