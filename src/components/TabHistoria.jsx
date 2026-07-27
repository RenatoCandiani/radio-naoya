export function TabHistoria({ radioData }) {
  const nome = radioData?.nome || '';
  const logo = radioData?.logo || '';
  const historia = radioData?.historia || '';

  if (!historia && !logo) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📻</div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#555' }}>História não configurada</h3>
        <p style={{ fontSize: '0.9rem' }}>Acesse o painel admin (⚙️) e preencha a história da sua rádio.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <h2>Nossa História</h2>
      </div>
      <div className="historia-box">
        {logo && (
          <img
            src={logo}
            alt={`Logo ${nome}`}
            className="historia-logo-img"
          />
        )}
        <div className="historia-texto">
          <h3>{nome}</h3>
          <p>{historia}</p>
        </div>
      </div>
    </div>
  );
}
