# P0 — Triagem

Decide quanto processo aplicar a um pedido. Dura segundos. **Não gera pasta.**

Esta é a etapa mais importante para a adoção da skill. Se a triagem for pesada, o dev contorna o prodx inteiro.

## Pré-requisitos

- Nenhum obrigatório. A triagem roda mesmo sem `PRODUTO.md`.
- Se `docs/produto/PRODUTO.md` não existir, triar mesmo assim e avisar em uma linha que o P1 está pendente. Não bloquear o chamado do dev por causa disso.
- Se `docs/produto/INDICE.md` não existir, criar a partir de `assets/TEMPLATE-INDICE.md` antes de escrever a primeira linha.

## Passo a passo

### 1. Leia o pedido cru

Não reescreva ainda. Guarde o texto literal — ele vai para o `INDICE.md` (resumido) ou para o `01-pedido.md` (integral).

### 2. Rode os oito gatilhos, em ordem

Para cada um, a resposta é **sim** ou **não**, nunca "talvez". Se você não consegue decidir com o que está na frente, a resposta é **sim** — na dúvida, avalia.

### 3. Conte

- **Zero gatilhos** → veredito direto. Escreva a linha no `INDICE.md`, dê o veredito, aponte o destino (normalmente runx). Fim.
- **Um ou mais** → avaliação completa. Crie a pasta `docs/produto/pedidos/<PD-ID>-<slug>/` e vá para o P2.

### 4. Registre

Sempre uma linha no `INDICE.md`, nos dois casos. A triagem nunca é silenciosa.

## Os oito gatilhos

Cada gatilho abaixo é verificável: dá para responder olhando o texto do pedido, o `PRODUTO.md` ou o `INDICE.md`, sem investigação.

---

### G1 — Pedido do tipo `novo`, ou pede tela, relatório ou fluxo novo

**Como verificar:** o pedido nomeia um artefato que não aparece no mapa de funcionalidades do `PRODUTO.md`? Contém as palavras tela, relatório, fluxo, módulo, cadastro, dashboard, integração — referindo-se a algo inexistente?

- **Dispara:** "Precisamos de um dashboard de indicadores para a diretoria."
- **Não dispara:** "O relatório de comissões está somando errado o mês de fevereiro." (É correção em relatório existente.)

---

### G2 — O pedido descreve uma solução, não um problema

**Como verificar:** o pedido diz **o que fazer** em vez de **o que dói**? Teste: remova a solução da frase. Sobra um problema? Se não sobra nada, o cliente entregou só a solução.

- **Dispara:** "Coloca um campo de observação na tela de pedido." (O que dói? Não está dito.)
- **Não dispara:** "Quando o cliente pede desconto acima de 10%, não temos onde registrar por que foi concedido, e a auditoria cobra isso." (Problema explícito.)

---

### G3 — O pedido serve a um cliente só, num produto multi-cliente

**Como verificar:** o `PRODUTO.md` declara modelo `produto_unico_multi_cliente`? O pedido veio de um cliente e usa regra, nomenclatura ou processo específico dele?

- **Dispara:** "O cliente Alfa quer que o campo CNPJ aceite o formato interno de código deles."
- **Não dispara:** "O CNPJ está aceitando 13 dígitos." (Regra geral, vale para todos.)

Se o modelo de negócio for instalação por cliente ou customização por contrato, este gatilho não se aplica — registre isso e siga.

---

### G4 — O pedido cheira a algo que já existe no sistema

**Como verificar:** busque os substantivos principais do pedido no mapa de funcionalidades do `PRODUTO.md` e no índice do memox. Bateu alguma coisa parecida? Dispara.

- **Dispara:** "Queria uma listagem de vendas separada por região." (Existe "Relatório gerencial de vendas" no mapa.)
- **Não dispara:** "Aumentar o tamanho do campo de descrição para 500 caracteres."

Este gatilho é barato e paga sozinho o custo da triagem. Na dúvida, dispare.

---

### G5 — Pedido rotulado como bug mas que descreve regra de negócio

**Como verificar:** o pedido diz "está errado" / "deveria" sobre um **cálculo, prazo, permissão, bloqueio ou validação**, em vez de sobre um erro técnico (tela quebrada, botão sem ação, erro 500)?

- **Dispara:** "Bug: o sistema não deixa faturar pedido com estoque negativo." (Isso pode ser trava intencional.)
- **Não dispara:** "Bug: ao clicar em salvar dá erro 500 e nada é gravado."

Regra 7: corrigir regra de negócio deliberada quebra o processo de outro cliente, e o runx não teria como saber.

---

### G6 — O pedido toca zona de risco declarada no `PERFIL.md` do legadox

**Como verificar:** existe `PERFIL.md` do legadox? Ele lista zonas de risco (módulos, tabelas, rotinas)? O pedido menciona alguma?

- **Dispara:** "Ajustar o fechamento contábil para considerar a nova alíquota." (Fechamento está declarado como zona de risco.)
- **Não dispara:** "Trocar o texto do botão de Gravar para Salvar."

