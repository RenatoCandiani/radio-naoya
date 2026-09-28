-- ============================================================
-- CORREÇÃO DE SEGURANÇA: planos comerciais (27/09/2026)
-- Antes: qualquer visitante, mesmo sem login, criava plano comercial
-- em QUALQUER rádio, e ele aparecia na aba Comercial do site.
-- Depois: só o dono da rádio cria, edita ou apaga os planos dela.
-- Cole no SQL Editor do Supabase e clique em Run.
-- O DROP abaixo apaga só a REGRA furada, nenhum dado.
-- ============================================================

BEGIN;

-- 1. Remove a regra que deixava qualquer um criar
DROP POLICY IF EXISTS "Qualquer um cria plano comercial" ON planos_comerciais;

-- 2. Garante a regra do dono (recriada igual, caso não exista)
DROP POLICY IF EXISTS "Dono edita planos comerciais" ON planos_comerciais;
CREATE POLICY "Dono edita planos comerciais" ON planos_comerciais
  FOR ALL
  USING (radio_id IN (SELECT id FROM radios WHERE owner_id = auth.uid()))
  WITH CHECK (radio_id IN (SELECT id FROM radios WHERE owner_id = auth.uid()));

COMMIT;

-- 3. Conferência: tem que aparecer só 2 linhas,
--    "Dono edita planos comerciais" (ALL) e "Leitura pública" (SELECT)
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'planos_comerciais'
ORDER BY policyname;
