# kinds `sprint` e `fases` — `sprint-NN/sprint.md` e `sprint-NN/fases.md`

## Contrato de entrada

### `kind: sprint`

| Campo | Tipo | Obrigatório | Valor quando não se aplica |
|---|---|---|---|
| cabeçalho comum | — | sim | — |
| `sprint_id` | string `sprint-NN` | sim | — |
| `titulo` | string uma linha | sim | — |
| `status` | enum trabalho/sprint/fase | sim | — |
| `criterio_saida` | string uma linha | sim | — |
| `fases` | lista de ids de fase | sim | `[]` |
| `riscos` | lista de strings uma linha | sim | `[]` |
| `atualizado_em` | data | sim | — |

`riscos` é lista de strings de uma linha; sem riscos registrados, `[]` (`sprintx:145`, `runx:190`).

### `kind: fases`

| Campo | Tipo | Obrigatório | Valor quando não se aplica |
|---|---|---|---|
| cabeçalho comum | — | sim | — |
| `sprint_id` | string | sim | — |
| `atualizado_em` | data | sim | — |
| `fases` | lista | sim | `[]` |

Cada item de `fases`:

| Campo | Tipo | Obrigatório | Valor quando não se aplica |
|---|---|---|---|
| `id` | string `F-NN.M` | sim | — |
| `titulo` | string uma linha | sim | — |
| `status` | enum trabalho/sprint/fase | sim | — |
| `criterio_saida` | string uma linha | sim | — |
| `paralelizavel` | booleano | sim | — |
| `paralela_com` | lista de ids de fase | sim | `[]` |
| `tasks` | lista de ids de task | sim | `[]` |

`paralela_com` lista os ids das fases que rodam em paralelo com esta; "nenhuma" na prosa corresponde a `[]` no YAML, com `paralelizavel: false` (`sprintx:167-168`, `runx:196-197`).

Ambos os kinds são idênticos campo por campo nas duas skills; a única diferença é o valor de `expx_tool` e a forma do `trabalho_id`.

## Contrato de saída

O parser devolve as sprints de um trabalho e, dentro de cada uma, as fases, cada uma com a lista de ids de task que a compõem. As barras de progresso por fase e por sprint são calculadas a partir do `status` das tasks referenciadas — não existe campo de progresso no frontmatter.

## Limites e cotas

`NÃO DOCUMENTADO`: número de fases por sprint, de sprints por trabalho, de tasks por fase.

## Erros conhecidos e tratamento

Violações da tela de conformidade que nascem destes kinds (do pedido da feature):

| Violação | Como detectar |
|---|---|
| fase ou sprint sem `criterio_saida` | campo ausente, `null` ou string vazia/só espaços |

## Riscos para a nossa implementação

- **A lista `tasks` da fase e o campo `fase` da task são duas declarações do mesmo vínculo** e podem discordar: uma task pode declarar `fase: F-01.2` sem constar na lista `tasks` de `F-01.2`, e vice-versa. Nenhuma fonte declara qual das duas é autoritativa. Isso muda o denominador da barra de progresso. `NÃO DOCUMENTADO` — L-16.
- **`paralela_com` deveria ser simétrico** — se `F-01.1` roda em paralelo com `F-01.2`, o inverso também vale — mas nada obriga a simetria no arquivo. Assimetria não é declarada como erro. `NÃO DOCUMENTADO`.
- **A lista `fases` da sprint pode discordar do conteúdo de `fases.md`** da mesma pasta, pelo mesmo motivo do primeiro item.
- **A descoberta de sprints não é declarada.** O contrato mostra o caminho `sprint-NN/sprint.md` mas não diz se o painel enumera as pastas do disco ou confia na lista `sprints` do `ORQUESTRADOR.md`. Uma pasta `sprint-03/` no disco e ausente da lista do orquestrador tem tratamento `NÃO DOCUMENTADO` — L-17.
- **`criterio_saida` só de espaços** passa numa verificação de "chave presente" mas viola o método. A verificação precisa ser de conteúdo, não de presença.

## Fonte

- `docs/contrato/CONTRATO-expx-schema-v1.md:77-114` — acessado em 2026-08-29
- `~/.claude/skills/sprintx/references/00-schema.md:124-168` — acessado em 2026-08-29
- `~/.claude/skills/runx/references/00-schema.md:172-197` — acessado em 2026-08-29
