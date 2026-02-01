-- Webzam scan history table
CREATE TABLE IF NOT EXISTS scans (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  created_at TEXT NOT NULL,
  result_json TEXT NOT NULL
);

-- Index for listing scans by date
CREATE INDEX IF NOT EXISTS idx_scans_created_at ON scans(created_at DESC);
