-- ============================================================
-- MIGRAÇÃO: Planos comerciais editáveis por rádio
-- Cole no SQL Editor do Supabase e execute.
-- ============================================================

CREATE TABLE IF NOT EXISTS planos_comerciais (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  radio_id UUID REFERENCES radios(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT DEFAULT '',
  preco TEXT NOT NULL,
  itens TEXT[] DEFAULT '{}',
  destaque BOOLEAN DEFAULT false,
  ordem SMALLINT DEFAULT 0
);

ALTER TABLE planos_comerciais ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública" ON planos_comerciais FOR SELECT USING (true);

CREATE POLICY "Dono edita planos comerciais" ON planos_comerciais
  FOR ALL USING (radio_id IN (SELECT id FROM radios WHERE owner_id = auth.uid()))
  WITH CHECK (radio_id IN (SELECT id FROM radios WHERE owner_id = auth.uid()));

-- Permite insert sem auth (pra onboarding)
CREATE POLICY "Qualquer um cria plano comercial" ON planos_comerciais
  FOR INSERT WITH CHECK (true);

-- Seed da Marajá
INSERT INTO planos_comerciais (radio_id, nome, descricao, preco, itens, destaque, ordem) VALUES
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Apoio Cultural', 'Sua marca no carrossel da sidebar', 'R$ 150/mês', '{"Emoji + nome + slogan no carrossel","Rotação automática com outros apoiadores","Visibilidade em todas as páginas","Link direto para seu site ou WhatsApp"}', false, 0),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Premium', 'Banner rotativo na página inicial', 'R$ 350/mês', '{"Banner 728x90 na home (desktop)","Imagem ou texto com cores personalizadas","Destaque máximo para sua marca","Rotação com outros anunciantes premium","Link com CTA personalizado"}', true, 1),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Spot no Ar', 'Inserção de áudio na programação', 'R$ 500/mês', '{"Spot de até 30 segundos","5 inserções por dia","Produção inclusa (locução profissional)","Horários variados para maior alcance","Relatório mensal de veiculações"}', false, 2);
