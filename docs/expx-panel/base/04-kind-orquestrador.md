# kind `orquestrador` — `ORQUESTRADOR.md`

> É a âncora da descoberta: "qualquer `ORQUESTRADOR.md` com frontmatter `kind: orquestrador` é um trabalho" (`docs/contrato/CONTRATO-expx-schema-v1.md:279`).

## Contrato de entrada

| Campo | Tipo | Obrigatório | Valor quando não se aplica |
|---|---|---|---|
| `expx_schema` | inteiro | sim | `1` |
| `expx_tool` | enum | sim | — |
| `kind` | literal | sim | `orquestrador` |
| `trabalho_id` | string | sim | slug (sprintx) ou OC-ID (runx) |
| `titulo` | string uma linha | sim | — |
| `tipo_trabalho` | enum | sim | `feature` (sprintx) \| `ocorrencia` (runx) |
| `tipo_ocorrencia` | enum \| null | sim | `null` quando `tipo_trabalho: feature` |
| `estagio` | enum | sim | `f1`..`f6` ou `e1`..`e5` |
| `status` | enum trabalho | sim | — |
| `criado_em` | data | sim | — |
| `atualizado_em` | data | sim | — |
| `concluido_em` | data \| null | sim | `null` até o trabalho inteiro estar entregue |
| `sprints` | lista de `sprint-NN` | sim | `[]` |
| `caminho_critico` | lista de ids | sim | `[]` |

Regras declaradas pelas skills:

- `tipo_ocorrencia` é `null` quando `tipo_trabalho: feature` (`sprintx:118`); na runx nunca é `null` (`runx:100-101`).
- `caminho_critico` lista ids de fase (`F-NN.M`) e/ou de task (`T-NN.MM`), na ordem da cadeia (`sprintx:119-120`, `runx:102-103`).
- `concluido_em` permanece `null` até o trabalho inteiro estar entregue (`sprintx:121`).
- `estagio` é atualizado a cada transição da máquina de estados (`runx:105`).

### DIVERGÊNCIA — formato dos ids em `caminho_critico`

- **Contrato** (`:74`): `caminho_critico: [F-01, F-03]` — duas partes.
- **sprintx** (`:105`) e **runx** (`:95`): `caminho_critico: [F-01.1]` — três partes, `F-NN.M`.

O mesmo desencontro aparece em `fases:` do kind `sprint`, em `id:` do kind `fases` e em `fase:` do kind `tasks`. As duas skills concordam no formato `F-NN.M` e o contrato usa `F-NN` em todos os exemplos. Lacuna L-12.

Isso importa porque o painel cruza esses ids entre arquivos: `caminho_critico` do orquestrador referencia ids que precisam existir em `fases.md`, e `fase:` de cada task idem. Formatos diferentes quebram o cruzamento e o destaque do caminho crítico fica vazio sem nenhum erro visível.

## Contrato de saída

Um objeto "trabalho" por `ORQUESTRADOR.md` aceito, com o caminho da pasta que o contém — a pasta é a raiz do trabalho e determina onde o parser procura `sprint-NN/`, `base/`, `00-BLOQUEIOS.md` e os kinds exclusivos da runx.

## Limites e cotas

`NÃO DOCUMENTADO`: número máximo de sprints, tamanho do caminho crítico, profundidade da pasta em que o `ORQUESTRADOR.md` pode estar.

## Erros conhecidos e tratamento

- `ORQUESTRADOR.md` sem frontmatter válido → não é um trabalho; vai para "fora do schema" (`contrato:279`).
- Pasta sem `ORQUESTRADOR.md` → não é um trabalho. O pedido da feature lista este caso nas fixtures. Nenhuma fonte declara se a pasta deve ser reportada ou ignorada em silêncio — L-13.

## Riscos para a nossa implementação

- **`estagio` vs. `status` podem se contradizer**: um trabalho `estagio: f3` com `status: concluido` é incoerente, e nenhuma fonte declara isso como inválido. Os cards de resumo agrupam por `status` e o quadro agrupa por `estagio`; a mesma incoerência produz um trabalho que aparece como concluído num lugar e em planejamento no outro. `NÃO DOCUMENTADO` — L-14.
- **A definição de "em planejamento" e "em execução" para os cards de resumo não vem do contrato.** O enum de `status` tem `nao_iniciado`, `em_andamento`, `bloqueado`, `concluido`, que não mapeiam um-para-um nos quatro cards pedidos. Mapear "planejamento" a `estagio` (f1–f5 planejam, f6 executa) é uma interpretação. L-15.
- O contrato não declara que `trabalho_id` deve bater com o nome da pasta, embora a sprintx afirme que é "o mesmo nome da pasta `docs/<slug>/`" (`sprintx:88`). Divergência entre os dois é `NÃO DOCUMENTADO`.

## Fonte

- `docs/contrato/CONTRATO-expx-schema-v1.md:56-76,270-281` — acessado em 2026-08-29
- `~/.claude/skills/sprintx/references/00-schema.md:96-122` — acessado em 2026-08-29
- `~/.claude/skills/runx/references/00-schema.md:76-106` — acessado em 2026-08-29
