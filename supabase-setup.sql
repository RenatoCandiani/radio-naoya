-- ============================================================
-- RADIO SAAS — Setup do Supabase
-- Cole este SQL inteiro no SQL Editor do Supabase e execute.
-- ============================================================

-- 1. Tabela principal das rádios
CREATE TABLE radios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  nome TEXT NOT NULL,
  frequencia TEXT,
  logo_url TEXT,
  whatsapp TEXT,
  historia TEXT,
  metadados_url TEXT,
  tema JSONB DEFAULT '{}',
  streams JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Programação
CREATE TABLE programacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  radio_id UUID REFERENCES radios(id) ON DELETE CASCADE NOT NULL,
  dia_semana SMALLINT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  horario TEXT NOT NULL,
  programa TEXT NOT NULL,
  locutor TEXT DEFAULT '',
  ordem SMALLINT DEFAULT 0
);

-- 3. Locutores
CREATE TABLE locutores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  radio_id UUID REFERENCES radios(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  funcao TEXT DEFAULT '',
  programas TEXT[] DEFAULT '{}',
  descricao TEXT DEFAULT '',
  foto_url TEXT
);

-- 4. Notícias
CREATE TABLE noticias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  radio_id UUID REFERENCES radios(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  resumo TEXT DEFAULT '',
  img_url TEXT,
  destaque BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Patrocinadores
CREATE TABLE patrocinadores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  radio_id UUID REFERENCES radios(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  slogan TEXT DEFAULT '',
  cor TEXT DEFAULT '#1565C0',
  href TEXT DEFAULT '#',
  emoji TEXT DEFAULT '⭐',
  ordem SMALLINT DEFAULT 0
);

-- 6. Banners premium
CREATE TABLE banners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  radio_id UUID REFERENCES radios(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  subtitulo TEXT DEFAULT '',
  cta TEXT DEFAULT '',
  href TEXT DEFAULT '#',
  cor TEXT DEFAULT '#1565C0',
  cor_texto TEXT DEFAULT '#ffffff',
  tag TEXT DEFAULT '',
  imagem_url TEXT,
  ordem SMALLINT DEFAULT 0
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE radios ENABLE ROW LEVEL SECURITY;
ALTER TABLE programacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE locutores ENABLE ROW LEVEL SECURITY;
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE patrocinadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Leitura pública (qualquer um vê os dados das rádios)
CREATE POLICY "Leitura pública" ON radios FOR SELECT USING (true);
CREATE POLICY "Leitura pública" ON programacao FOR SELECT USING (true);
CREATE POLICY "Leitura pública" ON locutores FOR SELECT USING (true);
CREATE POLICY "Leitura pública" ON noticias FOR SELECT USING (true);
CREATE POLICY "Leitura pública" ON patrocinadores FOR SELECT USING (true);
CREATE POLICY "Leitura pública" ON banners FOR SELECT USING (true);

-- Escrita apenas pelo dono da rádio
CREATE POLICY "Dono edita rádio" ON radios
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Dono edita programação" ON programacao
  FOR ALL USING (radio_id IN (SELECT id FROM radios WHERE owner_id = auth.uid()))
  WITH CHECK (radio_id IN (SELECT id FROM radios WHERE owner_id = auth.uid()));

CREATE POLICY "Dono edita locutores" ON locutores
  FOR ALL USING (radio_id IN (SELECT id FROM radios WHERE owner_id = auth.uid()))
  WITH CHECK (radio_id IN (SELECT id FROM radios WHERE owner_id = auth.uid()));

CREATE POLICY "Dono edita notícias" ON noticias
  FOR ALL USING (radio_id IN (SELECT id FROM radios WHERE owner_id = auth.uid()))
  WITH CHECK (radio_id IN (SELECT id FROM radios WHERE owner_id = auth.uid()));

CREATE POLICY "Dono edita patrocinadores" ON patrocinadores
  FOR ALL USING (radio_id IN (SELECT id FROM radios WHERE owner_id = auth.uid()))
  WITH CHECK (radio_id IN (SELECT id FROM radios WHERE owner_id = auth.uid()));

CREATE POLICY "Dono edita banners" ON banners
  FOR ALL USING (radio_id IN (SELECT id FROM radios WHERE owner_id = auth.uid()))
  WITH CHECK (radio_id IN (SELECT id FROM radios WHERE owner_id = auth.uid()));

-- ============================================================
-- STORAGE — Bucket para mídia (logos, fotos)
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true);

-- Qualquer um pode ver arquivos
CREATE POLICY "Leitura pública de mídia" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- Apenas usuários logados podem fazer upload
CREATE POLICY "Upload por usuários autenticados" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- Usuários podem deletar seus próprios arquivos
CREATE POLICY "Delete próprios arquivos" ON storage.objects
  FOR DELETE USING (bucket_id = 'media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
-- SEED — Dados da Rádio Marajá (piloto)
-- ============================================================

-- Primeiro cria a rádio (owner_id será vinculado depois do primeiro login)
INSERT INTO radios (slug, nome, frequencia, logo_url, whatsapp, historia, metadados_url, tema, streams)
VALUES (
  'maraja',
  'RÁDIO MARAJÁ',
  'AM 660',
  '/maraja.png',
  '555599483537',
  'A Rádio Marajá AM 660 é a voz de Rosário do Sul, no Rio Grande do Sul. Com décadas de tradição, a emissora é referência em música nativista, informação regional e o cotidiano do povo gaúcho. Presente no dial e na internet, a Marajá leva cultura, entretenimento e jornalismo para toda a região da Fronteira Oeste e para gaúchos espalhados pelo Brasil e pelo mundo.',
  'https://d36nr0u3xmc4mm.cloudfront.net/index.php/api/streaming/status/8028/2289e09259872445da425618a38b239c/SV13BR',
  '{"corPrimaria": "#1565C0", "corSecundaria": "#0D47A1", "corFundo": "#F0F4F8", "corCards": "#ffffff", "corTexto": "#333333"}',
  '[{"label": "Rádio Marajá AM 660 (Ao Vivo)", "url": "/stream"}, {"label": "Rádio Marajá (Direto)", "url": "http://servidor28-1.brlogic.com:8028/live?source=website"}]'
);