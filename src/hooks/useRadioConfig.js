import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Detecta qual rádio carregar baseado em:
 * 1. Query param: ?radio=maraja
 * 2. Subdomínio: maraja.tuaplataforma.com
 * 3. Fallback: 'maraja' (rádio piloto)
 */
function detectSlug() {
  // 1. Query param (útil pra dev e testes)
  const params = new URLSearchParams(window.location.search);
  const paramSlug = params.get('radio');
  if (paramSlug) return paramSlug;

  // 2. Subdomínio
  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  // Se tem subdomínio (ex: maraja.radiosite.com.br => parts[0] = 'maraja')
  // Ignora 'www' e 'localhost'
  if (parts.length >= 3 && parts[0] !== 'www') {
    return parts[0];
  }

  // Em dev com subdomínio local (ex: maraja.localhost)
  if (parts.length === 2 && parts[1] === 'localhost') {
    return parts[0];
  }

  // 3. Fallback
  return 'maraja';
}

/**
 * Hook que carrega a configuração da rádio do Supabase.
 * Fallback: API route local → config.js estático.
 * Retorna { config, loading, error, slug }
 */
export function useRadioConfig() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slug] = useState(detectSlug);

  useEffect(() => {
    let cancelled = false;

    async function fetchConfig() {
      setLoading(true);
      setError(null);

      try {
        // Tenta buscar do Supabase primeiro
        const { data: radio, error: radioErr } = await supabase
          .from('radios')
          .select('*')
          .eq('slug', slug)
          .single();

        if (radioErr || !radio) {
          throw new Error(`Rádio "${slug}" não encontrada no banco`);
        }

        // Busca dados relacionados
        const [
          { data: programacao },
          { data: locutores },
          { data: noticias },
          { data: patrocinadores },
          { data: banners },
        ] = await Promise.all([
          supabase.from('programacao').select('*').eq('radio_id', radio.id).order('ordem'),
          supabase.from('locutores').select('*').eq('radio_id', radio.id),
          supabase.from('noticias').select('*').eq('radio_id', radio.id).order('created_at', { ascending: false }),
          supabase.from('patrocinadores').select('*').eq('radio_id', radio.id).order('ordem'),
          supabase.from('banners').select('*').eq('radio_id', radio.id).order('ordem'),
        ]);

        // Agrupa programação por dia
        const progGrouped = {};
        (programacao || []).forEach((p) => {
          if (!progGrouped[p.dia_semana]) progGrouped[p.dia_semana] = [];
          progGrouped[p.dia_semana].push({ time: p.horario, show: p.programa, locutor: p.locutor });
        });

        // Formata locutores
        const locutoresFormatted = (locutores || []).map((l) => ({
          nome: l.nome,
          funcao: l.funcao,
          programas: l.programas || [],
          descricao: l.descricao,
          foto: l.foto_url,
        }));

        // Formata notícias
        const noticiasFormatted = (noticias || []).map((n) => ({
          id: n.id,
          titulo: n.titulo,
          resumo: n.resumo,
          img: n.img_url,
          destaque: n.destaque,
        }));

        // Formata patrocinadores
        const patFormatted = (patrocinadores || []).map((p) => ({
          nome: p.nome,
          slogan: p.slogan,
          cor: p.cor,
          href: p.href,
          emoji: p.emoji,
        }));

        // Formata banners
        const bannersFormatted = (banners || []).map((b) => ({
          titulo: b.titulo,
          subtitulo: b.subtitulo,
          cta: b.cta,
          href: b.href,
          cor: b.cor,
          corTexto: b.cor_texto,
          tag: b.tag,
          imagem: b.imagem_url,
        }));

        if (!cancelled) {
          setConfig({
            nome: radio.nome,
            frequencia: radio.frequencia,
            logo: radio.logo_url,
            whatsapp: radio.whatsapp,
            metadadosUrl: radio.metadados_url,
            historia: radio.historia,
            tema: radio.tema,
            streams: radio.streams || [],
            programacao: progGrouped,
            locutores: locutoresFormatted,
            noticias: noticiasFormatted,
            bannersPremium: bannersFormatted,
            patrocinadores: patFormatted,
            plano: radio.plano || 'free',
          });
        }
      } catch (err) {
        // Fallback: tenta API route local
        try {
          const res = await fetch(`/api/radio/${slug}`);
          if (res.ok) {
            const data = await res.json();
            if (!cancelled) setConfig(data);
          } else {
            throw new Error(err.message);
          }
        } catch {
          // Último fallback: config local
          if (!cancelled) {
            try {
              const { RADIO_CONFIG, STREAMS, PROGRAMACAO, NOTICIAS, LOCUTORES, BANNERS_PREMIUM, PATROCINADORES } = await import('../data/config.js');
              setConfig({
                nome: RADIO_CONFIG.nome,
                frequencia: RADIO_CONFIG.frequencia,
                logo: RADIO_CONFIG.logo,
                whatsapp: RADIO_CONFIG.whatsapp,
                metadadosUrl: RADIO_CONFIG.metadadosUrl,
                historia: RADIO_CONFIG.historia,
                streams: STREAMS,
                programacao: PROGRAMACAO,
                noticias: NOTICIAS,
                locutores: LOCUTORES,
                bannersPremium: BANNERS_PREMIUM,
                patrocinadores: PATROCINADORES,
                tema: null,
              });
            } catch {
              setError(err.message);
            }
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchConfig();
    return () => { cancelled = true; };
  }, [slug]);

  return { config, loading, error, slug };
}
