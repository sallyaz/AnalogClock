declare module 'react-native-sqlite-storage' {
  export interface ResultSet {
    rows: { length: number; item: (i: number) => Record<string, string | number | null | undefined> };
  }
  export interface Transaction {
    executeSql: (sql: string, params?: unknown[]) => Promise<unknown>;
  }
  export interface SQLiteDatabase {
    executeSql: (sql: string, params?: unknown[]) => Promise<[ResultSet]>;
    transaction: (fn: (tx: Transaction) => void | Promise<void>) => Promise<void>;
  }
  export function openDatabase(config: {
    name: string;
    location?: string;
  }): Promise<SQLiteDatabase>;
}
