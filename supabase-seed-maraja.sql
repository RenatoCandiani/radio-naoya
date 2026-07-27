-- ============================================================
-- SEED: Popular dados da Rádio Marajá nas tabelas relacionadas
-- ============================================================

-- ID da rádio Marajá
-- 8c3472dc-3965-4ed7-b9fb-682d6092e040

-- LOCUTORES
INSERT INTO locutores (radio_id, nome, funcao, programas, descricao, foto_url) VALUES
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Inajara Machado', 'Locutora / Apresentadora', '{}', 'Inajara faz parte da equipe da Marajá trazendo conteúdo e informação para os ouvintes.', '/inajaraMachado.jpg'),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Jacy Ferreira', 'Locutora / Apresentadora', '{"Revista do Rádio"}', 'Jacy traz variedades, entrevistas e entretenimento nas manhãs da Marajá.', '/jacyFerreira.jpg'),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Joel de Freitas Paulo', 'Locutor / Apresentador', '{"Chimarreando no Galpão","Chasques e Cantigas","Pelos Domingos"}', 'Voz marcante da manhã gaúcha, Joel acompanha os ouvintes desde a madrugada.', '/joelDeFreitasPaulo.jpg'),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'José Benedito da Silva', 'Locutor / Jornalista', '{"Rádio Jornal da Manhã","Mensageiro Regional"}', 'Referência no jornalismo regional da Fronteira Oeste há décadas.', '/joseBeneditoDaSilva.jpg'),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Jovani Pazinato', 'Locutor / Apresentador', '{"Conectados","Sábado Especial"}', 'Jovani conecta os ouvintes com música e interatividade nas tardes.', '/joaviniPazinato.jpg'),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Lia Ferreira', 'Locutora / Apresentadora', '{"Studio 660"}', 'Lia comanda o Studio 660 aos sábados à tarde.', '/liaFerreira.jpg'),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Moacir Guazina', 'Locutor / Jornalista', '{"Notícias na Manhã","Rádio Jornal do Meio Dia"}', 'Moacir mantém os ouvintes informados sobre Rosário do Sul e região.', '/moacirGuazina.jpg'),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Cristian Sampaio Dornelles', 'Locutor / Apresentador', '{"Querência Céu e Campo"}', 'Cristian comanda o Querência Céu e Campo aos domingos.', NULL),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Orisis Santos', 'Locutor / Apresentador', '{"Amanhecer no Rio Grande"}', 'Orisis abre a programação dos sábados com o Amanhecer no Rio Grande.', '/osirisSantos.png');

-- NOTÍCIAS
INSERT INTO noticias (radio_id, titulo, resumo, img_url, destaque) VALUES
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Polícia Civil efetua prisão em flagrante por receptação em Rosário do Sul', 'Ação policial resultou na apreensão de produtos contrabandeados na região da Fronteira Oeste.', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=900&auto=format', true),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'PRF prende contrabandista após fuga em Santiago', 'Veículo com mercadorias ilegais foi abordado na BR-287 após perseguição.', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=400&auto=format', false),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Festival Nativista reúne artistas gaúchos no fim de semana', 'Evento celebra a cultura e a música gaúcha com atrações regionais.', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=400&auto=format', false),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Rodeio em Rosário do Sul promete grande público', 'Tradicional evento do calendário regional está com ingressos à venda.', 'https://images.unsplash.com/photo-1517022812141-23620dba5c23?q=80&w=400&auto=format', false);

-- PATROCINADORES
INSERT INTO patrocinadores (radio_id, nome, slogan, cor, href, emoji, ordem) VALUES
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Supermercado Fronteira', 'Os melhores preços de Rosário', '#E65100', '#', '🛒', 0),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Veterinária São Jorge', 'Saúde animal em primeiro lugar', '#00695C', '#', '🐴', 1),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Imobiliária Rosário Sul', 'Seu lar na Fronteira Oeste', '#4A148C', '#', '🏠', 2),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Churrascaria Galpão Crioulo', 'O melhor churrasco gaúcho', '#3E2723', '#', '🥩', 3),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Auto Peças Rincão', 'Peças e acessórios para seu veículo', '#263238', '#', '🔧', 4),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Farmácia Saúde & Vida', 'Cuidando da sua família', '#1B5E20', '#', '💊', 5),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Escritório Contábil Fronteira', 'Contabilidade de confiança', '#1A237E', '#', '📊', 6);

