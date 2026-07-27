import { useState, useEffect, useRef } from 'react';
import { RADIO_CONFIG, PROGRAMACAO } from '../data/config';

/**
 * Detecta o programa atual baseado no dia/hora.
 */
function getProgramaAtual() {
  const now = new Date();
  const dia = now.getDay(); // 0=Dom ... 6=Sab
  const horaAtual = now.getHours() * 60 + now.getMinutes(); // minutos desde 00:00

  const grade = PROGRAMACAO[dia] || [];
  for (const prog of grade) {
    // Parse "HH:MM – HH:MM"
    const match = prog.time.match(/(\d{2}):(\d{2})\s*[–-]\s*(\d{2}):(\d{2})/);
    if (!match) continue;
    const inicio = parseInt(match[1]) * 60 + parseInt(match[2]);
    const fim = parseInt(match[3]) * 60 + parseInt(match[4]);
    if (horaAtual >= inicio && horaAtual < fim) {
      return {
        titulo: prog.show,
        artista: prog.locutor ? `com ${prog.locutor}` : 'Ao vivo',
      };
    }
  }
  return {
    titulo: RADIO_CONFIG.nome,
    artista: 'Ao vivo',
  };
}

/**
 * Hook que faz polling dos metadados do stream.
 * Suporta:
 *  - BRLogic/MinhaWebRadio (currentTrack com artist/title)
 *  - Icecast status-json.xsl
 *  - Shoutcast currentsong (texto puro)
 *
 * Quando não há metadados, usa a programação do dia/hora como fallback.
 */
export function useNowPlaying(isPlaying, interval = 30000, metadadosUrl = null, programacao = null) {
  function getProgramaAtualLocal() {
    const prog = programacao || PROGRAMACAO;
    const now = new Date();
    const dia = now.getDay();
    const horaAtual = now.getHours() * 60 + now.getMinutes();

    const grade = prog[dia] || [];
    for (const p of grade) {
      const match = p.time.match(/(\d{2}):(\d{2})\s*[–-]\s*(\d{2}):(\d{2})/);
      if (!match) continue;
      const inicio = parseInt(match[1]) * 60 + parseInt(match[2]);
      const fim = parseInt(match[3]) * 60 + parseInt(match[4]);
      if (horaAtual >= inicio && horaAtual < fim) {
        return { titulo: p.show, artista: p.locutor ? `com ${p.locutor}` : 'Ao vivo' };
      }
    }
    return { titulo: 'Programação', artista: 'Ao vivo' };
  }

  const [nowPlaying, setNowPlaying] = useState(getProgramaAtualLocal);
  const timerRef = useRef(null);

  useEffect(() => {
    const progTimer = setInterval(() => {
      setNowPlaying((prev) => {
        if (!prev._fromApi) return getProgramaAtualLocal();
        return prev;
      });
    }, 60000);
    return () => clearInterval(progTimer);
  }, [programacao]);

  const fetchMeta = async () => {
    const url = metadadosUrl || RADIO_CONFIG.metadadosUrl;
    if (!url) return;

    try {
      const res = await fetch(url, { cache: 'no-store' });
      const json = await res.json();

      // --- Formato BRLogic: { currentTrack: { artist, title } | false } ---
      if ('currentTrack' in json) {
        if (json.currentTrack && json.currentTrack.title) {
          setNowPlaying({
            titulo: json.currentTrack.title,
            artista: json.currentTrack.artist || '',
            _fromApi: true,
          });
        } else {
          // currentTrack: false → sem metadado, usa programação
          setNowPlaying(getProgramaAtual());
        }
        return;
      }

      // --- Formato Icecast status-json.xsl ---
      const source = json?.icestats?.source;
      if (source) {
        const src = Array.isArray(source) ? source[0] : source;
        const title = src?.title || '';
        if (title) {
          const [artista, ...resto] = title.split(' - ');
          setNowPlaying({
            titulo: resto.join(' - ') || artista,
            artista: resto.length ? artista : '',
            _fromApi: true,
          });
        }
        return;
      }

    } catch {
      // texto puro (Shoutcast) ou erro de rede — tenta como texto
      try {
        const res2 = await fetch(metadadosUrl || RADIO_CONFIG.metadadosUrl, { cache: 'no-store' });
        const text = await res2.text();
        const trimmed = text.trim();
        if (trimmed) {
          const [artista, ...resto] = trimmed.split(' - ');
          setNowPlaying({
            titulo: resto.join(' - ') || artista,
            artista: resto.length ? artista : '',
            _fromApi: true,
          });
        }
      } catch {
        // rede indisponível — usa programação
        setNowPlaying(getProgramaAtualLocal());
      }
    }
  };

  useEffect(() => {
    const url = metadadosUrl || RADIO_CONFIG.metadadosUrl;
    if (!url || !isPlaying) {
      setNowPlaying(getProgramaAtualLocal());
      return;
    }

    fetchMeta();
    timerRef.current = setInterval(fetchMeta, interval);

    return () => clearInterval(timerRef.current);
  }, [isPlaying, interval]);

  return nowPlaying;
}
