import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join('/home/ardy/workspace/collaborate/', 'orchestra.db');
const db = new Database(dbPath);

// Enable WAL mode for high concurrency
db.pragma('journal_mode = WAL');

export const DatabasePlugin = {
  id: 'db-manager',
  name: 'Database Engine',
  init: () => {
    console.log('Database Plugin Initialized: SQLite (better-sqlite3)');
    // Initialize tables
    db.prepare(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT,
        description TEXT,
        link TEXT,
        iconName TEXT,
        category TEXT,
        isActive INTEGER
      )
    `).run();
    db.prepare(`
      CREATE TABLE IF NOT EXISTS port_forwards (
        id TEXT PRIMARY KEY,
        name TEXT,
        incomingPort INTEGER,
        localAddress TEXT,
        localPort INTEGER,
        status TEXT
      )
    `).run();
  },
  render: () => null, // Backend plugin
  getInstance: () => db
};
