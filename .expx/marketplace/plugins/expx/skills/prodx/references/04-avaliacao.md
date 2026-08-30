# P4 — Avaliação

Produz `03-avaliacao.md`. **Só roda quando o P3 não for EXISTE.**

Se o desfecho foi EXISTE, pule direto para o P5 com veredito `ja_existe`. Avaliar o mérito de algo que já está pronto é desperdício.

## Pré-requisitos

- `02-existencia.md` existe, com desfecho `existe_parcial` ou `nao_existe`.
- `PRODUTO.md` existe. Sem ele, as perguntas 1, 2 e 3 não têm contra o quê confrontar — rode o P1 antes ou marque as três como dependentes de lacuna.

## As sete perguntas

Cada uma responde com **evidência** ou com a marcação explícita de que **falta dado**. Nunca com opinião não marcada.

---

### 1. Está dentro do que o produto é?

Confronte com a seção **"o que o produto deliberadamente NÃO é"** do `PRODUTO.md`. É para isso que aquela seção existe.

- Bate com uma das negativas → forte indício de `nao_fazer` por escopo. Cite a negativa literalmente.
- Não bate → registre isso positivamente; não deixe em branco.
- O `PRODUTO.md` não tem negativa que cubra o caso → é lacuna. Registre em `LACUNAS.md` e leve a pergunta ao signatário: **isso é coisa que este produto faz?** A resposta dele vira negativa nova no `PRODUTO.md`.

---

### 2. Quem se beneficia? Um cliente, um perfil, ou todos?

Em **produto multi-cliente**, pedido que serve a um só é **decisão de produto**, não decisão técnica. Três saídas possíveis, e a escolha é do signatário:

| Saída | Quando faz sentido |
|-------|-------------------|
| Virar **customização** | O cliente paga por isso, e a casa aceita manter código específico dele |
| Virar **produto** | Generalizando um pouco, serve a vários — o pedido vira versão configurável |
| Ser **recusado** | Não paga a customização e não generaliza |

**Nunca mande isso direto para o sprintx.** Registre as três opções com o custo de cada uma e leve ao veredito para assinatura. Este é um dos casos em que a skill mais claramente recomenda e não decide.

Se o modelo for instalação por cliente ou customização por contrato, esta pergunta é mais simples: registre quem paga e siga.

---

### 3. Qual objetivo de negócio isso serve?

Confronte com os objetivos vigentes do `PRODUTO.md`.

**Se não serve nenhum, isso é um achado, não um detalhe.** Escreva-o como achado destacado. Um pedido que não serve objetivo declarado pode ainda ser feito — por relacionamento, por contrato — mas a decisão precisa ser tomada sabendo disso.

Se o `PRODUTO.md` não declara objetivos (`NAO DETERMINADO`), registre "não avaliável — objetivos não declarados" e abra lacuna. Não invente objetivo para justificar.

---

### 4. Qual o custo de NÃO fazer?

As opções, em ordem decrescente de peso:

| Custo | O que registrar |
|-------|-----------------|
| Cliente perdido | Qual cliente, qual contrato, quem afirmou isso — cite a fonte |
| Risco regulatório | Qual norma, qual prazo |
| Processo manual | Quantas pessoas, quanto tempo por semana — número, não adjetivo |
| Nada | Diga "nada" explicitamente. É resposta legítima e frequente. |

"Cliente ameaçou cancelar" é fato reportado, não fato — registre **quem reportou**. Ameaça repassada por terceiro perde força e isso importa no veredito.

---

### 5. Existe solução fora do software?

**Software é a solução mais cara.** Verifique, nesta ordem:

1. **Configuração já disponível** — o sistema faz, basta ligar/parametrizar
2. **Treinamento** — a funcionalidade existe e o usuário não sabe (cruze com o P3, especialmente com EXISTE PARCIAL por desconhecimento)
3. **Ajuste de processo** — mudar a ordem do que o usuário faz resolve
4. **Ferramenta externa que o cliente já tem** — planilha, BI, o próprio ERP dele

Achou uma → é candidata a `fazer_outra_coisa` ou `nao_fazer`, e o texto ao cliente muda completamente.

