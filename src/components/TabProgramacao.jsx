import { useState } from 'react';

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function parseHora(str) {
  const [h, m] = str.trim().split(':').map(Number);
  return h + m / 60;
}

function isProgAtual(timeStr) {
  const agora = new Date();
  const horaAtual = agora.getHours() + agora.getMinutes() / 60;
  const partes = timeStr.split('–');
  const inicio = parseHora(partes[0]);
  const fim = parseHora(partes[1]);
  if (fim <= inicio) return horaAtual >= inicio || horaAtual < fim;
  return horaAtual >= inicio && horaAtual < fim;
}

export function TabProgramacao({ programacao = {} }) {
  const hoje = new Date().getDay();
  const [diaSelecionado, setDiaSelecionado] = useState(hoje);

  const programas = programacao[diaSelecionado] || [];

  if (Object.keys(programacao).length === 0) {
    return (
      <div className="animate-fade-in" style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#555' }}>Programação não configurada</h3>
        <p style={{ fontSize: '0.9rem' }}>Acesse o painel admin (⚙️) para adicionar a grade de programação.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <h2>Programação</h2>
        <span className="section-sub">Horário de Brasília</span>
      </div>

      <div className="dias-selector" role="tablist" aria-label="Dias da semana">
        {DIAS.map((dia, idx) => (
          <button
            key={idx}
            className={`dia-btn${idx === diaSelecionado ? ' ativo' : ''}${idx === hoje ? ' hoje' : ''}`}
            onClick={() => setDiaSelecionado(idx)}
            role="tab"
            aria-selected={idx === diaSelecionado}
            aria-label={dia + (idx === hoje ? ' (hoje)' : '')}
          >
            {dia}
            {idx === hoje && <span className="dia-hoje-dot" aria-hidden="true" />}
          </button>
        ))}
      </div>

      <div className="prog-container" role="list">
        {programas.map((item, idx) => {
          const atual = diaSelecionado === hoje && isProgAtual(item.time);
          return (
            <div
              key={idx}
              className={`prog-item${atual ? ' prog-atual' : ''}`}
              role="listitem"
              aria-current={atual ? 'true' : undefined}
            >
              <div className="prog-esquerda">
                {atual && <span className="prog-badge">AO VIVO</span>}
                <span className="prog-hora">{item.time}</span>
              </div>
              <div className="prog-direita">
                <span className="prog-show">{item.show}</span>
                <span className="prog-locutor-small">
                  {item.locutor ? `com ${item.locutor}` : 'Auto DJ'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
