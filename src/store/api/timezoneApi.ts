/**
 * RTK Query API slice for TimeZoneDB
 * Fetches timezone list from https://timezonedb.com/api
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { TIMEZONE_API_KEY } from '../../config';
import type { TimeZoneInfo } from '../../types/ITimeZone';

const API_URL = 'https://api.timezonedb.com/v2.1/list-time-zone';

interface TimeZoneDbResponse {
  status: string;
  message?: string;
  zones?: Array<{
    zoneName: string;
    gmtOffset: number;
    countryCode: string;
    countryName?: string;
  }>;
}

/**
 * Fallback when API key is missing or request fails
 */
function getFallbackTimeZones(): TimeZoneInfo[] {
  try {
    if ('supportedValuesOf' in Intl) {
      const zones = (Intl as unknown as { supportedValuesOf: (k: string) => string[] }).supportedValuesOf('timeZone');
      return zones.map((zoneName: string) => ({
        zoneName,
        gmtOffset: 0,
        countryCode: '',
      }));
    }
  } catch (err) {
    // Fallback to hardcoded zones
  }
  
  return [
    { zoneName: 'America/New_York', gmtOffset: -18000, countryCode: 'US' },
    { zoneName: 'America/Los_Angeles', gmtOffset: -28800, countryCode: 'US' },
    { zoneName: 'Europe/London', gmtOffset: 0, countryCode: 'GB' },
    { zoneName: 'Europe/Paris', gmtOffset: 3600, countryCode: 'FR' },
    { zoneName: 'Asia/Tokyo', gmtOffset: 32400, countryCode: 'JP' },
  ];
}

export const timezoneApi = createApi({
  reducerPath: 'timezoneApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_URL }),
  endpoints: (builder) => ({
    listTimeZones: builder.query<TimeZoneInfo[], void>({
      queryFn: async (_arg, _api, _extraOptions, baseQuery) => {
        if (!TIMEZONE_API_KEY || TIMEZONE_API_KEY === 'YOUR_API_KEY_HERE') {
          return { data: getFallbackTimeZones() };
        }

        try {
          const result = await baseQuery({
            url: '',
            params: {
              key: TIMEZONE_API_KEY,
              format: 'json',
            },
          });

          if (result.error) {
            return { data: getFallbackTimeZones() };
          }

          const data = result.data as TimeZoneDbResponse;
          
          if (data.status !== 'OK' || !data.zones) {
            return { data: getFallbackTimeZones() };
          }

          const zones: TimeZoneInfo[] = data.zones.map((z) => ({
            zoneName: z.zoneName,
            gmtOffset: z.gmtOffset,
            countryCode: z.countryCode,
            countryName: z.countryName,
          }));

          return { data: zones };
        } catch (err) {
          return { data: getFallbackTimeZones() };
        }
      },
    }),
  }),
});

export const { useListTimeZonesQuery, useLazyListTimeZonesQuery } = timezoneApi;
