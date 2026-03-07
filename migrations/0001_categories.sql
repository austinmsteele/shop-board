CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  scope_type TEXT NOT NULL,
  scope_id TEXT NOT NULL,
  label TEXT NOT NULL,
  slug TEXT NOT NULL,
  type TEXT NOT NULL,
  allowed_options_json TEXT NOT NULL DEFAULT '[]',
  is_default INTEGER NOT NULL DEFAULT 0,
  is_deletable INTEGER NOT NULL DEFAULT 1,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (scope_type IN ('board', 'account')),
  CHECK (type IN ('text', 'number', 'boolean', 'select')),
  CHECK (is_default IN (0, 1)),
  CHECK (is_deletable IN (0, 1)),
  UNIQUE (scope_type, scope_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_categories_scope
  ON categories(scope_type, scope_id, position);

CREATE TABLE IF NOT EXISTS item_custom_values (
  board_id TEXT NOT NULL,
  item_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  value_type TEXT NOT NULL,
  value_text TEXT,
  value_number REAL,
  value_boolean INTEGER,
  value_select TEXT,
  source TEXT NOT NULL DEFAULT 'user',
  confidence REAL,
  last_updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (value_type IN ('text', 'number', 'boolean', 'select')),
  CHECK (source IN ('scraped', 'user')),
  CHECK (value_boolean IN (0, 1) OR value_boolean IS NULL),
  PRIMARY KEY (board_id, item_id, category_id),
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_item_custom_values_board
  ON item_custom_values(board_id, item_id);
