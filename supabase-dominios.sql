-- ============================================================
-- MIGRAÇÃO: Tabela de domínios customizados
-- Cole no SQL Editor do Supabase e execute.
-- ============================================================

CREATE TABLE IF NOT EXISTS dominios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  radio_id UUID REFERENCES radios(id) ON DELETE CASCADE NOT NULL,
  dominio TEXT UNIQUE NOT NULL,
  verificado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE dominios ENABLE ROW LEVEL SECURITY;

-- Leitura pública (necessário pra resolver domínio → rádio)
CREATE POLICY "Leitura pública" ON dominios FOR SELECT USING (true);

-- Escrita pelo dono da rádio
CREATE POLICY "Dono gerencia domínios" ON dominios
  FOR ALL USING (radio_id IN (SELECT id FROM radios WHERE owner_id = auth.uid()))
  WITH CHECK (radio_id IN (SELECT id FROM radios WHERE owner_id = auth.uid()));
