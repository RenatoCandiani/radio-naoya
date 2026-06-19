import { useState, useEffect } from 'react';
import { STREAMS as STREAMS_FALLBACK, PATROCINADORES as PAT_FALLBACK, RADIO_CONFIG } from '../data/config';

export function Sidebar({ isPlaying, togglePlay, nowPlaying, selectedStream, onStreamChange, patrocinadores: patrocinadoreProp, streams: streamsProp }) {
  const patrocinadores = (patrocinadoreProp && patrocinadoreProp.length > 0) ? patrocinadoreProp : PAT_FALLBACK;
  const streams = (streamsProp && streamsProp.length > 0) ? streamsProp : STREAMS_FALLBACK;
  const [patrocinadorIdx, setPatrocinadorIdx] = useState(0);
  const [listeners, setListeners] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setPatrocinadorIdx((prev) => (prev + 1) % patrocinadores.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [patrocinadores.length]);

  // Fetch listener count
  useEffect(() => {
    const fetchListeners = () => {
      fetch(RADIO_CONFIG.metadadosUrl)
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.listeners !== 'undefined') {
            setListeners(data.listeners);
          }
        })
        .catch(() => setListeners(null));
    };
    fetchListeners();
    const interval = setInterval(fetchListeners, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="sidebar">

      {/* Card Ouça Agora */}
      <div className="card card-play">
        <p className="card-label">Ouça Agora</p>
        <button
          className={`btn-play-grande${isPlaying ? ' tocando' : ''}`}
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pausar transmissão' : 'Iniciar transmissão'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <div className={`status-badge${isPlaying ? ' no-ar' : ''}`}>
          <span className="status-dot" aria-hidden="true" />
          {isPlaying ? 'NO AR' : 'OFFLINE'}
        </div>
        {listeners !== null && (
          <p className="listener-count">🎧 {listeners} ouvintes</p>
        )}
      </div>

      {/* Card No Ar */}
      <div className="card">
        <p className="card-label">No Ar Agora</p>
        <p className="prog-nome">{nowPlaying.titulo}</p>
        {nowPlaying.artista && (
          <p className="prog-locutor">{nowPlaying.artista}</p>
        )}
      </div>

      {/* Seletor de Stream */}
      <div className="card">
        <p className="card-label">🎛 Stream</p>
        <select
          className="stream-select"
          value={selectedStream}
          onChange={onStreamChange}
          aria-label="Selecionar stream de áudio"
        >
          {streams.map((s) => (
            <option key={s.url} value={s.url}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Carrossel de Patrocinadores */}
      <div className="card card-patrocinador">
        <p className="card-label">✨ Apoio Cultural</p>
        <a
          href={patrocinadores[patrocinadorIdx].href}
          target="_blank"
          rel="noreferrer"
          className="patrocinador-banner"
          style={{ background: patrocinadores[patrocinadorIdx].cor }}
          aria-live="polite"
          aria-label={`Patrocinador: ${patrocinadores[patrocinadorIdx].nome}`}
        >
          <span className="patrocinador-emoji">{patrocinadores[patrocinadorIdx].emoji}</span>
          <span className="patrocinador-nome">{patrocinadores[patrocinadorIdx].nome}</span>
          <span className="patrocinador-slogan">{patrocinadores[patrocinadorIdx].slogan}</span>
        </a>
        <div className="patrocinador-dots" role="tablist" aria-label="Patrocinadores">
          {patrocinadores.map((p, i) => (
            <button
              key={i}
              className={`dot${i === patrocinadorIdx ? ' ativo' : ''}`}
              onClick={() => setPatrocinadorIdx(i)}
              role="tab"
              aria-selected={i === patrocinadorIdx}
              aria-label={p.nome}
            />
          ))}
        </div>
      </div>

    </aside>
  );
}
