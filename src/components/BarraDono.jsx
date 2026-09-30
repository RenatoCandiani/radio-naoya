/**
 * Faixa que aparece no topo APENAS para o dono da rádio, quando ele está
 * logado. Existe porque a engrenagem no canto não dizia nada: o dono olhava
 * o próprio site e não sabia onde editar.
 *
 * Aqui a entrada é explícita, com a palavra "Editar" escrita.
 */
export function BarraDono({ nomeRadio, onAbrirPainel }) {
  return (
    <div className="barra-dono">
      <div className="barra-dono-conteudo">
        <span className="barra-dono-texto">
          <strong>Você está vendo o site da {nomeRadio || 'sua rádio'} como visitante.</strong>
          <span className="barra-dono-nota">Esta faixa só aparece para você.</span>
        </span>
        <button className="barra-dono-btn" onClick={onAbrirPainel}>
          ✏️ Editar meu site
        </button>
      </div>
    </div>
  );
}
