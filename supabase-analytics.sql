-- ============================================================
-- MIGRAÇÃO: Analytics básico (page views)
-- Cole no SQL Editor do Supabase e execute.
-- ============================================================

-- Adiciona coluna de views na tabela radios
ALTER TABLE radios ADD COLUMN IF NOT EXISTS views BIGINT DEFAULT 0;

-- Função pra incrementar views (chamada via RPC)
CREATE OR REPLACE FUNCTION increment_views(radio_slug TEXT)
RETURNS void AS $$
BEGIN
  UPDATE radios SET views = views + 1 WHERE slug = radio_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
