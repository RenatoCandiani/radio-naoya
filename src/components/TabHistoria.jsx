import { RADIO_CONFIG as FALLBACK_CONFIG } from '../data/config';

export function TabHistoria({ radioData }) {
  const config = radioData || FALLBACK_CONFIG;
  const nome = config.nome || FALLBACK_CONFIG.nome;
  const logo = config.logo || FALLBACK_CONFIG.logo;
  const historia = config.historia || FALLBACK_CONFIG.historia;

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <h2>Nossa História</h2>
      </div>
      <div className="historia-box">
        <img
          src={logo}
          alt={`Logo ${nome}`}
          className="historia-logo-img"
        />
        <div className="historia-texto">
          <h3>{nome}</h3>
          <p>{historia}</p>
          <div className="historia-stats">
            <div className="stat">
              <strong>40+</strong>
              <span>Anos no Ar</span>
            </div>
            <div className="stat">
              <strong>500k</strong>
              <span>Ouvintes/Mês</span>
            </div>
            <div className="stat">
              <strong>19h</strong>
              <span>Programação</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rede Fronteira de Comunicação */}
      <div className="rede-fronteira-box">
        <img
          src="/redeFronteiraDeComuncacao.jpg"
          alt="Rede Fronteira de Comunicação"
          className="rede-fronteira-img"
        />
        <div className="rede-fronteira-texto">
          <h4>Integrante da Rede Fronteira de Comunicação</h4>
          <p>A {nome} faz parte da Rede Fronteira de Comunicação, levando informação e cultura para toda a região da Fronteira Oeste do RS.</p>
        </div>
      </div>
    </div>
  );
}
