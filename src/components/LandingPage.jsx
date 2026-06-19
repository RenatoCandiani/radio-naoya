import { PLANOS } from '../lib/planos';

const FEATURES_LISTA = [
  { feature: 'Site completo com player', free: true, basic: true, premium: true },
  { feature: 'Programação e locutores', free: true, basic: true, premium: true },
  { feature: 'Notícias ilimitadas', free: true, basic: true, premium: true },
  { feature: 'Sem marca d\'água', free: false, basic: true, premium: true },
  { feature: 'Cores e fontes customizáveis', free: false, basic: true, premium: true },
  { feature: 'Upload de imagens', free: false, basic: true, premium: true },
  { feature: 'Domínio próprio', free: false, basic: true, premium: true },
  { feature: 'Banners de monetização', free: false, basic: false, premium: true },
  { feature: 'Suporte prioritário', free: false, basic: false, premium: true },
];

export function LandingPage() {
  return (
    <div className="landing">
      {/* Hero */}
      <header className="landing-hero">
        <div className="landing-hero-content">
          <h1>📻 RadioSaaS</h1>
          <p className="landing-subtitle">
            Sites modernos e bonitos para rádios.<br />
            Sem precisar de desenvolvedor.
          </p>
          <p className="landing-desc">
            Sua rádio merece um site profissional. Configure cores, programação, locutores e notícias em minutos. Pronto pra transmitir.
          </p>
          <div className="landing-ctas">
            <a href="#planos" className="landing-btn-primario">Ver planos</a>
            <a href="?radio=maraja" className="landing-btn-secundario">Ver demo ao vivo →</a>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="landing-section">
        <h2>Tudo que sua rádio precisa</h2>
        <div className="landing-features-grid">
          <div className="landing-feature-card">
            <span className="landing-feature-icon">🎵</span>
            <h3>Player de streaming</h3>
            <p>Seus ouvintes escutam ao vivo direto do site, com fallback automático.</p>
          </div>
          <div className="landing-feature-card">
            <span className="landing-feature-icon">📋</span>
            <h3>Grade de programação</h3>
            <p>Programação completa da semana, atualizada pelo painel admin.</p>
          </div>
          <div className="landing-feature-card">
            <span className="landing-feature-icon">🎙️</span>
            <h3>Equipe de locutores</h3>
            <p>Apresente sua equipe com foto, descrição e programas.</p>
          </div>
          <div className="landing-feature-card">
            <span className="landing-feature-icon">🎨</span>
            <h3>Visual customizável</h3>
            <p>Cores, fontes e arredondamento. Sua identidade visual sem código.</p>
          </div>
          <div className="landing-feature-card">
            <span className="landing-feature-icon">📰</span>
            <h3>Notícias</h3>
            <p>Publique notícias com imagens e destaques direto do painel.</p>
          </div>
          <div className="landing-feature-card">
            <span className="landing-feature-icon">💰</span>
            <h3>Monetização</h3>
            <p>Venda espaços de banner e patrocínio no seu site.</p>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section className="landing-section landing-planos" id="planos">
        <h2>Planos</h2>
        <p className="landing-planos-sub">Comece grátis. Evolua quando quiser.</p>
        <div className="landing-planos-grid">
          {Object.entries(PLANOS).map(([key, plano]) => (
            <div key={key} className={`landing-plano-card${key === 'basic' ? ' destaque' : ''}`}>
              {key === 'basic' && <span className="landing-plano-badge">MAIS POPULAR</span>}
              <h3>{plano.nome}</h3>
              <div className="landing-plano-preco">
                {plano.preco === 0 ? (
                  <span className="preco-valor">Grátis</span>
                ) : (
                  <>
                    <span className="preco-cifrao">R$</span>
                    <span className="preco-valor">{plano.preco}</span>
                    <span className="preco-periodo">/mês</span>
                  </>
                )}
              </div>
              <ul className="landing-plano-features">
                {FEATURES_LISTA.map((f) => (
                  <li key={f.feature} className={f[key] ? 'ativo' : 'inativo'}>
                    <span>{f[key] ? '✓' : '—'}</span> {f.feature}
                  </li>
                ))}
              </ul>
              <button className="landing-plano-btn">
                {key === 'free' ? 'Começar grátis' : 'Escolher plano'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>📻 RadioSaaS — Sites modernos para rádios</p>
        <p className="landing-footer-sub">Feito com ❤️ para rádios do Brasil</p>
      </footer>
    </div>
  );
}
