CREATE TABLE IF NOT EXISTS shared_board_participants (
  board_id TEXT NOT NULL,
  owner_user_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  first_accessed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  last_accessed_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (board_id, owner_user_id, user_id),
  FOREIGN KEY (owner_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_shared_board_participants_lookup
  ON shared_board_participants(board_id, owner_user_id, last_accessed_at DESC);
