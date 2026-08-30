# P5 — Veredito e briefing

Produz `VEREDITO.md` e, quando couber, `BRIEFING.md`.

## Pré-requisitos

- `03-avaliacao.md` existe **ou** o P3 deu `EXISTE` (nesse caso o veredito é `ja_existe` e o P4 não rodou).
- Nenhuma pergunta essencial em aberto no P2.

## Os quatro vereditos

Três dos quatro **encerram o pedido sem gerar trabalho**. Essa é a razão de o prodx existir.

### `ja_existe`

O sistema já faz. Vem do P3 com desfecho EXISTE.

Sai um **texto de resposta ao cliente** explicando onde e como, na linguagem dele. Use `assets/TEMPLATE-resposta-cliente.md`.

Registre também, no veredito, se o caso revelou **problema de descoberta** — funcionalidade que existe e ninguém acha é um achado de produto, e três desses no mesmo módulo justificam um pedido próprio.

### `nao_fazer`

Com o motivo registrado. **Este arquivo é ativo permanente**: quando o pedido voltar — e ele volta — a avaliação já está feita.

O motivo precisa ser:

- **Datado**: o que era verdade em 2026 pode não ser em 2027.
- **Falseável**: "atende só o cliente Alfa" pode ser verificado depois. "Não faz sentido" não.
- **Ligado a uma premissa**: escreva qual fato, se mudar, derruba a recusa. Isso é o campo "o que muda a recomendação".

Regra 9: pedido recusado nunca é apagado.

### `fazer_outra_coisa`

O problema real reformulado, que costuma ser menor e diferente do pedido.

Vem tipicamente de:

- P2, quando a pergunta estruturante mostrou que a solução pedida não era o requisito
- P3 com EXISTE PARCIAL, onde o que falta é bem menor que o pedido
- P4 pergunta 5, quando existe solução fora do software

**Gera briefing**, do problema reformulado — nunca do pedido original. Deixe explícito no texto ao cliente o que mudou e por quê: cliente que pediu A e recebe B sem explicação registra reclamação.

### `fazer`

E aí sai o briefing, com o **escopo mínimo** do P4 — não com o pedido original.

## Conteúdo obrigatório do VEREDITO.md

Use `assets/TEMPLATE-VEREDITO.md`, frontmatter `kind: veredito`. Sempre traz:

1. **A recomendação** — um dos quatro vereditos
2. **O raciocínio em três linhas** — três, não dez. Se não cabe em três, a avaliação não convergiu.
3. **A evidência principal** — a única evidência que, sozinha, sustenta a recomendação
4. **O que muda a recomendação se for descoberto** — o campo mais importante para o futuro
5. **Campo de assinatura humana** — quem aprovou e quando

O frontmatter carrega: `veredito`, `via`, `gatilhos_disparados`, `aprovado_por`, `aprovado_em`, `provisorio`, `trabalho_gerado`, `recorrencia`.

## Procedimento de assinatura

**Regra 1: a skill não decide. Regra 2: nada segue sem assinatura.**

### O que a skill faz

- Preenche tudo, menos `aprovado_por` e `aprovado_em`.
- Deixa os dois campos com o valor literal `PENDENTE`.
- Apresenta a recomendação ao humano, com força — recomendar com convicção é o trabalho; assinar não é.
- Diz **quem** deve assinar: o signatário registrado no `PRODUTO.md`, pelo nome, marcando se é provisório.

### O que a skill nunca faz

- Preencher `aprovado_por` com o próprio nome, com "skill", com o nome do dev que rodou, ou com qualquer valor que não tenha sido dado explicitamente por uma pessoa para este veredito.
- Gerar `BRIEFING.md` com `aprovado_por: PENDENTE`. **Isso é bloqueio duro.**
- Interpretar "pode seguir" dito sobre outro pedido como assinatura deste.

### Como a assinatura acontece

A pessoa responde no chat, ou edita o arquivo. Ao receber a aprovação explícita, a skill preenche:

```yaml
aprovado_por: "Marcos Vieira"
aprovado_em: 2026-03-04
provisorio: true    # o signatario ainda e provisorio no PRODUTO.md
```

Se quem aprovou **não é** o signatário do `PRODUTO.md`, registre quem foi e sinalize a divergência. Não recuse — registre.

### Assinatura no caminho da triagem

Pedido aprovado na triagem também precisa de assinatura (regra 2), mas ali é **uma confirmação de uma linha, não uma cerimônia**:

> Triagem PD-2026-0031, veredito `fazer`, destino runx. Confirma?

Um "ok" do dev basta e vira `aprovado_por` na linha do `INDICE.md`. Exigir mais que isso para aprovar a correção de um rótulo é o atrito que mata a adoção.

## Modo didático vs. conciso

### Didático — padrão nesta casa

Vale **apenas na avaliação completa**. Na triagem a skill é seca.

Explique o raciocínio de cada etapa enquanto trabalha, mostre o que considerou e descartou, e diga por que aquela pergunta importa. A skill está ensinando um método que ninguém no time pratica ainda.

Na apresentação do veredito, o modo didático acrescenta:

