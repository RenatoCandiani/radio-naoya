-- ============================================================
-- POLICY DE INSERT DA TABELA radios — registro do que já existe
-- ============================================================
-- Este arquivo NÃO muda nada. Ele existe porque a policy abaixo foi
-- criada à mão no painel do Supabase e não estava em nenhum .sql do
-- projeto. Quem recriasse o banco a partir dos arquivos teria o
-- cadastro quebrado sem nenhuma pista do motivo.
--
-- Levantado em 04/10/2026, com SELECT em pg_policies. Estado real da
-- tabela radios naquele dia, quatro policies:
--
--   Qualquer um cria rádio        INSERT   with_check = true
--   Leitura pública               SELECT   qual = true
--   Dono edita rádio              UPDATE   auth.uid() = owner_id
--   Vincula dono na primeira vez  UPDATE   (ver supabase-fix-vinculo-dono.sql)
--
-- As três últimas já estão versionadas em supabase-setup.sql e
-- supabase-fix-seguranca.sql. Só a de INSERT faltava.
-- ============================================================
-- POR QUE ELA É "true", E POR QUE ISSO NÃO É O DESASTRE QUE PARECE
--
-- Ela precisa aceitar INSERT de visitante não logado porque o
-- cadastro da landing cria a rádio ANTES de existir sessão: com
-- confirmação de e-mail ligada, supabase.auth.signUp() não devolve
-- sessão, então o insert sai com o papel 'anon'.
--
-- O que impede o abuso grave não é esta policy, é o gatilho
-- protege_cadastro() (supabase-fix-cadastro.sql), BEFORE INSERT, que
-- para 'anon' e 'authenticated' força:
--     plano := 'free'
--     stripe_customer_id := NULL
--     stripe_subscription_id := NULL
--     views := 0
--     owner_id := NULL        (quando é 'anon')
-- Ou seja: não dá pra nascer premium sem pagar, nem nascer com dono
-- escolhido. E as tabelas de conteúdo (programacao, locutores,
-- noticias, patrocinadores, banners, planos_comerciais, dominios)
-- exigem ser dono da rádio pra escrever, então linha criada por
-- estranho fica vazia e ninguém consegue publicar nada nela.
--
-- O que AINDA é possível, e fica registrado como dívida:
--   1. criar linhas de rádio vazias em massa (lixo no banco e
--      páginas públicas vazias em /?radio=<slug>);
--   2. tomar slugs bons, já que slug é único e imutável.
--
-- CONSERTO DE VERDADE, pra quando o cadastro começar a ser divulgado:
-- mover a criação da rádio pra um endpoint em /api usando a
-- service_role key (que ignora RLS), com limite de tentativas por IP,
-- e então REMOVER esta policy — nenhum navegador precisaria mais
-- inserir direto. Enquanto o cadastro não está divulgado, o risco é
-- teórico: ninguém sabe que o endereço existe.
-- ============================================================

-- Idempotente: recria a policy exatamente como ela está hoje.
DROP POLICY IF EXISTS "Qualquer um cria rádio" ON radios;
CREATE POLICY "Qualquer um cria rádio" ON radios
  FOR INSERT
  WITH CHECK (true);

-- ============================================================
-- VERIFICAÇÃO — tem que voltar as 4 policies descritas no topo
-- ============================================================
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'radios'
ORDER BY cmd, policyname;

-- E os 2 gatilhos que fazem o trabalho pesado:
--   trg_protege_cadastro (BEFORE INSERT) e trg_protege_plano (BEFORE UPDATE)
SELECT tgname AS gatilho
FROM pg_trigger
WHERE tgrelid = 'public.radios'::regclass AND NOT tgisinternal
ORDER BY tgname;