Sem `PERFIL.md`, este gatilho é **não** e isso fica registrado. Ausência do legadox nunca bloqueia.

---

### G7 — O mesmo pedido já foi recusado antes

**Como verificar:** busque no `INDICE.md` por termos do pedido e por veredito `nao_fazer`. Achou equivalente?

- **Dispara:** "Cliente Beta pediu de novo a exportação para o formato antigo do ERP legado."
- **Não dispara:** pedido cujos termos não aparecem em nenhuma linha `nao_fazer`.

Quando dispara, a avaliação já começa com a recorrência contada e a recusa anterior em mãos (P4).

---

### G8 — O esforço aparente é maior que alguns dias

**Como verificar:** julgamento grosseiro, sem estimar de verdade — o prodx **não estima esforço**. A pergunta é: isso parece coisa de mais de uma semana de trabalho? Toca mais de um módulo? Muda modelo de dados?

- **Dispara:** "Queremos que o sistema passe a controlar também a frota de veículos."
- **Não dispara:** "Incluir a coluna de vendedor na grade de pedidos."

---

## Formato da linha única do INDICE.md

O `INDICE.md` é append-only. Uma linha de tabela por pedido:

```
| data | PD-ID | titulo | origem | via | veredito | motivo | trabalho_gerado |
```

- `data` — ISO, `AAAA-MM-DD`.
- `PD-ID` — `PD-<AAAA>-<NNNN>`, sequencial. Consulte a última linha do `INDICE.md` para o próximo número.
- `titulo` — curto, na linguagem de quem pediu.
- `origem` — `cliente` | `suporte` | `interno`.
- `via` — `triagem` | `avaliacao`.
- `veredito` — `ja_existe` | `nao_fazer` | `fazer_outra_coisa` | `fazer`.
- `motivo` — **uma linha**, sem ponto final longo. É o que responde "por que decidimos isso?" daqui a um ano.
- `trabalho_gerado` — `runx:<id>` | `sprintx:<id>` | `-`.

Exemplo de linha de triagem sem gatilho:

```
| 2026-03-04 | PD-2026-0031 | Botao salvar desalinhado no mobile | suporte | triagem | fazer | correcao visual sem gatilho, segue direto | runx:OC-2026-0112 |
```

Exemplo de linha de pedido que foi para avaliação:

```
| 2026-03-04 | PD-2026-0032 | Campo de observacao na tela de pedido | cliente | avaliacao | fazer_outra_coisa | problema real e registrar motivo do desconto | sprintx:FT-2026-0007 |
```

## Formato da saída da triagem (para o dev, no chat)

Seca. Sem aula. Máximo cinco linhas:

```
Triagem PD-2026-0031 — "Botao salvar desalinhado no mobile"
Gatilhos: nenhum
Veredito: fazer (correcao visual, escopo obvio)
Destino: runx
Registrado no INDICE.md. Confirme com uma linha para seguir.
```

Quando dispara:

```
Triagem PD-2026-0032 — "Campo de observacao na tela de pedido"
Gatilhos: G1 (campo/tela novo), G2 (solucao sem problema declarado)
Via: avaliacao completa
Pasta: docs/produto/pedidos/PD-2026-0032-campo-observacao-tela-pedido/
Seguindo para P2.
```

## Critério de saída

- A linha existe no `INDICE.md`.
- O veredito ou o encaminhamento está declarado.
- No caminho curto: a confirmação de uma linha do humano foi pedida (regra 2).
- No caminho longo: a pasta foi criada e o P2 começou.

## Quando falha

| Falha | O que fazer |
|-------|-------------|
| O pedido é vago demais para triar ("melhorar o sistema") | Não invente gatilho. Peça o pedido concreto — quem pediu, o que dói, em que tela. Máximo cinco perguntas. Não crie linha no INDICE ainda. |
| Não dá para saber se é bug ou regra (G5) | Dispare o gatilho. É mais barato avaliar do que corrigir regra intencional. |
| `INDICE.md` não existe | Crie do template e siga. |
| Dois pedidos chegaram juntos no mesmo texto | Separe em dois PD-ID. Um pedido, uma linha. |
| Mais da metade dos pedidos está indo para avaliação completa | Reporte isso ao dev explicitamente. Os gatilhos estão largos demais — normalmente G4 ou G8 aplicados com frouxidão. Ajuste e registre em `DECISOES-DA-SKILL.md`. |

## Proporção — o indicador

Quando perguntada sobre o estado, a skill conta as linhas do `INDICE.md` por `via` e reporta:

```
Pedidos registrados: 48
Via triagem: 37 (77%)
Via avaliacao completa: 11 (23%)
Nao viraram trabalho: 19 (40%)
```

A terceira linha é o indicador de utilidade (soma de `ja_existe`, `nao_fazer` e `fazer_outra_coisa` sobre o total). A segunda é o indicador de atrito: acima de 50%, os gatilhos precisam apertar.
