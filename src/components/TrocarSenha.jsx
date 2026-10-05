import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { limparEnderecoRecuperacao } from '../lib/recuperacaoSenha';

const MINIMO = 6;

// Mensagens em português pros erros que o Supabase devolve em inglês. Os códigos saíram de
// node_modules/@supabase/auth-js/dist/main/lib/error-codes.d.ts.
const LINK_MORTO = [
  'session_expired', 'session_not_found', 'bad_jwt', 'user_not_found',
  'refresh_token_not_found', 'refresh_token_already_used', 'otp_expired',
];

// Erro de "esse link não serve mais". Além dos códigos, cai aqui qualquer 401/403 (o
// Supabase recusou o token) e o AuthSessionMissingError, que vem sem código nenhum.
function ehLinkMorto(erro) {
  return LINK_MORTO.includes(erro.code)
    || erro.status === 401
    || erro.status === 403
    || erro.name === 'AuthSessionMissingError';
}

function traduzErro(codigo) {
  if (codigo === 'same_password') return 'Essa senha é igual à que você já usava. Escolha outra.';
  if (codigo === 'weak_password') return 'Essa senha é fraca demais. Tente uma mais longa, misturando letras e números.';
  if (codigo === 'over_request_rate_limit') return 'Foram muitas tentativas seguidas. Espere um minuto e tente de novo.';
  return 'Não deu pra trocar a senha agora. Tente de novo em alguns minutos.';
}

/**
 * Tela de criar senha nova, pra quem acabou de clicar no link do e-mail de recuperação.
 *
 * Ela é montada pelo App antes de qualquer outro caminho de renderização, porque o Site URL
 * do Supabase é único e global: a pessoa cai na raiz, que normalmente mostra a landing. Sem
 * isso o pedido se perde — foi o que já aconteceu com o painel no template moderno.
 *
 * Quem decide se esta tela aparece é src/lib/recuperacaoSenha.js, que lê o endereço no
 * import. Aqui `modo` só separa dois casos: 'trocar' (token no fragmento) e 'expirado'
 * (o Supabase devolveu #error=...).
 */
