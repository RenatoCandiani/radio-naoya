/**
 * Página de uma notícia: imagem, editoria, data, autor, texto e, ao lado,
 * as outras notícias. É o que o ouvinte vê quando clica numa manchete.
 */

const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez'];

export function dataFormatada(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const hora = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${d.getDate()} de ${MESES[d.getMonth()]}. de ${d.getFullYear()} · ${hora}h${min}`;
}

export function TabNoticia({ noticia, noticias = [], onVoltar, onAbrir, nomeRadio, modoPrevia = false }) {
  if (!noticia) return null;

  // Texto em parágrafos. Sem conteúdo ainda, mostra o resumo pra não ficar vazio.
  const paragrafos = String(noticia.conteudo || '')
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const semTexto = paragrafos.length === 0;
  const corpo = semTexto ? [noticia.resumo].filter(Boolean) : paragrafos;
  const outras = noticias.filter((n) => n.id !== noticia.id).slice(0, 5);

  const compartilhar = () => {
    const url = window.location.href;
    const texto = `${noticia.titulo} — ${nomeRadio || ''}`.trim();
    if (navigator.share) {
      navigator.share({ title: noticia.titulo, text: texto, url }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${texto}\n${url}`)}`, '_blank', 'noreferrer');
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Na prévia do painel, botão de voltar não faz sentido: não há de onde voltar. */}
      {!modoPrevia && (
        <button className="noticia-voltar" onClick={onVoltar}>← Voltar para as notícias</button>
      )}

      <div className="noticia-layout">
        <article className="noticia-principal">
          {noticia.img && (
            <img src={noticia.img} alt={noticia.titulo} className="noticia-img" />
          )}

          {noticia.categoria && <span className="noticia-categoria">{noticia.categoria}</span>}
          <h1 className="noticia-titulo">{noticia.titulo}</h1>

          <div className="noticia-meta">
            <span>{dataFormatada(noticia.created_at)}</span>
            {noticia.autor && <span>· por {noticia.autor}</span>}
          </div>

          {noticia.resumo && !semTexto && (
            <p className="noticia-linhafina">{noticia.resumo}</p>
          )}

          <div className="noticia-corpo">
            {corpo.map((p, i) => <p key={i}>{p}</p>)}
            {semTexto && (
              <p className="noticia-sem-texto">
                O texto completo desta notícia ainda não foi publicado.
              </p>
            )}
          </div>

          {modoPrevia ? (
            <span className="noticia-compartilhar noticia-compartilhar--previa">
              Compartilhar esta notícia
            </span>
          ) : (
            <button className="noticia-compartilhar" onClick={compartilhar}>
              Compartilhar esta notícia
            </button>
          )}
        </article>

        {outras.length > 0 && (
          <aside className="noticia-outras">
            <h3 className="noticia-outras-titulo">Mais notícias</h3>
            {outras.map((n) => (
              <button key={n.id} className="noticia-outra" onClick={() => onAbrir(n)}>
                {n.img && <img src={n.img} alt="" loading="lazy" />}
                <span className="noticia-outra-texto">
                  {n.categoria && <em className="noticia-outra-cat">{n.categoria}</em>}
                  <strong>{n.titulo}</strong>
                  <small>{dataFormatada(n.created_at)}</small>
                </span>
              </button>
            ))}
          </aside>
        )}
      </div>
    </div>
  );
}
