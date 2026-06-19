/**
 * Marca d'água exibida no plano grátis.
 * Fica no rodapé do site.
 */
export function MarcaDagua({ show }) {
  if (!show) return null;

  return (
    <div className="marca-dagua">
      <span>📻 Feito com <strong>RadioSaaS</strong></span>
    </div>
  );
}
