-- ================================================================
-- LICORERÍA SALVATORE — Tabla de categorías
-- Pegar en: Supabase → SQL Editor → New query → Run
-- ================================================================

CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categorías iniciales
INSERT INTO categories (name) VALUES
  ('Pisco'), ('Whisky'), ('Vodka'), ('Ron'), ('Gin'),
  ('Tequila'), ('Champagne'), ('Cognac'), ('Licor'), ('Vino')
ON CONFLICT (name) DO NOTHING;

-- RLS: lectura pública, escritura solo desde servidor
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON categories
  FOR SELECT TO anon USING (true);
