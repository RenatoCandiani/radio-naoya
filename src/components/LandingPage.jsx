import { useState } from 'react';
import { supabase } from '../lib/supabase';
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
  const [formData, setFormData] = useState({ nomeRadio: '', slug: '', email: '', senha: '' });
  const [formStatus, setFormStatus] = useState(''); // '', 'loading', 'success', 'error'
  const [formMsg, setFormMsg] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  const handleCadastro = async (e) => {
    e.preventDefault();
    setFormStatus('loading');
    setFormMsg('');

    const { nomeRadio, slug, email, senha } = formData;

    // Valida slug
    const safeSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!safeSlug || safeSlug.length < 3) {
      setFormStatus('error');
      setFormMsg('O slug precisa ter pelo menos 3 caracteres (só letras, números e hífens).');
      return;
    }

    try {
      // 1. Cria usuário
      const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password: senha });
      if (authErr) throw new Error(authErr.message);

      // 2. Cria a rádio
      const { error: radioErr } = await supabase.from('radios').insert({
        slug: safeSlug,
        nome: nomeRadio,
        owner_id: authData.user?.id,
        plano: 'free',
        tema: { corPrimaria: '#1565C0', corSecundaria: '#0D47A1', corFundo: '#F0F4F8', corCards: '#ffffff', corTexto: '#333333' },
        streams: [],
      });

      if (radioErr) {
        if (radioErr.message.includes('duplicate') || radioErr.message.includes('unique')) {
          throw new Error('Esse slug já está em uso. Tente outro.');
        }
        throw new Error(radioErr.message);
      }

      setFormStatus('success');
      setFormMsg(`Rádio "${nomeRadio}" criada! Verifique seu email para confirmar a conta. Depois acesse com ?radio=${safeSlug}`);
    } catch (err) {
      setFormStatus('error');
      setFormMsg(err.message);
    }
  };

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
            <a href="#cadastro" className="landing-btn-primario">Criar meu site grátis</a>
            <button onClick={() => setShowDemo(true)} className="landing-btn-secundario">
              Ver demo ao vivo →
            </button>
          </div>
        </div>
      </header>

      {/* Demo interativa */}
      {showDemo && (
        <section className="landing-demo">
          <div className="landing-demo-header">
            <h2>🎵 Demo — Rádio Marajá AM 660</h2>
            <button onClick={() => setShowDemo(false)} className="landing-demo-close">✕ Fechar</button>
          </div>
          <iframe
            src="/?radio=maraja"
            title="Demo RadioSaaS - Rádio Marajá"
            className="landing-demo-iframe"
          />
        </section>
      )}

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

      {/* Como funciona */}
      <section className="landing-section">
        <h2>Como funciona</h2>
        <div className="landing-steps">
          <div className="landing-step">
            <span className="landing-step-num">1</span>
            <h3>Cadastre sua rádio</h3>
            <p>Preencha o nome, escolha um slug e crie sua conta em segundos.</p>
          </div>
          <div className="landing-step">
            <span className="landing-step-num">2</span>
            <h3>Configure o conteúdo</h3>
            <p>Adicione programação, locutores, notícias e patrocinadores pelo painel admin.</p>
          </div>
          <div className="landing-step">
            <span className="landing-step-num">3</span>
            <h3>Pronto! Está no ar</h3>
            <p>Seu site já está disponível. Compartilhe com seus ouvintes.</p>
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
              <a href="#cadastro" className="landing-plano-btn">
                {key === 'free' ? 'Começar grátis' : 'Escolher plano'}
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Formulário de cadastro */}
      <section className="landing-section landing-cadastro" id="cadastro">
        <h2>Crie o site da sua rádio agora</h2>
        <p className="landing-planos-sub">Leva menos de 1 minuto. Sem cartão de crédito.</p>

        {formStatus === 'success' ? (
          <div className="landing-form-success">
            <span style={{ fontSize: '2.5rem' }}>🎉</span>
            <h3>Rádio criada com sucesso!</h3>
            <p>{formMsg}</p>
          </div>
        ) : (
          <form className="landing-form" onSubmit={handleCadastro}>
            <div className="landing-form-row">
              <div className="landing-form-field">
                <label>Nome da Rádio</label>
                <input
                  type="text"
                  placeholder="Ex: Rádio Exemplo FM"
                  value={formData.nomeRadio}
                  onChange={(e) => setFormData({ ...formData, nomeRadio: e.target.value })}
                  required
                />
              </div>
              <div className="landing-form-field">
                <label>Slug (URL)</label>
                <div className="landing-form-slug">
                  <input
                    type="text"
                    placeholder="minha-radio"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    required
                    minLength={3}
                  />
                  <span className="landing-form-slug-hint">.radiosaas.com</span>
                </div>
              </div>
            </div>
            <div className="landing-form-row">
              <div className="landing-form-field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="contato@suaradio.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="landing-form-field">
                <label>Senha</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.senha}
                  onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
            </div>
            {formStatus === 'error' && <p className="landing-form-error">{formMsg}</p>}
            <button type="submit" className="landing-form-btn" disabled={formStatus === 'loading'}>
              {formStatus === 'loading' ? 'Criando...' : '🚀 Criar meu site grátis'}
            </button>
          </form>
        )}
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <p>📻 RadioSaaS — Sites modernos para rádios</p>
        <p className="landing-footer-sub">Feito com ❤️ para rádios do Brasil</p>
      </footer>
    </div>
  );
}
