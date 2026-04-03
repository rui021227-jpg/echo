-- Anonymous device identities (no auth, no PII — just a stable UUID per device)
CREATE TABLE IF NOT EXISTS device_identities (
  device_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cloud backup of mood entries
CREATE TABLE IF NOT EXISTS synced_entries (
  id BIGSERIAL PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES device_identities(device_id) ON DELETE CASCADE,
  date DATE NOT NULL,
  emoji_score SMALLINT NOT NULL CHECK (emoji_score BETWEEN 1 AND 5),
  word TEXT NOT NULL CHECK (char_length(word) <= 20),
  breath_taken BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(device_id, date)
);

-- Cloud backup of AI reflections
CREATE TABLE IF NOT EXISTS synced_reflections (
  id BIGSERIAL PRIMARY KEY,
  device_id UUID NOT NULL REFERENCES device_identities(device_id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  s1 TEXT NOT NULL,
  s2 TEXT NOT NULL,
  s3 TEXT NOT NULL,
  avatar_key TEXT NOT NULL,
  is_crisis BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(device_id, week_start)
);

-- Row-level security: each device can only see its own data
ALTER TABLE synced_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE synced_reflections ENABLE ROW LEVEL SECURITY;

-- The cloud-sync edge function uses the service role key and handles
-- device ownership validation at the application layer, so these policies
-- guard against any accidental direct API access.
CREATE POLICY "Device owns its entries"
  ON synced_entries FOR ALL
  USING (device_id::text = current_setting('app.device_id', true));

CREATE POLICY "Device owns its reflections"
  ON synced_reflections FOR ALL
  USING (device_id::text = current_setting('app.device_id', true));

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_synced_entries_device_date
  ON synced_entries(device_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_synced_reflections_device_week
  ON synced_reflections(device_id, week_start DESC);