export function TrocarSenha({ modo }) {
  const { user, loading } = useAuth();
  const [senha, setSenha] = useState('');
  const [confirma, setConfirma] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [slug, setSlug] = useState(null);
  // 'expirado' manda mais que tudo: quem já estava logado e clicou num link velho não pode
  // ver o formulário, porque o pedido daquele link não vale.
  const [linkMorto, setLinkMorto] = useState(modo === 'expirado');

  const campoSenhaRef = useRef(null);
  const tituloRef = useRef(null);

  // Tira o token da barra de endereço e do histórico assim que a tela monta.
  useEffect(() => {
    limparEnderecoRecuperacao();
  }, []);

  const fechar = () => { window.location.href = '/'; };

  let vista;
  if (pronto) vista = 'sucesso';
  else if (linkMorto) vista = 'expirado';
  else if (loading) vista = 'conferindo';
  else if (!user) vista = 'expirado';   // o token não validou: furado, velho ou já usado
  else vista = 'formulario';

  // ATENÇÃO: o ✕ e o Esc somem de propósito enquanto o formulário está na tela — não é
  // esquecimento. O token chega no fragmento do endereço e `limparEnderecoRecuperacao()`
  // apaga esse fragmento assim que a tela monta. Depois disso, sair daqui joga o pedido
  // fora: não tem como voltar, só pedindo outro e-mail. Nas vistas de sucesso e de link
  // morto não existe nada a perder, então as duas saídas voltam.
  const podeFechar = vista !== 'formulario';

  // Esc fecha, como em qualquer sobreposição. Enquanto salva, não: interromper aí deixaria a
  // pessoa sem saber se a senha trocou.
  useEffect(() => {
    const aoTeclar = (e) => {
      if (e.key === 'Escape' && !salvando && podeFechar) fechar();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [salvando, podeFechar]);

  // O foco vai pro primeiro campo quando o formulário aparece. Não é no autoFocus porque o
  // formulário não é a primeira vista: antes dele passa o "Conferindo seu link". Nas vistas
  // sem campo o foco vai pro título, senão quem usa teclado ou leitor de tela fica com o
  // foco num botão que acabou de sumir.
  useEffect(() => {
    if (vista === 'formulario') campoSenhaRef.current?.focus();
    else if (vista === 'sucesso' || vista === 'expirado') tituloRef.current?.focus();
  }, [vista]);

  const aoEnviar = async (e) => {
    e.preventDefault();
    if (salvando) return;

    if (senha.length < MINIMO) {
      setErro(`A senha precisa ter pelo menos ${MINIMO} caracteres.`);
      campoSenhaRef.current?.focus();
      return;
    }
    if (senha !== confirma) {
      setErro('As duas senhas não são iguais. Digite a mesma senha nos dois campos.');
      return;
    }

    setErro('');
    setSalvando(true);

    // O auth-js devolve `{ error }` pros erros dele — inclusive rede caindo, que ele
    // embrulha em AuthRetryableFetchError. Mas o que NÃO é AuthError ele relança: a trava
    // do navegador (navigator.locks, pedida fora do try do updateUser, usada quando outra
    // aba mexe na sessão) vem por aí. Sem este try/catch essa rejeição pulava o
    // setSalvando(false) e o botão ficava preso em "Salvando...", desabilitado e sem
    // mensagem. `traduzErro()` sem argumento é a mensagem genérica que já existe aqui.
    // Não se manda pra vista de link morto: rejeição assim não diz nada sobre o link.
    let resposta;
    try {
      resposta = await supabase.auth.updateUser({ password: senha });
    } catch {
      setSalvando(false);
      setErro(traduzErro());
      return;
    }
    setSalvando(false);

    const { error } = resposta;
    if (error) {
      if (ehLinkMorto(error)) setLinkMorto(true);
      else setErro(traduzErro(error.code));
      return;
    }

    setSenha('');
    setConfirma('');
    setPronto(true);

    // Extra, não pré-requisito: se esta conta é dona de alguma rádio, a tela de sucesso
    // ganha um atalho pro site dela. Leitura de `radios` é pública por policy.
    // `.limit(1)` e não `.single()`: rádio criada pela landing fica com owner_id vazia até o
    // primeiro login no painel, e `single()` trataria "nenhuma linha" como erro.
    //
    // Esta consulta roda DEPOIS do sucesso, com a tela de "Senha trocada" já na frente da
    // pessoa. Se ela falhar — erro do PostgREST ou rejeição de rede — não há nada a avisar:
    // o `slug` fica null e a vista mostra o caminho pelo Painel, que já está implementado.
    // O try/catch está aqui só pra isso não virar rejeição solta no console.
    try {
      const { data, error: erroSlug } = await supabase
        .from('radios')
        .select('slug')
        .eq('owner_id', user.id)
        .limit(1);
      if (!erroSlug && data && data[0] && data[0].slug) setSlug(data[0].slug);
    } catch {
      // Sem ação: segue pro fallback "Abra o site da sua rádio e clique em Painel".
    }
  };

  return (
    <div className="admin-overlay">
      <div className="admin-login">
        {/* Só nas vistas em que fechar não custa nada. Ver o comentário do `podeFechar`. */}
        {podeFechar && (
          <button className="admin-close" onClick={fechar} aria-label="Fechar" title="Fechar">✕</button>
        )}

        {vista === 'conferindo' && (
          <>
            <h2>Conferindo seu link</h2>
            <p role="status" aria-live="polite">Só um instante.</p>
          </>
        )}

        {vista === 'expirado' && (
          <>
            {/* Texto genérico de propósito: o Supabase não manda `type` no redirecionamento
                de erro, então link de confirmação de cadastro vencido cai nesta mesma vista.
                Falar em senha aqui mentiria pra metade de quem chega. Critério pra conferir:
                a palavra "senha" não aparece em nenhum lugar desta vista. */}
            <h2 ref={tituloRef} tabIndex={-1}>Esse link não vale mais</h2>
            <p role="status" aria-live="polite">
              Ele expirou ou já foi usado. Nada mudou na sua conta.
            </p>
            <p>
              Pra pedir outro: abra o site da sua rádio e clique em Painel.
            </p>
            <button className="admin-btn-link" onClick={fechar}>Voltar para o início</button>
          </>
        )}

        {vista === 'formulario' && (
          <>
            <h2>Vamos criar uma senha nova</h2>
            <p>Você está trocando a senha de {user.email}.</p>
            {/* noValidate: os dois erros saem pela mesma mensagem em português, dentro do
                aria-live abaixo. Sem isso, o balão do navegador aparecia no lugar do erro de
                tamanho e o leitor de tela não anunciava nada. Os atributos `required` e
                `minLength` ficam porque são o que conta a regra pra tecnologia assistiva. */}
            <form onSubmit={aoEnviar} noValidate>
              <label
                className="admin-field-label"
                htmlFor="nova-senha"
                style={{ textAlign: 'left' }}
              >
                Nova senha
              </label>
              <input
                id="nova-senha"
                ref={campoSenhaRef}
                type="password"
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setErro(''); }}
                className={`admin-input${erro ? ' erro' : ''}`}
                placeholder={`Mínimo ${MINIMO} caracteres`}
                autoComplete="new-password"
                minLength={MINIMO}
                required
              />
              <label
                className="admin-field-label"
                htmlFor="repetir-senha"
                style={{ textAlign: 'left' }}
              >
                Repita a nova senha
              </label>
              <input
                id="repetir-senha"
                type="password"
                value={confirma}
                onChange={(e) => { setConfirma(e.target.value); setErro(''); }}
                className={`admin-input${erro ? ' erro' : ''}`}
                placeholder="A mesma senha de novo"
                autoComplete="new-password"
                minLength={MINIMO}
                required
              />
              <span className="admin-erro" role="alert" aria-live="assertive">{erro}</span>
              <button type="submit" className="admin-btn-primario" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar nova senha'}
              </button>
            </form>
          </>
        )}

        {vista === 'sucesso' && (
          <>
            <h2 ref={tituloRef} tabIndex={-1}>Senha trocada</h2>
            <p role="status" aria-live="polite">
              Sua senha nova já está valendo. Use ela na próxima vez que entrar no painel.
            </p>
            {slug ? (
              <a
                className="admin-btn-primario"
                href={`/?radio=${encodeURIComponent(slug)}`}
                style={{ display: 'block', textAlign: 'center' }}
              >
                Ir para o site da minha rádio
              </a>
            ) : (
              <>
                <p>Abra o site da sua rádio e clique em Painel pra entrar.</p>
                <button className="admin-btn-link" onClick={fechar}>Voltar para o início</button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
