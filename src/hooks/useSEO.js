import { useEffect } from 'react';

/**
 * Atualiza title, meta description e Open Graph dinamicamente
 * baseado nos dados da rádio.
 */
export function useSEO(radioData) {
  useEffect(() => {
    if (!radioData || !radioData.nome) return;

    const nome = radioData.nome;
    const frequencia = radioData.frequencia || '';
    const title = `${nome} ${frequencia} — Ouça Agora`.trim();
    const description = radioData.historia
      ? radioData.historia.substring(0, 160)
      : `Ouça ${nome} ao vivo. Programação, locutores e notícias.`;
    const logo = radioData.logo || '';

    // Title
    document.title = title;

    // Meta description
    setMeta('description', description);

    // Open Graph
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', 'website', 'property');
    if (logo) setMeta('og:image', logo, 'property');

    // Twitter Card
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);
    if (logo) setMeta('twitter:image', logo);

    // Apple title
    setMeta('apple-mobile-web-app-title', nome);
  }, [radioData]);
}

function setMeta(nameOrProperty, content, attr = 'name') {
  let el = document.querySelector(`meta[${attr}="${nameOrProperty}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, nameOrProperty);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}