-- PROGRAMAÇÃO (Segunda como exemplo - dia 1)
INSERT INTO programacao (radio_id, dia_semana, horario, programa, locutor, ordem) VALUES
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 1, '00:00 – 05:15', '⛔ Fora do Ar — Retorna às 05:15', '', 0),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 1, '05:15 – 07:05', 'Chimarreando no Galpão', 'Joel de Freitas Paulo', 1),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 1, '07:15 – 08:00', 'Rádio Jornal da Manhã', 'José Benedito da Silva', 2),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 1, '08:10 – 10:00', 'Revista do Rádio', 'Jacy Ferreira', 3),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 1, '10:00 – 12:00', 'Notícias na Manhã', 'Moacir Guazina', 4),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 1, '12:00 – 12:50', 'Rádio Jornal do Meio Dia', 'Moacir Guazina', 5),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 1, '13:00 – 15:00', 'Chasques e Cantigas', 'Joel de Freitas Paulo', 6),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 1, '15:00 – 17:00', 'Conectados', 'Jovani Pazinato', 7),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 1, '17:00 – 19:00', 'Mensageiro Regional', 'José Benedito da Silva', 8),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 1, '19:00 – 20:00', 'A Voz do Brasil', '', 9),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 1, '20:10 – 22:30', 'Sessão da Câmara de Vereadores', '', 10),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 1, '22:30 – 23:59', 'Love Night', '', 11),
-- Domingo (dia 0)
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 0, '00:00 – 06:00', '⛔ Fora do Ar — Retorna às 06:00', '', 0),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 0, '06:00 – 09:00', 'Pelos Domingos 1° Aparte', 'Joel de Freitas Paulo', 1),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 0, '09:00 – 10:00', 'Programação Religiosa', '', 2),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 0, '10:00 – 12:00', 'Pelos Domingos 2° Aparte', 'Joel de Freitas Paulo', 3),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 0, '13:00 – 15:30', 'Querência Céu e Campo', 'Cristian Sampaio Dornelles', 4),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 0, '21:00 – 22:00', 'Gauchesco e Brasileiro', '', 5),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 0, '22:00 – 23:59', 'Love Night', '', 6),
-- Sábado (dia 6)
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 6, '00:00 – 05:30', '⛔ Fora do Ar — Retorna às 05:30', '', 0),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 6, '05:30 – 07:00', 'Amanhecer no Rio Grande', 'Orisis Santos', 1),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 6, '07:00 – 07:15', 'Prosa Rural', '', 2),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 6, '07:15 – 08:00', 'Rádio Jornal da Manhã', 'José Benedito da Silva', 3),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 6, '08:10 – 10:00', 'Revista do Rádio', 'Jacy Ferreira', 4),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 6, '10:00 – 12:00', 'Sábado Especial', 'Jovani Pazinato', 5),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 6, '12:00 – 12:50', 'Rádio Jornal do Meio Dia', 'Moacir Guazina', 6),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 6, '15:00 – 17:00', 'Studio 660', 'Lia Ferreira', 7),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 6, '17:00 – 19:00', 'Mensageiro Regional', 'José Benedito da Silva', 8);

-- BANNERS
INSERT INTO banners (radio_id, titulo, subtitulo, cta, href, cor, cor_texto, tag, imagem_url, ordem) VALUES
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Rede Fronteira de Comunicação', '', '', '#', '#e8e8e8', '#333', '', '/redeFronteira.png', 0),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Agropecuária Querência', 'Tudo para o campo gaúcho — sementes, insumos e implementos', 'Fale conosco', '#', '#2E7D32', '#fff', 'PUBLICIDADE', NULL, 1),
('8c3472dc-3965-4ed7-b9fb-682d6092e040', 'Posto Pampa Combustíveis', 'Abastecimento 24h na BR-290 — Diesel, Gasolina e GNV', 'Visite-nos', '#', '#B71C1C', '#fff', 'PUBLICIDADE', NULL, 2);
