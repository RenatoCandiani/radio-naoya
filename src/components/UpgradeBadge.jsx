import { PLANOS } from '../lib/planos';

/**
 * Badge que aparece no admin quando uma feature está bloqueada.
 * Mostra qual plano é necessário.
 */
export function UpgradeBadge({ planoNecessario }) {
  const plano = PLANOS[planoNecessario];
  if (!plano) return null;

  return (
    <div className="upgrade-badge">
      <span className="upgrade-badge-icon">🔒</span>
      <span className="upgrade-badge-text">
        Disponível no plano <strong>{plano.nome}</strong> (R${plano.preco}/mês)
      </span>
    </div>
  );
}
