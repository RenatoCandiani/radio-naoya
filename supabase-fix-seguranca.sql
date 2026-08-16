-- ============================================================
-- CORREÇÃO DE SEGURANÇA — RODAR ANTES DE LANÇAR
-- ============================================================
-- Problema: a policy criada pra "destravar o webhook" liberou
-- UPDATE pra qualquer pessoa na tabela radios. Como a anon key
-- fica exposta no JavaScript do site, qualquer visitante podia:
--   1. Renomear / desfigurar qualquer rádio
--   2. Se dar plano premium de graça (furo de faturamento)
--
-- O webhook do Stripe NÃO depende dessa policy: ele usa a
-- service_role key, que ignora RLS por definição.
-- ============================================================

-- 1. Remove a policy perigosa (nome usado durante o desenvolvimento)
DROP POLICY IF EXISTS "Webhook atualiza plano" ON radios;

-- 2. Garante que a policy correta de dono existe.
--    Só o dono autenticado edita a própria rádio.
DROP POLICY IF EXISTS "Dono edita rádio" ON radios;
CREATE POLICY "Dono edita rádio" ON radios
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- 3. Impede que o dono altere o próprio plano por conta própria.
--    Plano só muda via webhook do Stripe (service_role).
--    Trigger bloqueia qualquer troca de plano que não venha do service_role.
CREATE OR REPLACE FUNCTION protege_plano()
RETURNS TRIGGER AS $$
DECLARE
  papel TEXT;
BEGIN
  -- Lê o papel do JWT da requisição. service_role = webhook do Stripe.
  papel := COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    current_setting('role', true)
  );

  IF papel = 'service_role' THEN
    RETURN NEW; -- webhook tem passe livre
  END IF;

  IF NEW.plano IS DISTINCT FROM OLD.plano THEN
    RAISE EXCEPTION 'O plano só pode ser alterado via pagamento.';
  END IF;

  IF NEW.stripe_subscription_id IS DISTINCT FROM OLD.stripe_subscription_id
     OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id THEN
    RAISE EXCEPTION 'Dados de assinatura são somente leitura.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protege_plano ON radios;
CREATE TRIGGER trg_protege_plano
  BEFORE UPDATE ON radios
  FOR EACH ROW EXECUTE FUNCTION protege_plano();

-- 4. Impede tomada de rádio já existente: o slug é único, mas o
--    owner_id só pode ser preenchido se ainda estiver vazio.
DROP POLICY IF EXISTS "Vincula dono na primeira vez" ON radios;
CREATE POLICY "Vincula dono na primeira vez" ON radios
  FOR UPDATE
  USING (owner_id IS NULL)
  WITH CHECK (auth.uid() = owner_id);

-- ============================================================
-- VERIFICAÇÃO: lista as policies ativas em radios
-- ============================================================
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'radios'
ORDER BY cmd, policyname;
