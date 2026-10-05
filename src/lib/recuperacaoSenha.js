/**
 * Leitor do endereço: diz se a pessoa está voltando do e-mail de "redefinir senha".
 *
 * COMO O TOKEN CHEGA (conferido, não suposto)
 * O cliente deste projeto é `createClient(url, key)` sem opções (src/lib/supabase.js), então
 * valem os padrões do auth-js 2.108.2 — `flowType: 'implicit'` e `detectSessionInUrl: true`
 * (DEFAULT_OPTIONS em node_modules/@supabase/auth-js/dist/main/GoTrueClient.js). Não existe
 * `flowType: 'pkce'` em nenhum lugar do src. Ou seja: o token NÃO vem em `?code=`, vem no
 * fragmento, e o auth-js só aceita o fragmento com os quatro campos juntos —
 * `#access_token=...&refresh_token=...&expires_in=3600&token_type=bearer&type=recovery`.
 * Link furado ou velho volta com `#error=access_denied&error_code=otp_expired&...`.
 *
 * POR QUE A LEITURA É AQUI, NO IMPORT, E NÃO NUM useEffect COM O EVENTO PASSWORD_RECOVERY
 *
 * 1. O evento chega antes de dar tempo de assinar. O auth-js dispara `PASSWORD_RECOVERY`
 *    dentro de um `setTimeout(..., 0)` do `_initialize()`, que começa no construtor do client
 *    — isto é, no import de src/lib/supabase.js. Quem assina depois (o useAuth assina num
 *    useEffect) não recebe esse disparo.
 * 2. A ordem dos hooks do App. A tela de senha tem que vir antes de todos os caminhos de
 *    renderização do App (landing, site clássico, template moderno, tela de carregando), e
 *    isso só se faz com um `return` antecipado. Se a decisão viesse de um estado que muda
 *    depois do primeiro render, o App passaria a chamar menos hooks do que antes e o React
 *    quebraria com "Rendered fewer hooks than expected". Lido uma vez, no import, o valor é
 *    constante de módulo: o `if` responde igual em toda renderização.
 *
 * Ler no import é seguro mesmo que supabase.js seja avaliado primeiro: o auth-js lê a URL de
 * forma síncrona no construtor e só limpa o fragmento depois de validar o token na rede.
 */

function lerEndereco() {
  if (typeof window === 'undefined') return { modo: null };

  const hash = window.location.hash || '';
  // Mesmo parse que o auth-js faz, e que já decodifica %20 e + do texto.
  const campos = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);

  if (campos.get('type') === 'recovery' && campos.get('access_token')) {
    return { modo: 'trocar' };
  }

  // Link velho, já usado ou inválido. O Supabase não manda `type` no redirecionamento de
  // erro, então um link de confirmação de cadastro expirado cai aqui também — por isso o
  // texto da tela é genérico ("Esse link não vale mais") e não fala em senha.
  if (campos.get('error') || campos.get('error_code')) {
    return { modo: 'expirado' };
  }

  return { modo: null };
}

export const recuperacaoSenha = lerEndereco();

/**
 * Apaga o fragmento do endereço trocando a entrada atual do histórico.
 *
 * O auth-js limpa com `window.location.hash = ''`, que troca a barra de endereço mas EMPILHA
 * uma entrada nova: o token continua na entrada anterior, a um Voltar de distância.
 * `replaceState` troca a entrada no lugar, então não sobra token nem na barra nem no
 * histórico. É chamado quando a tela monta — antes da limpeza do auth-js, que espera uma ida
 * à rede — e isso não atrapalha o login: o token que o auth-js precisa já foi lido no
 * construtor, de forma síncrona, antes do primeiro render.
 */
export function limparEnderecoRecuperacao() {
  if (typeof window === 'undefined' || !window.history || !window.history.replaceState) return;
  const { pathname, search } = window.location;
  window.history.replaceState(window.history.state, '', `${pathname}${search}`);
}
