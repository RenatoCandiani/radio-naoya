import { useState, useRef, useEffect, lazy, Suspense } from 'react';
import './App.css';
import './landing.css';

import {
  NOTICIAS, PROGRAMACAO, PATROCINADORES, BANNERS_PREMIUM,
} from './data/config';
import { useNowPlaying } from './hooks/useNowPlaying';
import { useRadioConfig } from './hooks/useRadioConfig';
import { useTheme } from './hooks/useTheme';
import { useAnalytics } from './hooks/useAnalytics';
import { useSEO } from './hooks/useSEO';
import { usePWA } from './hooks/usePWA';
import { temFeature } from './lib/planos';
import { useAdminData, Admin } from './components/Admin';
import { Sidebar } from './components/Sidebar';
import { StickyPlayer } from './components/StickyPlayer';
import { MarcaDagua } from './components/MarcaDagua';
import { LandingPage } from './components/LandingPage';
import { Termos, Privacidade } from './components/PaginaLegal';
import { TabHome } from './components/TabHome';
import { TabNoticia } from './components/TabNoticia';
import { TabProgramacao } from './components/TabProgramacao';
import { TabHistoria } from './components/TabHistoria';
import { TabContatos } from './components/TabContatos';
import { TabLocutores } from './components/TabLocutores';
import { TabComercial } from './components/TabComercial';
import { TemplateModerno } from './templates/Moderno';

const TABS = [
  { id: 'home',        label: 'Início' },
  { id: 'programacao', label: 'Programação' },
  { id: 'locutores',   label: 'Locutores' },
  { id: 'historia',    label: 'Nossa História' },
  { id: 'comercial',   label: 'Comercial' },
  { id: 'contatos',    label: 'Contatos' },
];

