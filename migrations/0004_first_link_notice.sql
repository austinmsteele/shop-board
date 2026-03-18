ALTER TABLE users
  ADD COLUMN has_seen_first_link_notice INTEGER NOT NULL DEFAULT 0;

ALTER TABLE users
  ADD COLUMN first_link_notice_eligible INTEGER NOT NULL DEFAULT 0;

ALTER TABLE users
  ADD COLUMN first_link_notice_triggered_at TEXT;
