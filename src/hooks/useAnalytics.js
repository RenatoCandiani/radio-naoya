import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Analytics básico — registra page view por rádio.
 * Não bloqueia rendering, roda em background.
 */
export function useAnalytics(slug) {
  useEffect(() => {
    if (!slug || slug.startsWith('__domain__:')) return;

    // Registra page view (fire-and-forget)
    const registerView = async () => {
      try {
        await supabase.rpc('increment_views', { radio_slug: slug });
      } catch {
        // Silencioso — analytics não deve quebrar o site
      }
    };

    // Debounce de 2s pra não contar HMR em dev
    const timer = setTimeout(registerView, 2000);
    return () => clearTimeout(timer);
  }, [slug]);
}
