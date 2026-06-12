-- Finanzas AMD — schema
-- Ejecutar en: Supabase Dashboard → SQL Editor

CREATE TABLE months (
  user_id    UUID REFERENCES auth.users NOT NULL,
  key        TEXT NOT NULL,              -- e.g. "2026-05"
  data       JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, key)
);

ALTER TABLE months ENABLE ROW LEVEL SECURITY;

-- Cada usuario solo accede a sus propios meses
CREATE POLICY "own_months" ON months
  USING     (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
