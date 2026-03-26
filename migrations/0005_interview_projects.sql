CREATE TABLE IF NOT EXISTS interview_projects (
  id TEXT PRIMARY KEY,
  payload_json TEXT NOT NULL DEFAULT '{}',
  audio_blob BLOB,
  audio_filename TEXT NOT NULL DEFAULT '',
  audio_mime_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  version INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
