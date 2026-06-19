export function TabComercial() {
  const whatsappLink = 'https://wa.me/555599021126?text=Olá, quero anunciar na Rádio Marajá!';

  const planos = [
    {
      nome: 'Apoio Cultural',
      preco: 'R$ 150',
      periodo: '/mês',
      descricao: 'Sua marca no carrossel da sidebar',
      itens: [
        'Emoji + nome + slogan no carrossel',
        'Rotação automática com outros apoiadores',
        'Visibilidade em todas as páginas',
        'Link direto para seu site ou WhatsApp',
      ],
      destaque: false,
    },
    {
      nome: 'Premium',
      preco: 'R$ 350',
      periodo: '/mês',
      descricao: 'Banner rotativo na página inicial',
      itens: [
        'Banner 728x90 na home (desktop)',
        'Imagem ou texto com cores personalizadas',
        'Destaque máximo para sua marca',
        'Rotação com outros anunciantes premium',
        'Link com CTA personalizado',
      ],
      destaque: true,
    },
    {
      nome: 'Spot no Ar',
      preco: 'R$ 500',
      periodo: '/mês',
      descricao: 'Inserção de áudio na programação',
      itens: [
        'Spot de até 30 segundos',
        '5 inserções por dia',
        'Produção inclusa (locução profissional)',
        'Horários variados para maior alcance',
        'Relatório mensal de veiculações',
      ],
      destaque: false,
    },
  ];

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <h2>Anuncie na Marajá</h2>
        <span className="section-sub">Alcance milhares de ouvintes na Fronteira Oeste</span>
      </div>

      <div className="comercial-grid">
        {planos.map((plano) => (
          <div key={plano.nome} className={`comercial-card${plano.destaque ? ' comercial-card--destaque' : ''}`}>
            {plano.destaque && <span className="comercial-badge">⭐ RECOMENDADO</span>}
            <h3 className="comercial-nome">{plano.nome}</h3>
            <p className="comercial-desc">{plano.descricao}</p>
            <div className="comercial-preco">
              <strong>{plano.preco}</strong>
              <span>{plano.periodo}</span>
            </div>
            <ul className="comercial-itens">
              {plano.itens.map((item) => (
                <li key={item}>✓ {item}</li>
              ))}
            </ul>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="comercial-cta"
            >
              📱 Quero Anunciar
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
