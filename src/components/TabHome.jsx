import { useState, useEffect } from 'react';
import { NOTICIAS, BANNERS_PREMIUM } from '../data/config';

export function TabHome({ noticias = [], banner = [], onAbrirNoticia }) {
  const banners = (Array.isArray(banner) && banner.length > 0) ? banner : null;
  const [bannerIdx, setBannerIdx] = useState(0);

  useEffect(() => {
    if (!banners || banners.length <= 1) return;
    const timer = setInterval(() => {
      setBannerIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners?.length]);

  const current = banners ? banners[bannerIdx] : null;

  return (
    <div className="animate-fade-in">

      {/* ===== BANNERS PREMIUM (carrossel) ===== */}
      {current && (
        <div className="banner-premium-wrapper">
          <div className="banner-fade" key={bannerIdx}>
            <a
              href={current.href}
              target="_blank"
              rel="noreferrer"
              className={`banner-pub banner-pub--ativo${current.imagem ? ' banner-pub--imagem' : ''}`}
              style={current.imagem ? {} : { background: current.cor, color: current.corTexto }}
              aria-label={`Publicidade: ${current.titulo}`}
            >
              {current.imagem ? (
                <img src={current.imagem} alt={current.titulo} className="banner-pub-img-full" />
              ) : (
                <>
                  {current.logo && (
                    <img src={current.logo} alt="" className="banner-pub-logo" />
                  )}
                  <div className="banner-pub-esquerda">
                    <span className="banner-pub-tag">{current.tag}</span>
                    <strong className="banner-pub-titulo">{current.titulo}</strong>
                    <span className="banner-pub-sub">{current.subtitulo}</span>
                  </div>
                  {current.cta && (
                    <div className="banner-pub-cta">
                      {current.cta} →
                    </div>
                  )}
                </>
              )}
            </a>
          </div>
          {banners.length > 1 && (
            <div className="banner-premium-dots">
              {banners.map((_, i) => (
                <button
                  key={i}
                  className={`dot${i === bannerIdx ? ' ativo' : ''}`}
                  onClick={() => setBannerIdx(i)}
                  aria-label={`Banner ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Estado vazio */}
      {noticias.length === 0 && !current && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📰</div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#555' }}>Nenhum conteúdo ainda</h3>
          <p style={{ fontSize: '0.9rem' }}>Acesse o painel admin (⚙️) para publicar notícias e configurar banners.</p>
        </div>
      )}

      {/* Notícia Destaque (Hero) — clicável, abre a notícia */}
      {noticias.filter((n) => n.destaque).map((noticia) => (
        <div
          key={noticia.id}
          className={`hero-news${onAbrirNoticia ? ' hero-news--clicavel' : ''}`}
          style={{ backgroundImage: `url('${noticia.img}')` }}
          role={onAbrirNoticia ? 'button' : 'article'}
          tabIndex={onAbrirNoticia ? 0 : undefined}
          onClick={onAbrirNoticia ? () => onAbrirNoticia(noticia) : undefined}
          onKeyDown={onAbrirNoticia ? (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onAbrirNoticia(noticia); }
          } : undefined}
          aria-label={onAbrirNoticia ? `Ler: ${noticia.titulo}` : undefined}
        >
          <div className="hero-overlay">
            <span className="hero-tag">DESTAQUE</span>
            <h2 className="hero-titulo">{noticia.titulo}</h2>
            <p className="hero-resumo">{noticia.resumo}</p>
            {onAbrirNoticia && <span className="hero-leia">Leia a notícia →</span>}
          </div>
        </div>
      ))}

      {/* Grid de notícias */}
      {noticias.length > 0 && (
        <>
          <div className="section-header">
            <h3>Últimas Notícias</h3>
          </div>
          <div className="news-grid">
            {noticias.filter((n) => !n.destaque).map((noticia) => {
              const Tag = onAbrirNoticia ? 'button' : 'article';
              return (
                <Tag
                  key={noticia.id}
                  className={`news-card${onAbrirNoticia ? ' news-card--clicavel' : ''}`}
                  onClick={onAbrirNoticia ? () => onAbrirNoticia(noticia) : undefined}
                  aria-label={onAbrirNoticia ? `Ler: ${noticia.titulo}` : undefined}
                >
                  <img src={noticia.img} alt={noticia.titulo} loading="lazy" />
                  <div className="news-card-body">
                    {noticia.categoria && <span className="news-card-cat">{noticia.categoria}</span>}
                    <h4>{noticia.titulo}</h4>
                    <p>{noticia.resumo}</p>
                  </div>
                </Tag>
              );
            })}
          </div>
        </>
      )}

    </div>
  );
}
