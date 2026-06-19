-- ============================================================
-- MIGRAÇÃO: Adicionar campo de plano nas rádios
-- Cole no SQL Editor do Supabase e execute.
-- ============================================================

-- Adiciona coluna plano (free, basic, premium)
ALTER TABLE radios ADD COLUMN IF NOT EXISTS plano TEXT DEFAULT 'free';

-- Garante que o valor é válido
ALTER TABLE radios ADD CONSTRAINT radios_plano_check 
  CHECK (plano IN ('free', 'basic', 'premium'));

-- Atualiza a Marajá pra premium (ela é a piloto)
UPDATE radios SET plano = 'premium' WHERE slug = 'maraja';
