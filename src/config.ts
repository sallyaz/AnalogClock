/**
 * App configuration
 * API key is loaded from .env via react-native-config
 * Get your key at https://timezonedb.com/register
 * Falls back when native module isn't linked (run pod install + rebuild)
 */

const FALLBACK_API_KEY = 'RFPT1ZSU2F6J'; // Temporary: direct API key until react-native-config is linked

function getEnvValue(key: string): string | undefined {
  try {
    const Config = require('react-native-config').default;
    return Config?.[key] as string | undefined;
  } catch {
    return undefined;
  }
}

export const TIMEZONE_API_KEY =
  getEnvValue('TIMEZONE_API_KEY') ?? FALLBACK_API_KEY;
