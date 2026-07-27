import { useState, useRef, useEffect } from 'react';
import './Moderno.css';

/**
 * Template "Moderno" — One-page animado com fade-in ao scroll.
 */
export function TemplateModerno({ radioData, streams, nowPlaying, adminData }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume] = useState(0.8);
  const audioRef = useRef(null);
  const selectedStream = streams[0]?.url || '';

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(selectedStream);
      audioRef.current.volume = volume;
      audioRef.current.addEventListener('error', () => setIsPlaying(false));
    }
    return () => { if (audioRef.current) audioRef.current.pause(); };
  }, []);

  // Intersection Observer pra animações
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('moderno-visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.moderno-animate').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [adminData]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.volume = volume;
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const programacaoHoje = adminData.programacao[new Date().getDay()] || [];
  const noticias = adminData.noticias || [];
  const patrocinadores = adminData.patrocinadores || [];
  const locutores = radioData.locutores || [];

  return (
    <div className="moderno">
      {/* Hero com player — fullscreen */}
      <header className="moderno-hero">
        <div className="moderno-hero-bg" />
        <div className="moderno-hero-particles" />
        <div className="moderno-hero-content">
          <img src={radioData.logo} alt={radioData.nome} className="moderno-logo moderno-float" />
          <h1 className="moderno-title-glitch">{radioData.nome}</h1>
          {radioData.frequencia && <span className="moderno-freq">{radioData.frequencia}</span>}
          <button className={`moderno-play-btn${isPlaying ? ' tocando' : ''}`} onClick={togglePlay}>
            <span className="moderno-play-icon">{isPlaying ? '⏸' : '▶'}</span>
            <span>{isPlaying ? 'Ao Vivo' : 'Ouvir Agora'}</span>
          </button>
          {nowPlaying?.titulo && (
            <p className="moderno-now-playing">🎵 {nowPlaying.titulo}</p>
          )}
          <div className="moderno-scroll-hint">
            <span>↓</span>
          </div>
        </div>
      </header>

      {/* Programação de hoje */}
      <section className="moderno-section">
        <div className="moderno-animate">
          <h2>📋 No Ar Hoje</h2>
          <div className="moderno-prog-grid">
            {programacaoHoje.slice(0, 8).map((item, idx) => (
              <div key={idx} className="moderno-prog-item moderno-animate" style={{ transitionDelay: `${idx * 80}ms` }}>
                <span className="moderno-prog-time">{item.time}</span>
                <div>
                  <strong>{item.show}</strong>
                  {item.locutor && <span className="moderno-prog-locutor">{item.locutor}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Locutores */}
      {locutores.length > 0 && (
        <section className="moderno-section moderno-section-alt">
          <div className="moderno-animate">
            <h2>🎙️ Nossa Equipe</h2>
            <div className="moderno-locutores-grid">
              {locutores.map((loc, idx) => (
                <div key={idx} className="moderno-locutor-card moderno-animate" style={{ transitionDelay: `${idx * 100}ms` }}>
                  {loc.foto ? (
                    <img src={loc.foto} alt={loc.nome} className="moderno-locutor-foto" />
                  ) : (
                    <div className="moderno-locutor-avatar">
                      {loc.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                  )}
                  <h3>{loc.nome}</h3>
                  <span className="moderno-locutor-funcao">{loc.funcao}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Notícias */}
      {noticias.length > 0 && (
        <section className="moderno-section">
          <div className="moderno-animate">
            <h2>📰 Notícias</h2>
            <div className="moderno-news-grid">
              {noticias.map((n, idx) => (
                <article key={idx} className="moderno-news-card moderno-animate" style={{ transitionDelay: `${idx * 120}ms` }}>
                  {n.img && <img src={n.img} alt={n.titulo} loading="lazy" />}
                  <div className="moderno-news-body">
                    <h3>{n.titulo}</h3>
                    <p>{n.resumo}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Sobre */}
      <section className="moderno-section moderno-section-alt">
        <div className="moderno-animate">
          <h2>📻 Nossa História</h2>
          <p className="moderno-historia">{radioData.historia}</p>
        </div>
      </section>

      {/* Patrocinadores */}
      {patrocinadores.length > 0 && (
        <section className="moderno-section">
          <div className="moderno-animate">
            <h2>✨ Apoio Cultural</h2>
            <div className="moderno-patrocinadores">
              {patrocinadores.map((p, idx) => (
                <a key={idx} href={p.href} className="moderno-pat-card moderno-animate" style={{ borderLeft: `4px solid ${p.cor}`, transitionDelay: `${idx * 80}ms` }}>
                  <span className="moderno-pat-emoji">{p.emoji}</span>
                  <div>
                    <strong>{p.nome}</strong>
                    <span>{p.slogan}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="moderno-footer moderno-animate">
        <p>{radioData.nome} {radioData.frequencia}</p>
        {radioData.whatsapp && (
          <a href={`https://wa.me/${radioData.whatsapp}`} className="moderno-whatsapp">
            📱 WhatsApp
          </a>
        )}
      </footer>
    </div>
  );
}
