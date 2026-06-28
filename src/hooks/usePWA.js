import { useEffect } from 'react';

/**
 * Atualiza o manifest da PWA dinamicamente com nome e cores da rádio.
 * Gera um manifest blob e injeta como <link rel="manifest">.
 */
export function usePWA(radioData) {
  useEffect(() => {
    if (!radioData || !radioData.nome) return;

    const manifest = {
      name: `${radioData.nome} ${radioData.frequencia || ''}`.trim(),
      short_name: radioData.nome,
      description: `Ouça ${radioData.nome} ao vivo`,
      start_url: '/',
      display: 'standalone',
      background_color: radioData.tema?.corFundo || '#F0F4F8',
      theme_color: radioData.tema?.corPrimaria || '#1565C0',
      icons: [
        { src: radioData.logo || '/favicon.svg', sizes: '192x192', type: 'image/png' },
        { src: radioData.logo || '/favicon.svg', sizes: '512x512', type: 'image/png' },
      ],
    };

    const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Remove manifest antigo e injeta o novo
    let link = document.querySelector('link[rel="manifest"]');
    if (link) {
      link.href = url;
    } else {
      link = document.createElement('link');
      link.rel = 'manifest';
      link.href = url;
      document.head.appendChild(link);
    }

    // Atualiza theme-color
    let themeColor = document.querySelector('meta[name="theme-color"]');
    if (themeColor) {
      themeColor.content = radioData.tema?.corPrimaria || '#1565C0';
    }

    return () => URL.revokeObjectURL(url);
  }, [radioData]);
}
