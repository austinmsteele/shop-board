ALTER TABLE users
  ADD COLUMN has_seeded_demo_board INTEGER NOT NULL DEFAULT 0
  CHECK (has_seeded_demo_board IN (0, 1));

ALTER TABLE users
  ADD COLUMN demo_board_seeded_at TEXT;

CREATE TABLE IF NOT EXISTS board_templates (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  template_board_id TEXT NOT NULL,
  source_user_id TEXT,
  source_board_id TEXT,
  board_json TEXT NOT NULL,
  field_categories_json TEXT NOT NULL DEFAULT '[]',
  item_custom_values_json TEXT NOT NULL DEFAULT '[]',
  is_active INTEGER NOT NULL DEFAULT 1,
  is_default INTEGER NOT NULL DEFAULT 0,
  is_read_only INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (is_active IN (0, 1)),
  CHECK (is_default IN (0, 1)),
  CHECK (is_read_only IN (0, 1)),
  FOREIGN KEY (source_user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_board_templates_single_default
  ON board_templates(is_default)
  WHERE is_default = 1;

CREATE INDEX IF NOT EXISTS idx_board_templates_active_slug
  ON board_templates(is_active, slug);

CREATE INDEX IF NOT EXISTS idx_board_templates_template_board
  ON board_templates(template_board_id);
