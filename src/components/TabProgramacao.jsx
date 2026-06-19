import { useState } from 'react';
import { PROGRAMACAO } from '../data/config';

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

export function TabProgramacao({ programacao = PROGRAMACAO }) {
  const hoje = new Date().getDay(); // 0=Dom … 6=Sáb
  const [diaSelecionado, setDiaSelecionado] = useState(hoje);

  const programas = PROGRAMACAO[diaSelecionado] || [];

  return (
    <div className="animate-fade-in">
      <div className="section-header">
        <h2>Programação</h2>
        <span className="section-sub">Horário de Brasília</span>
      </div>

      {/* Seletor de dias */}
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

      {/* Lista de programas */}
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
