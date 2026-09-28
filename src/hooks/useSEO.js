import { useEffect } from 'react';

/**
 * Atualiza title, meta description e Open Graph dinamicamente
 * baseado nos dados da rádio.
 */
export function useSEO(radioData, slug) {
  useEffect(() => {
    if (!radioData || !radioData.nome) return;

    const nome = radioData.nome;
    const frequencia = radioData.frequencia || '';
    // "ao vivo" é o que as pessoas realmente digitam ("rádio tal ao vivo"),
    // então entra no título. "Ouça Agora" não é termo de busca.
    const title = `${nome} ${frequencia} ao vivo — Ouça online`.replace(/\s+/g, ' ').trim();
    const description = radioData.historia
      ? radioData.historia.substring(0, 160)
      : `Ouça a ${nome} ${frequencia} ao vivo pela internet. Programação, locutores e notícias da região.`.replace(/\s+/g, ' ');
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

    // Endereço canônico: sem isso, o Google vê a mesma página em
    // /?radio=x, /?radio=x&noticia=y etc. e divide a força entre elas.
    if (slug) {
      setCanonical(slug.startsWith('__domain__:')
        ? `https://${slug.replace('__domain__:', '')}/`          // domínio próprio da rádio
        : `https://www.radionaoya.com.br/?radio=${slug}`);
    }

    // Favicon da aba do navegador — usa a logo da rádio
    if (logo) {
      setFavicon(logo);
    }
  }, [radioData, slug]);
}

// Troca o ícone que aparece na aba do navegador
function setFavicon(url) {
  // Remove ícones antigos pra evitar o navegador manter o anterior
  document
    .querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]')
    .forEach((el) => el.remove());

  const icon = document.createElement('link');
  icon.rel = 'icon';
  icon.href = url;
  document.head.appendChild(icon);

  const apple = document.createElement('link');
  apple.rel = 'apple-touch-icon';
  apple.href = url;
  document.head.appendChild(apple);
}

function setCanonical(url) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = url;
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