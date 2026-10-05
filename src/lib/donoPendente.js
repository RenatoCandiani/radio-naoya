/**
 * Marca de quem criou a rádio no cadastro da landing, pra que só essa pessoa consiga virar
 * dona no primeiro login no painel.
 *
 * POR QUE HASH E NÃO O E-MAIL
 * A tabela `radios` tem leitura pública (supabase-setup.sql:96, policy "Leitura pública"
 * USING (true)) e o site baixa a linha inteira com `select('*')`. Qualquer coluna dela é
 * legível por qualquer visitante. Guardar o e-mail do cliente ali seria publicar o e-mail do
 * cliente. O hash serve de verificador sem ser credencial: pra virar dono ainda é preciso
 * estar autenticado com aquele e-mail (a policy compara com `auth.jwt() ->> 'email'`).
 *
 * CONTRATO COM O SQL — os dois lados têm que normalizar igual e sair em hex minúsculo:
 *   JS  (aqui):  sha256(lower(trim(email)))                             -> hex
 *   SQL (policy): encode(sha256(convert_to(lower(trim(auth.jwt() ->> 'email')), 'UTF8')), 'hex')
 * Mudar um lado sem o outro desliga o vínculo em silêncio: ninguém consegue virar dono e
 * nenhum erro aparece. Ver supabase-fix-vinculo-dono.sql, item 5c, que imprime o hash
 * esperado pra conferir de um lado e do outro.
 */
export async function hashDonoPendente(email) {
  const normalizado = String(email || '').trim().toLowerCase();
  if (!normalizado) return null;

  // `crypto.subtle` só existe em contexto seguro (https e localhost). Testando pelo celular
  // num http de rede local ele não existe: o cadastro continua funcionando, a rádio nasce
  // sem a marca e precisa do UPDATE de socorro do arquivo SQL pra se vincular. Preferido a
  // quebrar o cadastro.
  if (typeof crypto === 'undefined' || !crypto.subtle) return null;

  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalizado));
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
