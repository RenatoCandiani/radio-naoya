# 💳 Ativar Stripe em produção — Checklist

Hoje o pagamento está em **modo teste**: funciona, mas nenhum real entra na conta.
Enquanto estiver assim, você pode divulgar e colocar rádios no plano grátis sem problema.
Só complete isso quando alguém quiser pagar.

---

## 1. Ativar a conta

Dashboard do Stripe → completar o cadastro que você começou.
Vai pedir CPF ou CNPJ, endereço e conta bancária para receber.

**Descrição no extrato:** `RADIO NAOYA`
É o que a rádio vê na fatura do cartão. Se ficar genérico, gera contestação.

---

## 2. Virar a chave pra live

No topo do dashboard tem o alternador **Modo teste / Modo live**. Passa pra live.

Importante: os produtos e preços de teste **não existem** no modo live.
Precisa recriar os dois.

---

## 3. Recriar os produtos (agora em live)

| Produto | Preço | Recorrência |
|---|---|---|
| Rádio Naoya - Básico | R$ 49,00 | Mensal |
| Rádio Naoya - Premium | R$ 99,00 | Mensal |

Copia o **Price ID** de cada um. Começa com `price_...`
Cuidado pra não pegar o Product ID (`prod_...`) — são diferentes.

---

## 4. Criar o webhook de produção

Webhooks → Add endpoint

- **URL:** `https://www.radionaoya.com.br/api/webhook`
  Atenção ao **www**. Sem ele a Vercel devolve redirect 308 e o Stripe não segue
  redirects — foi exatamente o que quebrou no modo teste.
- **Eventos:**
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`

Copia o **Signing secret** (`whsec_...`).

---

## 5. Atualizar as variáveis na Vercel

Projeto → Settings → Environment Variables. Substitui as 4:

| Variável | Novo valor |
|---|---|
| `STRIPE_SECRET_KEY` | `sk_live_...` |
| `STRIPE_PRICE_BASIC` | `price_...` do Básico live |
| `STRIPE_PRICE_PREMIUM` | `price_...` do Premium live |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` do webhook novo |

Não mexe nas do Supabase. E **não remova** a `SUPABASE_SERVICE_KEY` — sem ela o
webhook falha de propósito, pra evitar cliente pagar e não receber o plano.

Depois de salvar: **Deployments → Redeploy.** Variável nova só vale após redeploy.

---

## 6. Teste real (obrigatório antes do primeiro cliente)

Em live não existe cartão de teste. O jeito de validar:

1. Coloca a Marajá em `free` temporariamente:
   ```sql
   UPDATE radios SET plano = 'free' WHERE slug = 'maraja';
   ```
2. Abre o admin, clica em Básico R$49 e paga **no seu próprio cartão**
3. Confere se o plano virou `basic` sozinho (é o webhook funcionando)
4. No Stripe, cancela a assinatura e emite o reembolso
5. Confere se o plano voltou pra `free` sozinho (webhook de cancelamento)
6. Devolve a Marajá pra premium:
   ```sql
   UPDATE radios SET plano = 'premium' WHERE slug = 'maraja';
   ```

Se os passos 3 e 5 funcionarem, o ciclo de cobrança está validado de ponta a ponta.

---

## Se o plano não mudar depois do pagamento

Ordem de investigação:

1. Stripe → Webhooks → clica no endpoint → aba de tentativas.
   Erro **308** significa URL sem `www`.
   Erro **400** significa `STRIPE_WEBHOOK_SECRET` errado.
   Erro **500** significa variável faltando na Vercel.
2. Se aparecer **200 e o plano não mudou**, a `SUPABASE_SERVICE_KEY` está errada.
3. Dá pra reenviar o evento no próprio Stripe depois de corrigir — não precisa
   pagar de novo pra testar.
