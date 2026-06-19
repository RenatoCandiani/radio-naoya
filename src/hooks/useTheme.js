import { useEffect } from 'react';

/**
 * Aplica o tema da rádio como CSS custom properties no :root.
 * Suporta cores, fontes e border-radius.
 * Se não tiver tema, usa os defaults do CSS.
 */
export function useTheme(tema) {
  useEffect(() => {
    if (!tema) return;

    const root = document.documentElement;

    // Cores
    if (tema.corPrimaria) root.style.setProperty('--cor-primaria', tema.corPrimaria);
    if (tema.corSecundaria) root.style.setProperty('--cor-secundaria', tema.corSecundaria);
    if (tema.corFundo) root.style.setProperty('--cor-fundo', tema.corFundo);
    if (tema.corCards) root.style.setProperty('--cor-cards', tema.corCards);
    if (tema.corTexto) root.style.setProperty('--cor-texto', tema.corTexto);

    // Fontes
    if (tema.fontePrincipal) {
      root.style.setProperty('--fonte-principal', tema.fontePrincipal);
      // Carrega fonte do Google Fonts se não for system font
      loadGoogleFont(tema.fontePrincipal);
    }
    if (tema.fonteTitulos) {
      root.style.setProperty('--fonte-titulos', tema.fonteTitulos);
      loadGoogleFont(tema.fonteTitulos);
    }

    // Border radius
    if (tema.borderRadius) root.style.setProperty('--radius', tema.borderRadius);

    // Cleanup
    return () => {
      root.style.removeProperty('--cor-primaria');
      root.style.removeProperty('--cor-secundaria');
      root.style.removeProperty('--cor-fundo');
      root.style.removeProperty('--cor-cards');
      root.style.removeProperty('--cor-texto');
      root.style.removeProperty('--fonte-principal');
      root.style.removeProperty('--fonte-titulos');
      root.style.removeProperty('--radius');
    };
  }, [tema]);
}

// Carrega uma fonte do Google Fonts dinamicamente
function loadGoogleFont(fontName) {
  if (!fontName || fontName.startsWith('-apple-system') || fontName === 'inherit') return;

  const id = `gfont-${fontName.replace(/\s+/g, '-').toLowerCase()}`;
  if (document.getElementById(id)) return;

  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;600;700;800;900&display=swap`;
  document.head.appendChild(link);
}
