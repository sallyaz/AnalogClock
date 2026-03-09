/**
 * SQLite database service for offline timezone caching
 */

import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import type { TimeZoneInfo } from '../types/ITimeZone';

const DB_NAME = 'analog_clock_db.db';
const TABLES = {
  TIMEZONES: 'timezones',
  SETTINGS: 'settings',
};

let db: SQLiteDatabase | null = null;

/**
 * Opens or returns existing database connection
 */
export const getDatabase = async (): Promise<SQLiteDatabase> => {
  if (db) return db;

  db = await SQLite.openDatabase({
    name: DB_NAME,
    location: 'default',
  });
  await initSchema(db);
  return db;
};

/**
 * Initializes database tables
 */
const initSchema = async (database: SQLiteDatabase): Promise<void> => {
  const createTimezones = `
    CREATE TABLE IF NOT EXISTS ${TABLES.TIMEZONES} (
      zoneName TEXT PRIMARY KEY,
      gmtOffset INTEGER NOT NULL,
      countryCode TEXT,
      countryName TEXT,
      createdAt INTEGER
    );
  `;
  const createSettings = `
    CREATE TABLE IF NOT EXISTS ${TABLES.SETTINGS} (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `;

  await database.executeSql(createTimezones);
  await database.executeSql(createSettings);
};

/**
 * Saves timezone list to database
 */
export const saveTimeZones = async (zones: TimeZoneInfo[]): Promise<void> => {
  const database = await getDatabase();
  const now = Date.now();

  await database.transaction(async (tx) => {
    await tx.executeSql(`DELETE FROM ${TABLES.TIMEZONES}`);

    for (const z of zones) {
      await tx.executeSql(
        `INSERT OR REPLACE INTO ${TABLES.TIMEZONES} (zoneName, gmtOffset, countryCode, countryName, createdAt) VALUES (?, ?, ?, ?, ?)`,
        [
          z.zoneName,
          z.gmtOffset,
          z.countryCode ?? '',
          z.countryName ?? '',
          now,
        ]
      );
    }
  });
};

/**
 * Loads timezone list from database
 */
export const loadTimeZonesFromDb = async (): Promise<TimeZoneInfo[] | null> => {
  try {
    const database = await getDatabase();
    const results = await database.executeSql(
      `SELECT zoneName, gmtOffset, countryCode, countryName FROM ${TABLES.TIMEZONES} ORDER BY zoneName`
    );
    
    // executeSql returns an array of ResultSet objects
    const resultSet = results[0];

    if (resultSet.rows.length === 0) {
      return null;
    }

    const zones: TimeZoneInfo[] = [];
    for (let i = 0; i < resultSet.rows.length; i++) {
      const row = resultSet.rows.item(i);
      zones.push({
        zoneName: String(row.zoneName ?? ''),
        gmtOffset: Number(row.gmtOffset ?? 0),
        countryCode: String(row.countryCode ?? ''),
        countryName: row.countryName === null ? undefined : String(row.countryName),
      });
    }
    
    return zones;
  } catch {
    // Database read failed - return null to trigger API fallback
    return null;
  }
};

/**
 * Saves last selected timezone
 */
export const saveLastSelectedTimezone = async (zoneName: string): Promise<void> => {
  const database = await getDatabase();
  await database.executeSql(
    `INSERT OR REPLACE INTO ${TABLES.SETTINGS} (key, value) VALUES (?, ?)`,
    ['lastTimezone', zoneName]
  );
};

/**
 * Loads last selected timezone
 */
export const loadLastSelectedTimezone = async (): Promise<string | null> => {
  try {
    const database = await getDatabase();
    const results = await database.executeSql(
      `SELECT value FROM ${TABLES.SETTINGS} WHERE key = ?`,
      ['lastTimezone']
    );

    const resultSet = results[0];
    if (resultSet.rows.length > 0) {
      const value = resultSet.rows.item(0).value;
      return value === null ? null : String(value);
    }
    return null;
  } catch {
    return null;
  }
};
