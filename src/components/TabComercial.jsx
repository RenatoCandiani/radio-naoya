export function TabComercial({ whatsapp, nome, planosComerciais }) {
  if (!planosComerciais || planosComerciais.length === 0) {
    if (!whatsapp) {
      return (
        <div className="animate-fade-in" style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💼</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#555' }}>Página comercial</h3>
          <p style={{ fontSize: '0.9rem' }}>Configure os planos comerciais e o WhatsApp no admin.</p>
        </div>
      );
    }
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💼</div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#555' }}>Planos comerciais não configurados</h3>
        <p style={{ fontSize: '0.9rem' }}>Acesse o admin (⚙️) → aba Comercial para criar seus planos de publicidade.</p>
      </div>
    );
  }

  const whatsappLink = whatsapp
    ? `https://wa.me/${whatsapp}?text=Olá, quero anunciar na ${nome || 'rádio'}!`
    : '#';

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <h2>Anuncie na {nome || 'Rádio'}</h2>
        <span className="section-sub">Alcance milhares de ouvintes</span>
      </div>

      <div className="comercial-grid">
        {planosComerciais.map((plano, idx) => (
          <div key={idx} className={`comercial-card${plano.destaque ? ' comercial-card--destaque' : ''}`}>
            {plano.destaque && <span className="comercial-badge">⭐ RECOMENDADO</span>}
            <h3 className="comercial-nome">{plano.nome}</h3>
            <p className="comercial-desc">{plano.descricao}</p>
            <div className="comercial-preco">
              <strong>{plano.preco}</strong>
            </div>
            <ul className="comercial-itens">
              {(plano.itens || []).map((item, i) => (
                <li key={i}>✓ {item}</li>
              ))}
            </ul>
            {whatsapp && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="comercial-cta"
              >
                📱 Quero Anunciar
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