> **Por que este veredito e não os outros três:**
> Não é `ja_existe` porque o P3 achou só o agrupamento por filial, e região não é filial — a evidência está em `routes/vendas.rb:44`.
> Não é `nao_fazer` porque três clientes pediram o mesmo em seis meses e isso serve ao objetivo de reduzir exportação manual.
> É `fazer_outra_coisa` e não `fazer` porque o pedido era tela nova e o escopo mínimo é estender um parâmetro que já existe — um décimo do trabalho, mesmo resultado para o usuário.

### Conciso

A skill passa a ser concisa também na avaliação quando **as duas condições** forem verdadeiras:

- o `PRODUTO.md` declara signatário com `provisorio: false`
- o `INDICE.md` tem **mais de trinta** pedidos avaliados

O método já pegou; a aula virou ruído. No modo conciso: só o veredito, o raciocínio em três linhas, a evidência e o pedido de assinatura.

Verifique as duas condições antes de escolher o modo, e diga qual modo está usando quando ele mudar pela primeira vez.

## Texto de resposta ao cliente — veredito `ja_existe`

Regra: o prodx **produz** o texto; quem envia é o atendimento.

O texto obedece a quatro regras:

1. **Sem jargão técnico.** Nada de rota, tabela, endpoint, deploy, parâmetro. O cliente não sabe nem precisa saber.
2. **Caminho de menu completo**, do jeito que ele vê na tela.
3. **Sem repreensão.** Nunca "como já informamos", "conforme o manual", "essa funcionalidade sempre existiu". O cliente não achou porque estava difícil de achar — isso é problema do produto.
4. **Com porta aberta**: se não for exatamente o que ele precisa, ele deve poder dizer.

Estrutura, em `assets/TEMPLATE-resposta-cliente.md`:

> Olá, [nome].
> Sobre [o que ele pediu, nas palavras dele]: isso já está disponível no sistema.
> O caminho é: [Menu > Submenu > Tela]. Lá você [o que fazer para chegar ao resultado].
> [Uma linha sobre a diferença, se o que existe não for idêntico ao pedido.]
> Se não for bem isso que você precisa, me diga o que ficou faltando que a gente avalia.

## O BRIEFING.md

Gerado **apenas** quando o veredito for `fazer` ou `fazer_outra_coisa`, **e** `aprovado_por` estiver preenchido.

Escrito no formato que o destino espera:

| Classificação | Destino | Formato |
|---------------|---------|---------|
| `novo`, `melhoria` | **sprintx** | briefing de feature, entrada da F1 |
| `correcao` | **runx** | briefing de ocorrência, vira `00-OCORRENCIA.md` |

### Conteúdo

1. **O problema** — não a solução pedida (regra 4)
2. **O escopo mínimo aprovado** — o do P4, literal
3. **O que está explicitamente fora**
4. **Critérios de aceite do ponto de vista do negócio** — o que o usuário consegue fazer que não conseguia
5. **Link para o veredito** — PD-ID e caminho do arquivo

### Regra 10 — o briefing nunca contém decisão técnica

Arquitetura, camada, tecnologia, nome de tabela, biblioteca, padrão de projeto: tudo isso é do sprintx e do runx.

- Errado: "criar endpoint `/vendas/regiao` que agrega por `cliente.regiao_id` com cache."
- Certo: "o usuário do perfil gerente precisa ver o total vendido separado por região, no mesmo relatório em que hoje vê por filial."

Se o briefing menciona arquivo, tabela ou tecnologia, reescreva. A única exceção é citar **onde o problema aparece** como referência para quem vai investigar — e isso vai numa seção separada, marcada como contexto, não como instrução.

### Briefing de uma linha — caminho da triagem

Pedido aprovado na triagem entrega **um briefing de uma linha, não um documento**:

```
PD-2026-0031 | correcao | botao Salvar desalinhado no mobile na tela de pedido | aprovado por: Thulio, 2026-03-04 | runx
```

Isso vai direto no `INDICE.md` e serve de entrada para o runx. Nenhum arquivo é criado.

## Critério de saída

- `VEREDITO.md` existe com os cinco elementos obrigatórios.
- `aprovado_por` e `aprovado_em` estão como `PENDENTE` ou preenchidos por pessoa.
- Se `ja_existe`: o texto de resposta ao cliente está escrito e sem jargão.
- Se `nao_fazer`: o motivo é datado, falseável e ligado a uma premissa.
- `BRIEFING.md` só existe se assinado, e não contém decisão técnica.
- A linha do `INDICE.md` foi atualizada com veredito e trabalho gerado.

## Quando falha

| Falha | O que fazer |
|-------|-------------|
| O humano pede o briefing sem assinar | Recuse e explique em uma linha: regra 2. Ofereça assinar agora — a assinatura é uma frase, não um processo. |
| O humano discorda do veredito | Registre a divergência no próprio `VEREDITO.md`, com o argumento dele, e siga a decisão dele. Ele assina, ele decide. O registro da divergência é o que permite revisar depois. |
| O veredito é `nao_fazer` e não há quem comunique ao cliente | O prodx não fala com o cliente. Produza o texto e entregue ao atendimento. Registre no veredito que a comunicação está pendente. |
| Não há signatário no `PRODUTO.md` | Não deveria acontecer (regra 12). Volte ao P1 e provoque a definição antes de fechar o veredito. |
| O raciocínio não cabe em três linhas | A avaliação não convergiu. Volte ao P4 e identifique qual das sete perguntas ficou ambígua. |
