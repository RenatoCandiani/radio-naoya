export function TabContatos({ whatsappHref, whatsapp }) {
  if (!whatsapp) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📞</div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#555' }}>Contatos não configurados</h3>
        <p style={{ fontSize: '0.9rem' }}>Acesse o painel admin (⚙️) e configure o WhatsApp e dados de contato.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <h2>Fale Conosco</h2>
      </div>
      <div className="contatos-box">
        <p className="contatos-intro">
          Entre em contato pelo WhatsApp!
        </p>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-block',
              background: '#25D366',
              color: '#fff',
              padding: '14px 32px',
              borderRadius: '30px',
              fontWeight: 700,
              fontSize: '1.05rem',
              textDecoration: 'none',
            }}
          >
            📱 Falar no WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
