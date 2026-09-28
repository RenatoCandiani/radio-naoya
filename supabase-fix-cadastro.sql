-- ============================================================
-- CORREÇÃO DE SEGURANÇA: cadastro de rádio (27/09/2026)
-- Antes: quem soubesse programar criava rádio já no plano premium,
-- sem pagar (a trava de plano só valia pra EDIÇÃO, não pra criação).
-- Depois: rádio criada pelo site nasce SEMPRE no plano grátis e sem
-- dados de pagamento. Plano pago continua vindo só do Stripe.
-- O cadastro de cliente de verdade não muda: ele já entra no grátis.
-- Cole no SQL Editor do Supabase e clique em Run.
-- O DROP abaixo só remove uma versão antiga deste mesmo gatilho, se houver.
-- ============================================================

-- Roda com o papel de quem está criando (SEM security definer), então
-- current_user diz a verdade: 'anon' (visitante), 'authenticated'
-- (logado), 'service_role' (Stripe/scripts) ou 'postgres' (SQL Editor).
CREATE OR REPLACE FUNCTION protege_cadastro()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated') THEN
    NEW.plano := 'free';
    NEW.stripe_customer_id := NULL;
    NEW.stripe_subscription_id := NULL;
    NEW.views := 0;
    -- Visitante não escolhe dono; logado só pode ser dono de si mesmo
    IF current_user = 'anon' THEN
      NEW.owner_id := NULL;
    ELSE
      NEW.owner_id := auth.uid();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protege_cadastro ON radios;
CREATE TRIGGER trg_protege_cadastro
  BEFORE INSERT ON radios
  FOR EACH ROW EXECUTE FUNCTION protege_cadastro();

-- Conferência: tem que aparecer 2 linhas,
-- trg_protege_cadastro (novo) e trg_protege_plano (o de antes)
SELECT tgname AS gatilho
FROM pg_trigger
WHERE tgrelid = 'public.radios'::regclass AND NOT tgisinternal
ORDER BY tgname;
