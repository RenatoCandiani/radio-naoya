# 🎙️ Narração do Vídeo — texto pronto pro ElevenLabs

Cada bloco abaixo é pra gerar **separado**. Gera um áudio por cena, assim você
encaixa cada fala no trecho certo do vídeo sem precisar cortar áudio.

Tempo total falado: cerca de 55 segundos. Sobra folga pro vídeo de 60 a 90s.

---

## Configuração antes de gerar

**Escolher a voz:**
Voice Library → filtro de idioma em **Portuguese** e sotaque em **Brazilian**.
Não pegue voz americana pra ler português: o texto sai certo, mas o sotaque
entrega que é gringo lendo, e o resultado soa amador.

Ouça a prévia de 3 ou 4 antes de decidir. Procure uma voz que soe como alguém
te explicando algo, não como locutor de propaganda — o tom "vendedor de TV"
funciona mal pra software.

**Modelo:** escolha o **multilíngue**. O modelo só de inglês vai destruir a
pronúncia do português.

**Ajustes:**
- Stability: meio, por volta de 50%. Muito alto fica robótico, muito baixo
  fica instável entre as frases.
- Speed: normal. Se ficar corrido, é melhor cortar palavra do que acelerar.

---

## Bloco 1 — Abertura (cena 1)

```
O site da sua rádio se parece com isso?
```

---

## Bloco 2 — O contraste (cena 2)

```
Esse aqui é o da Rádio Marajá, de Rosário do Sul. Mesma rádio, site novo. E toca ao vivo, direto do navegador.
```

---

## Bloco 3 — Criando (cena 3)

```
Criar o seu leva menos de um minuto. Nome da rádio, endereço, e-mail. Pronto.
```

---

## Bloco 4 — Configurando (cena 4)

Esse é o bloco mais longo. Se ficar corrido no vídeo, gera em duas partes.

```
Aí você configura tudo pelo painel. Sobe a logo, e ela já aparece até na aba do navegador. Cola o link da sua transmissão, aperta o play, e tá no ar. Muda as cores pra ficar com a cara da sua rádio. Monta a programação da semana. Sem programador, sem depender de ninguém.
```

**Se preferir dividir:**

Parte A:
```
Aí você configura tudo pelo painel. Sobe a logo, e ela já aparece até na aba do navegador. Cola o link da sua transmissão, aperta o play, e tá no ar.
```

Parte B:
```
Muda as cores pra ficar com a cara da sua rádio. Monta a programação da semana. Sem programador, sem depender de ninguém.
```

---

## Bloco 5 — Fechamento (cena 5)

```
Sua rádio no ar hoje. Tem plano grátis pra testar. Rádio Naoya ponto com ponto B R.
```

**Por que "ponto com ponto B R" escrito assim:** se você digitar
`radionaoya.com.br`, a voz sintética costuma tropeçar ou ler "dot com dot bee ar".
Escrever como se fala resolve. Vale ouvir e ajustar se ficar estranho.

---

## Cuidados na escrita pro TTS

Coisas que a voz sintética lê errado se você não ajudar:

| Não escreva | Escreva |
|---|---|
| `radionaoya.com.br` | `Rádio Naoya ponto com ponto B R` |
| `AM 660` | `A M seiscentos e sessenta` (ou evite, deixe na imagem) |
| `R$ 49` | `quarenta e nove reais` |
| `30s`, `1min` | `trinta segundos`, `um minuto` |

Vírgula gera pausa curta, ponto gera pausa longa. Use ponto em vez de vírgula
quando quiser que a frase respire — é o jeito mais simples de controlar ritmo.

Acentuação correta importa de verdade aqui. `radio` sem acento pode sair
"rádio" ou "radio" (do verbo). Revise os acentos antes de gerar.

---

## Ordem de trabalho sugerida

1. Grava a tela **sem áudio** primeiro, seguindo o roteiro
2. Gera os 5 blocos de narração
3. Junta no editor, encaixando cada bloco na cena
4. Ajusta a velocidade do vídeo (não do áudio) pra sincronizar

Fazer nessa ordem evita o problema clássico: gravar a tela tentando acompanhar
uma narração já pronta, e ter que regravar tudo porque atrasou dois segundos.

**Música de fundo:** se colocar, deixa bem baixa, uns 10 a 15% do volume da voz.
E cuidado pra não competir com o áudio da rádio tocando na cena 4 — nesse trecho
específico, o melhor é abaixar a música quase pra zero e deixar a rádio aparecer.
Afinal, é o som da rádio funcionando que você está vendendo.
