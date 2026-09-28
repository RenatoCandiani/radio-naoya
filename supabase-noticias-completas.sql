-- ============================================================
-- NOTÍCIAS COMPLETAS (28/09/2026)
-- Hoje a notícia morre na manchete. Isto acrescenta o texto da
-- matéria, o autor e a editoria, pra quem clica poder LER.
-- Só ADICIONA colunas novas com valor vazio: nenhuma notícia,
-- imagem ou dado existente é alterado ou apagado.
-- Cole no SQL Editor do Supabase e clique em Run.
-- ============================================================

ALTER TABLE noticias
  ADD COLUMN IF NOT EXISTS conteudo  TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS autor     TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS categoria TEXT DEFAULT '';

-- Conferência: deve listar as 10 colunas, com as 3 novas no fim
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'noticias'
ORDER BY ordinal_position;
