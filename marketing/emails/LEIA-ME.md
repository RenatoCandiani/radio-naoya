# E-mails do Rádio Naoya

Esta pasta tem os e-mails que o sistema manda para o dono da rádio. Hoje, quem
manda esses e-mails é o Supabase, e eles chegam **em inglês, com texto padrão
dele e sem a sua marca**. Isso passa impressão de serviço amador justamente na
hora mais delicada: quando a pessoa está criando conta ou perdeu a senha.

---

## Parte 1 — Criar o e-mail do Rádio Naoya

### Qual endereço criar

Sugestão, em ordem de preferência:

1. `contato.radionaoya@gmail.com` ← o que eu usaria
2. `radionaoya.contato@gmail.com`
3. `radionaoyabr@gmail.com`
4. `falecom.radionaoya@gmail.com`

Evite: apelido, número aleatório, ano de nascimento, nada com o seu nome
pessoal. O endereço vai aparecer para rádio que você quer como cliente.

`radionaoya@gmail.com` provavelmente já está tomado, mas vale tentar primeiro.

### Como ligar na sua conta principal

O objetivo é: você **lê e responde tudo pelo seu Gmail de sempre**, mas quem
recebe vê o endereço do Rádio Naoya. Ninguém precisa ficar trocando de conta.

**No e-mail novo:**

1. Configurações → Encaminhamento e POP/IMAP
2. Adicionar endereço de encaminhamento → põe o seu Gmail principal
3. Confirma pelo link que chega no principal
4. Marca "Encaminhar uma cópia"

**No seu Gmail principal:**

5. Configurações → Contas e importação → "Enviar e-mail como"
6. Adicionar outro endereço → põe o e-mail novo
7. Chega um código no e-mail novo; cola pra confirmar
8. Agora, ao responder, dá pra escolher o remetente

**Segurança, que foi o que você pediu:**

9. No e-mail novo: ativa a verificação em duas etapas
10. Põe o seu Gmail principal como e-mail de recuperação e o seu celular como
    telefone de recuperação
11. Guarda os códigos de backup em algum lugar que não seja só o celular

Assim, se você perder acesso ao e-mail novo, recupera pelo principal.

### Um degrau acima, quando quiser

Você é dono do domínio `radionaoya.com.br`. Dá para ter
`contato@radionaoya.com.br` **de graça**, usando o Email Routing da Cloudflare:
ele recebe no endereço do seu domínio e encaminha para o seu Gmail. Precisa que
o DNS do domínio esteja na Cloudflare.

`contato@radionaoya.com.br` passa muito mais credibilidade para uma rádio do que
um Gmail. Mas não é urgente: comece pelo Gmail e troque depois.

---

## Parte 2 — Trocar os e-mails do sistema

### Onde colar cada arquivo

No painel do Supabase: **Authentication → Emails → Templates**.
Para cada um, cole o HTML no campo "Message body" e ajuste o "Subject".

| Arquivo | Template no Supabase | Assunto sugerido |
|---|---|---|
| `01-confirmar-cadastro.html` | Confirm signup | Confirme seu e-mail e ative o site da sua rádio |
| `02-redefinir-senha.html` | Reset password | Redefinir a senha do seu painel |
| `03-trocar-email.html` | Change email address | Confirme seu novo e-mail |

### As variáveis (não mude essas palavras)

O Supabase substitui estas marcas pelo valor real no momento do envio:

- `{{ .ConfirmationURL }}` → o link que a pessoa precisa clicar
- `{{ .Email }}` → o e-mail atual
- `{{ .NewEmail }}` → o novo e-mail (só no template de troca)
- `{{ .SiteURL }}` → o endereço do site

Se você apagar uma dessas por acidente, o e-mail sai com um botão que não leva a
lugar nenhum. É o erro mais comum aqui.

### Configure o remetente

Ainda no Supabase, em **Project Settings → Authentication → SMTP Settings**,
coloque o e-mail novo como remetente e "Rádio Naoya" como nome. Sem isso, o
e-mail chega de um endereço do Supabase, e cai em spam com mais facilidade.

Aviso honesto: o envio gratuito do Supabase tem limite baixo de e-mails por
hora, pensado para teste. Quando começar a entrar cliente de verdade, vale
configurar um serviço de envio (Resend e Brevo têm plano gratuito) para os
e-mails não atrasarem nem cair em spam.

---

## Parte 3 — Os e-mails de assinatura

Estes o Supabase **não** manda. São para você enviar quando o assunto é
pagamento, seja na mão ou ligado no webhook do Stripe mais adiante:

| Arquivo | Quando mandar |
|---|---|
| `04-assinatura-ativada.html` | O pagamento entrou e o plano subiu |
| `05-pagamento-falhou.html` | O cartão foi recusado, mas ainda vai tentar de novo |
| `06-assinatura-cancelada.html` | Não deu certo e a assinatura encerrou |

Em todos, troque o que está entre colchetes, por exemplo `[NOME DA RÁDIO]`.

A ordem 05 → 06 importa: primeiro avisa que a cobrança falhou e que o site
**não caiu**, depois avisa que encerrou e que a porta continua aberta. Mandar só
o 06, sem o aviso antes, faz a rádio se sentir cortada sem chance.

---

## Por que cada texto está escrito assim

Sobre o **texto**:

- **Nada de "clique aqui".** O botão diz o que acontece ao clicar.
- **Título é frase humana, não aviso de sistema.** "Vamos criar uma senha nova"
  em vez de "Solicitação de redefinição de senha".
- **O link aparece escrito também.** Cliente de e-mail antigo às vezes não
  mostra botão; e quem desconfia de link quer ver o endereço antes.
- **Diz o prazo de validade do link**, porque a dúvida nº 1 de quem demora para
  abrir é justamente "esse link ainda serve?".
- **Tem a frase "não foi você que pediu?"** nos e-mails de senha e de troca de
  e-mail. É o que impede a pessoa de entrar em pânico achando que foi invadida.
- **Nos e-mails de cobrança, a primeira coisa é "seu site está no ar".** Sem
  isso, a rádio lê "pagamento recusado" e acha que perdeu tudo.
- **Assinado por uma pessoa**, não por "Equipe". Você é um desenvolvedor
  independente, e isso é vantagem: a rádio fala com quem programa.
- **Sem emoji.** Principalmente nos de senha e cobrança, onde emoji parece golpe.

Sobre o **visual** (feito a partir da referência da Wellhub):

- **Só o nome no topo**, sem faixa colorida enorme. Cabeçalho pesado é marca de
  e-mail automático; o limpo parece mensagem de gente.
- **Uma caixa com borda** segurando o argumento e o botão, para o olho ir direto
  ao que importa.
- **Rodapé com Ajuda · Termos · Privacidade**, apontando para as páginas reais do
  site. Isso não é enfeite: e-mail com link de termos e privacidade tem menos
  chance de cair em spam, e é o que a LGPD espera.
- **Largura de 560px** e fonte do próprio sistema, que é o que funciona melhor
  no celular.
