import { useState, useEffect, useRef } from 'react';

/**
 * Detecta o programa atual baseado na programação e hora.
 */
function getProgramaAtual(programacao) {
  if (!programacao || typeof programacao !== 'object') {
    return { titulo: 'Programação', artista: 'Ao vivo' };
  }

  const now = new Date();
  const dia = now.getDay();
  const horaAtual = now.getHours() * 60 + now.getMinutes();

  const grade = programacao[dia] || [];
  for (const prog of grade) {
    const match = prog.time?.match(/(\d{2}):(\d{2})\s*[–-]\s*(\d{2}):(\d{2})/);
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
  return { titulo: 'Programação', artista: 'Ao vivo' };
}

/**
 * Hook que faz polling dos metadados do stream.
 */
export function useNowPlaying(isPlaying, interval = 30000, metadadosUrl = null, programacao = null) {
  const [nowPlaying, setNowPlaying] = useState({ titulo: 'Programação', artista: 'Ao vivo' });
  const timerRef = useRef(null);

  // Atualiza pelo programa atual a cada minuto
  useEffect(() => {
    setNowPlaying(getProgramaAtual(programacao));
    const progTimer = setInterval(() => {
      setNowPlaying((prev) => {
        if (!prev._fromApi) return getProgramaAtual(programacao);
        return prev;
      });
    }, 60000);
    return () => clearInterval(progTimer);
  }, [programacao]);

  const fetchMeta = async () => {
    if (!metadadosUrl) return;

    try {
      const res = await fetch(metadadosUrl, { cache: 'no-store' });
      const json = await res.json();

      // Formato BRLogic
      if ('currentTrack' in json) {
        if (json.currentTrack && json.currentTrack.title) {
          setNowPlaying({
            titulo: json.currentTrack.title,
            artista: json.currentTrack.artist || '',
            _fromApi: true,
          });
        } else {
          setNowPlaying(getProgramaAtual(programacao));
        }
        return;
      }

      // Formato Icecast
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
      // Tenta como texto (Shoutcast)
      try {
        const res2 = await fetch(metadadosUrl, { cache: 'no-store' });
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
        setNowPlaying(getProgramaAtual(programacao));
      }
    }
  };

  useEffect(() => {
    if (!metadadosUrl || !isPlaying) {
      setNowPlaying(getProgramaAtual(programacao));
      return;
    }

    fetchMeta();
    timerRef.current = setInterval(fetchMeta, interval);
    return () => clearInterval(timerRef.current);
  }, [isPlaying, metadadosUrl, interval]);

  return nowPlaying;
}
