export function StickyPlayer({ isPlaying, togglePlay, nowPlaying, volume, onVolumeChange }) {
  return (
    <div className="sticky-player" role="region" aria-label="Player de áudio">
      <div className="player-info">
        <span className="player-prog">{nowPlaying.titulo}</span>
        <span className="player-sub">
          {isPlaying ? '● Tocando agora' : 'Pausado'}
        </span>
      </div>

      <div className="player-controles">
        <button className="player-btn" aria-label="Faixa anterior" disabled>⏮</button>
        <button
          className="player-btn player-play"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pausar' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className="player-btn" aria-label="Próxima faixa" disabled>⏭</button>
      </div>

      <div className="player-volume">
        <span className="volume-icon" aria-hidden="true">
          {volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}
        </span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={onVolumeChange}
          className="volume-slider"
          aria-label={`Volume: ${Math.round(volume * 100)}%`}
        />
      </div>
    </div>
  );
}
