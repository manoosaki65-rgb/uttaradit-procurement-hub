-- Add columns to the existing table only. No rows are replaced or deleted.
ALTER TABLE command_numbers ADD COLUMN reserved_by TEXT NOT NULL DEFAULT '';
ALTER TABLE command_numbers ADD COLUMN reserved_at TEXT;
ALTER TABLE command_numbers ADD COLUMN used_at TEXT;
ALTER TABLE command_numbers ADD COLUMN revision INTEGER NOT NULL DEFAULT 0;
ALTER TABLE command_numbers ADD COLUMN master_synced_revision INTEGER;
ALTER TABLE command_numbers ADD COLUMN master_sync_error TEXT NOT NULL DEFAULT '';
CREATE UNIQUE INDEX IF NOT EXISTS command_numbers_number_year ON command_numbers(year,number);
