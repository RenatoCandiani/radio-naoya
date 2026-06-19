import { LOCUTORES as LOCUTORES_FALLBACK } from '../data/config';

export function TabLocutores({ locutores }) {
  const data = locutores && locutores.length > 0 ? locutores : LOCUTORES_FALLBACK;

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <h2>Nossos Locutores</h2>
        <span className="section-sub">A equipe que faz a rádio acontecer</span>
      </div>
      <div className="locutores-grid">
        {data.map((loc) => (
          <div key={loc.nome} className="locutor-card">
            {loc.foto ? (
              <img
                src={loc.foto}
                alt={loc.nome}
                className="locutor-foto"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : null}
            <div
              className="locutor-avatar"
              style={loc.foto ? { display: 'none' } : {}}
            >
              {loc.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="locutor-info">
              <h3 className="locutor-nome">{loc.nome}</h3>
              <span className="locutor-funcao">{loc.funcao}</span>
              <p className="locutor-desc">{loc.descricao}</p>
              <div className="locutor-programas">
                {loc.programas.map((prog) => (
                  <span key={prog} className="locutor-tag">{prog}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