---

### 6. ESCOPO MÍNIMO — obrigatório

Regra 6. **Este campo nunca fica vazio.** Se você não achou uma versão menor, procurou pouco.

> Qual é a versão dez vezes menor que resolve a maior parte do problema?

Técnicas para achar:

- Corte de perfil: só o administrador precisa, não todos
- Corte de volume: um relatório sob demanda em vez de tela em tempo real
- Corte de automação: manual agora, automático depois — resolve 80% do custo
- Corte de generalidade: resolve o caso que dói, não a família de casos
- Aproveitamento do PARCIAL: o P3 achou 80% pronto? O escopo mínimo é o resto.

Escreva o escopo mínimo em uma frase que caiba num briefing, e diga **o que ele deliberadamente deixa de fora**.

Se o escopo mínimo for igual ao pedido, isso é uma afirmação forte: justifique por que não dá para cortar. É o único caso em que "não há versão menor" é aceitável, e ele precisa de argumento.

---

### 7. Recorrência

Quantas vezes esse mesmo pedido já apareceu? Conte no `INDICE.md` — inclusive os que passaram pela triagem.

- **Primeira vez** → `recorrencia: 1`.
- **Já foi recusado antes** → traga o motivo da recusa anterior, literal, e responda: **ele ainda vale?**

Um pedido recusado que volta pela quinta vez é sinal de que **a recusa envelheceu**. O motivo original ("só um cliente pediu") deixa de valer quando cinco pedem. Registre a mudança de contexto, não repita a recusa por inércia.

Formato:

```
recorrencia: 5
anteriores: PD-2024-0018 (nao_fazer), PD-2025-0004 (nao_fazer), PD-2025-0061 (nao_fazer)
motivo anterior: "atende so o cliente Alfa; nao generaliza"
ainda vale? NAO — hoje Beta, Gama e Delta pediram o mesmo. A premissa mudou.
```

## Formato da saída

`assets/TEMPLATE-avaliacao.md`, frontmatter `kind: avaliacao`. Uma seção por pergunta, na ordem acima, mais:

- **Achados destacados** — o que apareceu e não estava previsto (pergunta 3 negativa, decisão de produto da 2, recusa envelhecida da 7)
- **O que muda a recomendação** — insumo direto do `VEREDITO.md`

## Modo didático

Explique o raciocínio de cada pergunta e mostre o que descartou:

> Pergunta 5: considerei três saídas fora do software. Treinamento não resolve, porque o P3 mostrou que a tela não expõe o dado. Ajuste de processo não resolve, porque o cliente já faz na ordem certa. Configuração: existe o parâmetro `venda.agrupamento`, mas ele não aceita região — cheguei perto, e é isso que faz o escopo mínimo ser estender esse parâmetro em vez de criar tela nova.

## Critério de saída

- As sete perguntas respondidas, nenhuma em branco.
- Cada resposta com evidência ou com marcação explícita de dado faltante.
- Escopo mínimo preenchido (regra 6), com o que fica de fora.
- Se multi-cliente e o beneficiário for um só: as três opções registradas com custo.
- Recorrência contada, e se houver recusa anterior, o veredito sobre se ela ainda vale.

## Quando falha

| Falha | O que fazer |
|-------|-------------|
| `PRODUTO.md` incompleto demais para as perguntas 1–3 | Responda o que der, marque o resto como dependente de lacuna, e leve as perguntas ao signatário junto do veredito. Não pare o processo. |
| Não consegue achar escopo mínimo | Procure de novo com as cinco técnicas. Só depois disso "não há versão menor" é aceitável — e precisa de argumento escrito. |
| O custo de não fazer é "cliente perdido" sem fonte | Registre como **afirmação não verificada** e coloque isso em "o que muda a recomendação". Ameaça de cancelamento é o argumento mais usado e o menos verificado. |
| A avaliação está claramente indo para `nao_fazer` mas o cliente é grande | Isso não muda a avaliação. A avaliação é técnica e factual; o peso comercial entra na **assinatura**, que é humana. Registre o fato do porte do cliente como fator e deixe a decisão para quem assina. |
