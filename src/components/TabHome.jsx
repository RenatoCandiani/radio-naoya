import { useState, useEffect } from 'react';
import { NOTICIAS, BANNERS_PREMIUM } from '../data/config';

export function TabHome({ noticias = NOTICIAS, banner = BANNERS_PREMIUM }) {
  const banners = (Array.isArray(banner) && banner.length > 0) ? banner : BANNERS_PREMIUM;
  const [bannerIdx, setBannerIdx] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setBannerIdx((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const current = banners[bannerIdx];

  return (
    <div className="animate-fade-in">

      {/* ===== BANNERS PREMIUM (carrossel) ===== */}
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

      {/* Notícia Destaque (Hero) */}
      {noticias.filter((n) => n.destaque).map((noticia) => (
        <div
          key={noticia.id}
          className="hero-news"
          style={{ backgroundImage: `url('${noticia.img}')` }}
          role="article"
        >
          <div className="hero-overlay">
            <span className="hero-tag">DESTAQUE</span>
            <h2 className="hero-titulo">{noticia.titulo}</h2>
            <p className="hero-resumo">{noticia.resumo}</p>
          </div>
        </div>
      ))}

      {/* Grid de notícias */}
      <div className="section-header">
        <h3>Últimas Notícias</h3>
      </div>
      <div className="news-grid">
        {noticias.filter((n) => !n.destaque).map((noticia) => (
          <article key={noticia.id} className="news-card">
            <img src={noticia.img} alt={noticia.titulo} loading="lazy" />
            <div className="news-card-body">
              <h4>{noticia.titulo}</h4>
              <p>{noticia.resumo}</p>
            </div>
          </article>
        ))}
      </div>

    </div>
  );
}
