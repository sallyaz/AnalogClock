/**
 * Time zone entry from API or local DB
 */
export interface TimeZoneInfo {
  zoneName: string;
  gmtOffset: number;
  countryCode: string;
  countryName?: string;
  regionName?: string;
  cityName?: string;
}
