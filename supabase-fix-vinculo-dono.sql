-- ============================================================
-- CORREÇÃO DE SEGURANÇA: vínculo de dono da rádio
-- Cole no SQL Editor do Supabase e clique em Run.
--
-- >>> RODE ESTE SQL *ANTES* DE PUBLICAR O CÓDIGO NOVO. <<<
-- O cadastro da landing passa a mandar a coluna
-- pending_owner_email_hash no INSERT. Se o código subir antes da
-- coluna existir, o PostgREST recusa o INSERT e o cadastro quebra
-- pra todo mundo. Na ordem certa (SQL primeiro) o pior caso é uma
-- rádio criada no intervalo ficar com o hash vazio: ela não se
-- vincula sozinha e se destrava com o UPDATE de socorro do item 4.
-- ============================================================
-- O PROBLEMA
-- Rádio criada pela landing nasce SEM dono (LandingPage.jsx: o
-- insert não manda owner_id, e o gatilho protege_cadastro() força
-- owner_id := NULL quando quem insere é 'anon' — é o caso, porque
-- o signUp não devolve sessão enquanto o e-mail não é confirmado).
-- O vínculo só acontece no primeiro login no painel
-- (Admin.jsx, loadRadioData: update({ owner_id: user.id })).
-- E a policy que permite esse update só exige owner_id IS NULL
-- (supabase-fix-seguranca.sql: "Vincula dono na primeira vez").
--
-- Resultado: entre o cadastro e o primeiro login do dono, QUALQUER
-- pessoa logada que abra /?radio=<slug> e clique em Painel vira
-- dona permanente da rádio.
--
-- O CONSERTO
-- O cadastro passa a gravar, na própria linha da rádio, uma marca
-- de quem a criou. A policy deixa de aceitar "qualquer um, desde
-- que não tenha dono" e passa a exigir "só quem está logado com o
-- e-mail usado no cadastro".
--
-- As rádios de hoje já têm dono, então não há dado a consertar:
-- isto fecha o furo pros cadastros futuros.
-- ============================================================
-- POR QUE HASH E NÃO O E-MAIL EM TEXTO  (ler antes de "simplificar")
-- A tabela radios tem leitura pública:
--   supabase-setup.sql:96
--   CREATE POLICY "Leitura pública" ON radios FOR SELECT USING (true)
-- Ou seja: toda coluna desta tabela é legível por qualquer
-- visitante da internet, com ou sem login — e o próprio site já
-- baixa a linha inteira com select('*'). Guardar aqui o e-mail do
-- cliente em texto é publicar o e-mail do cliente.
-- Restringir a lista de colunas no JavaScript não protegeria nada:
-- a anon key vai no bundle, qualquer pessoa monta a própria
-- consulta.
--
-- Por isso vai o SHA-256 do e-mail normalizado (lower + trim), em
-- hexadecimal. O que o hash público permite: confirmar um palpite
-- (quem já suspeita do e-mail consegue verificar). O que ele NÃO
-- permite: virar dono — a policy exige estar autenticado com
-- aquele e-mail; o hash é verificador, não credencial. E ele é
-- apagado no mesmo UPDATE que grava o dono (Admin.jsx), então a
-- exposição dura do cadastro até o primeiro login.
-- ============================================================

-- 1. A coluna. Guarda SHA-256 em hex, nunca e-mail em texto.
ALTER TABLE radios ADD COLUMN IF NOT EXISTS pending_owner_email_hash TEXT;

COMMENT ON COLUMN radios.pending_owner_email_hash IS
  'SHA-256 (hex minusculo) do e-mail usado no cadastro, normalizado com lower(trim()). '
  'Serve so pra o primeiro vinculo de dono e e apagado quando o vinculo acontece. '
  'NUNCA guardar e-mail em texto aqui: esta tabela tem SELECT publico.';

-- 2. A policy do vínculo. Troca só esta; as outras ficam como estão.
--    sha256() é nativa do Postgres 11+ (não precisa de pgcrypto).
--    JWT sem e-mail dá NULL, e NULL não casa com nada: não vincula.
--    Hash NULL (rádio antiga, ou navegador sem crypto.subtle) também
--    não vincula — de propósito, é o lado seguro. Use o socorro do
--    item 4 pra destravar essas.
DROP POLICY IF EXISTS "Vincula dono na primeira vez" ON radios;
CREATE POLICY "Vincula dono na primeira vez" ON radios
  FOR UPDATE
  USING (
    owner_id IS NULL
    AND pending_owner_email_hash IS NOT NULL
    AND pending_owner_email_hash =
        encode(sha256(convert_to(lower(trim(auth.jwt() ->> 'email')), 'UTF8')), 'hex')
  )
  WITH CHECK (auth.uid() = owner_id);

-- 3. (opcional) Quem já é dono não precisa mais da marca. Limpa o
--    resto que por acaso tenha sobrado numa rádio já vinculada.
-- UPDATE radios SET pending_owner_email_hash = NULL WHERE owner_id IS NOT NULL;

-- 4. SOCORRO — destrava uma rádio que ficou sem hash (criada no
--    intervalo entre este SQL e o deploy, ou sem crypto.subtle).
--    Troque o e-mail e o slug, descomente e rode só a linha.
-- UPDATE radios
--    SET pending_owner_email_hash =
--        encode(sha256(convert_to(lower(trim('cliente@exemplo.com')), 'UTF8')), 'hex')
--  WHERE slug = 'slug-da-radio' AND owner_id IS NULL;

-- ============================================================
-- VERIFICAÇÃO
-- ============================================================

-- 5a. As policies ativas em radios. "Vincula dono na primeira vez"
--     tem que aparecer com o qual citando pending_owner_email_hash.
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'radios'
ORDER BY cmd, policyname;

-- 5b. A coluna existe?  Tem que voltar 1 linha: text, nullable YES.
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'radios' AND column_name = 'pending_owner_email_hash';

-- 5c. Contrato entre o SQL e o JavaScript. O resultado tem que ser
--     IGUAL ao hash que src/lib/donoPendente.js produz pro mesmo
--     e-mail. Se os dois lados divergirem, ninguém mais vincula e
--     nenhum erro aparece — é a falha mais silenciosa daqui.
SELECT encode(sha256(convert_to(lower(trim('cliente@exemplo.com')), 'UTF8')), 'hex')
       AS hash_esperado;