function App() {
  // Detecta se deve mostrar a landing page
  const params = new URLSearchParams(window.location.search);
  const hostname = window.location.hostname;
  const isLanding = params.has('landing')
    || (hostname.includes('radionaoya.com.br') && !params.has('radio'));

  // Multi-tenant: carrega config da rádio pela API
  const { config: radioConfig, loading: configLoading, slug } = useRadioConfig();

  // Termos de Uso e Política de Privacidade (links do rodapé)
  const pagina = params.get('pagina');
  if (pagina === 'termos' || pagina === 'privacidade') {
    const voltar = () => { window.location.href = '/'; };
    return pagina === 'termos' ? <Termos onVoltar={voltar} /> : <Privacidade onVoltar={voltar} />;
  }

  // Se é a landing page, renderiza ela
  if (isLanding) {
    return <LandingPage />;
  }

  // Usa dados da API ou fallback vazio (loading)
  const radioData = radioConfig || {
    nome: '',
    frequencia: '',
    logo: '',
    whatsapp: '',
    metadadosUrl: '',
    historia: '',
    streams: [],
    programacao: {},
    noticias: [],
    locutores: [],
    bannersPremium: [],
    patrocinadores: [],
    planosComerciais: [],
    tema: null,
  };

  // Aplica tema dinâmico da rádio
  useTheme(radioData.tema);

  // SEO dinâmico
  useSEO(radioData);

  // PWA dinâmica
  usePWA(radioData);

  // Analytics
  useAnalytics(slug);

  // Só os streams DESTA rádio. Antes, rádio sem stream cadastrado caía na
  // lista da Marajá: o seletor mostrava a emissora errada e o Play tocava ela.
  // Sem stream, a lateral mostra "configure seu stream no painel".
  const streams = radioData.streams && radioData.streams.length > 0 ? radioData.streams : [];

  const [activeTab, setActiveTab]           = useState('home');
  const [isPlaying, setIsPlaying]           = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce]   = useState(false);
  const [volume, setVolume]                 = useState(0.8);
  const [selectedStream, setSelectedStream] = useState(streams[0]?.url || '');
  const [showAdmin, setShowAdmin]           = useState(false);
  // Notícia aberta. Fica no endereço (?noticia=ID) pra poder compartilhar.
  const [noticiaId, setNoticiaId]           = useState(() => params.get('noticia'));
  const [darkMode, setDarkMode]             = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const audioRef = useRef(null);
  const nowPlaying = useNowPlaying(isPlaying, 30000, radioData.metadadosUrl, radioData.programacao);

  // Cria o audio element uma única vez
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.addEventListener('error', () => setIsPlaying(false));
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Dados do admin sobrepõem os do config quando salvos
  const adminData = useAdminData(
    radioData.noticias || NOTICIAS,
    radioData.programacao || PROGRAMACAO,
    radioData.patrocinadores || PATROCINADORES,
    radioData.bannersPremium || BANNERS_PREMIUM
  );

  // Detecta template (query param ou config da rádio)
  const template = params.get('template') || radioData.template || 'classico';

  // A lista de streams só fica certa depois que a config carrega. Sem isto,
  // o selecionado continuava o da lista provisória e o Play tocava a rádio
  // errada (a Marajá) em qualquer outra rádio.
  const streamsKey = streams.map((s) => s.url).join('|');
  useEffect(() => {
    if (!streams.some((s) => s.url === selectedStream)) {
      setSelectedStream(streams[0]?.url || '');
    }
  }, [streamsKey]);

  // Atualiza src quando stream muda
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !selectedStream) return;
    const wasPlaying = !audio.paused;
    audio.src = selectedStream;
    audio.volume = volume;
    audio.load();
    if (wasPlaying) audio.play().catch(() => setIsPlaying(false));
  }, [selectedStream]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.volume = volume;
      audio.play()
        .then(() => { setIsPlaying(true); setHasPlayedOnce(true); })
        .catch(() => setIsPlaying(false));
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) audioRef.current.volume = val;
  };

  // ---- Notícia aberta ----
  const noticiasLista = adminData.noticias || [];
  const noticiaAberta = noticiaId
    ? noticiasLista.find((n) => String(n.id) === String(noticiaId))
    : null;

  const trocaEndereco = (id) => {
    const p = new URLSearchParams(window.location.search);
    if (id) p.set('noticia', id); else p.delete('noticia');
    const busca = p.toString();
    window.history.pushState({}, '', `${window.location.pathname}${busca ? '?' + busca : ''}`);
  };

  const abrirNoticia = (n) => {
    setNoticiaId(n.id);
    setActiveTab('home');
    trocaEndereco(n.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fecharNoticia = () => {
    setNoticiaId(null);
    trocaEndereco(null);
  };

  // Botão voltar do navegador fecha (ou reabre) a notícia
  useEffect(() => {
    const aoVoltar = () => {
      setNoticiaId(new URLSearchParams(window.location.search).get('noticia'));
    };
    window.addEventListener('popstate', aoVoltar);
    return () => window.removeEventListener('popstate', aoVoltar);
  }, []);

  const whatsappHref = `https://wa.me/${radioData.whatsapp}?text=Ol%C3%A1%2C%20quero%20pedir%20uma%20m%C3%BAsica!`;

  // Tela de loading enquanto Supabase carrega
  if (configLoading || !radioConfig) {
    return (
      <div className="App" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0f4f8' }}>
        <div style={{ textAlign: 'center', color: '#888' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📻</div>
          <p style={{ fontSize: '0.95rem' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  // Template moderno
  if (template === 'moderno') {
    return <TemplateModerno radioData={radioData} streams={streams} nowPlaying={nowPlaying} adminData={adminData} />;
  }

  return (
    <div className="App">

      {/* ===== HEADER ===== */}
      <header className="header">
        <div className="logo-area">
          {radioData.logo ? (
            <img
              src={radioData.logo}
              alt={`Logo ${radioData.nome}`}
              className="logo-img"
            />
          ) : (
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem' }}>
              {radioData.nome || 'Sua Rádio'}
            </span>
          )}
        </div>
        <div className="header-actions">
          {/* Botão dark mode */}
          <button
            className="dark-mode-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label={darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
            title={darkMode ? 'Modo claro' : 'Modo escuro'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          {/* Botão admin */}
          <button
            className="admin-trigger"
            onClick={() => setShowAdmin(true)}
            aria-label="Abrir painel administrativo"
            title="Admin"
          >
            ⚙️
          </button>
        </div>
      </header>

      {/* ===== NAVEGAÇÃO ===== */}
      <nav className="nav-menu" aria-label="Menu principal">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`nav-btn${activeTab === tab.id && !noticiaAberta ? ' ativo' : ''}`}
            onClick={() => { fecharNoticia(); setActiveTab(tab.id); }}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noreferrer"
          className="nav-btn btn-whatsapp"
          aria-label="Nos contate pelo WhatsApp"
        >
          📱 Nos Contate
        </a>
      </nav>

      {/* ===== LAYOUT GRID ===== */}
      <div className="container">
        <Sidebar
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          nowPlaying={nowPlaying}
          selectedStream={selectedStream}
          onStreamChange={(e) => setSelectedStream(e.target.value)}
          patrocinadores={adminData.patrocinadores}
          streams={streams}
          metadadosUrl={radioData.metadadosUrl}
        />
        <main className="main-content" role="main">
          {noticiaAberta ? (
            <TabNoticia
              noticia={noticiaAberta}
              noticias={noticiasLista}
              onVoltar={fecharNoticia}
              onAbrir={abrirNoticia}
              nomeRadio={radioData.nome}
            />
          ) : (
            <>
          {activeTab === 'home'        && <TabHome noticias={adminData.noticias} banner={adminData.banner} onAbrirNoticia={abrirNoticia} />}
          {activeTab === 'programacao' && <TabProgramacao programacao={adminData.programacao} />}
          {activeTab === 'locutores'   && <TabLocutores locutores={radioData.locutores} />}
          {activeTab === 'historia'    && <TabHistoria radioData={radioData} />}
          {activeTab === 'comercial'   && <TabComercial whatsapp={radioData.whatsapp} nome={radioData.nome} planosComerciais={radioData.planosComerciais} />}
          {activeTab === 'contatos'    && <TabContatos whatsappHref={whatsappHref} whatsapp={radioData.whatsapp} />}
            </>
          )}
        </main>
      </div>

      {/* ===== STICKY PLAYER ===== */}
      {hasPlayedOnce && (
        <StickyPlayer
          isPlaying={isPlaying}
          togglePlay={togglePlay}
          nowPlaying={nowPlaying}
          volume={volume}
          onVolumeChange={handleVolumeChange}
        />
      )}

      {/* ===== PAINEL ADMIN ===== */}
      {showAdmin && <Admin onClose={() => setShowAdmin(false)} radioSlug={slug} plano={radioData.plano || 'free'} />}

      {/* ===== MARCA D'ÁGUA (plano grátis) ===== */}
      <MarcaDagua show={temFeature(radioData.plano || 'free', 'marcaDagua')} />

    </div>
  );
}

export default App;
