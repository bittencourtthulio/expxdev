# kinds `relatorio_tecnico`, `relatorio_uso`, `relatorios_indice`, `base_indice`

## Contrato de entrada

### `kind: relatorio_tecnico` — `docs/relatorios/<pasta>/tecnico.md`

| Campo | Tipo | Obrigatório | Valor quando não se aplica |
|---|---|---|---|
| cabeçalho comum | — | sim | — |
| `titulo` | string uma linha | sim | — |
| `tipo_ocorrencia` | enum | sim | — |
| `fechado_em` | data | sim | — |
| `modulo_afetado` | lista de strings | sim | `[]` |
| `arquivos_alterados` | lista de strings | sim | `[]` |
| `testes_adicionados` | inteiro | sim | — |

`testes_adicionados` é a contagem de testes criados na ocorrência, incluindo o de regressão (`runx:307`).

### `kind: relatorio_uso` — `docs/relatorios/<pasta>/uso.md`

Mesmo cabeçalho do `relatorio_tecnico`, **SEM `arquivos_alterados` e SEM `testes_adicionados`** (`contrato:254`, `runx:322-326`). Regra dura: o arquivo destinado ao cliente não menciona código nem dentro do YAML — nenhum nome de arquivo, função, tabela ou coluna. `titulo` e `modulo_afetado` vão em linguagem de cliente.

Este é o texto que o suporte devolve ao cliente; o painel o exibe em aba separada com botão de copiar.

### `kind: relatorios_indice` — `docs/relatorios/INDICE.md`

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `expx_schema` | inteiro | sim | — |
| `expx_tool` | enum | sim | — |
| `kind` | literal | sim | — |
| `trabalho_id` | — | **NÃO** | **Único kind sem `trabalho_id`**: "o índice é do sistema inteiro, não de uma ocorrência" (`runx:344`) |
| `atualizado_em` | data | sim | — |
| `entradas` | lista | sim | `[]` |

Cada item: `data`, `oc_id`, `tipo`, `modulo` (string, singular — não lista), `resumo`, `pasta`.

`entradas` é **append-only, mais recente no topo** (`runx:345-347`). Nunca reordenar nem apagar entradas existentes.

Este kind é a exceção à regra de que o cabeçalho comum tem quatro chaves. Um validador que exija `trabalho_id` em todo arquivo rejeita o índice de relatórios, que é justamente a fonte da linha do tempo do histórico.

### `kind: base_indice` — `base/00-INDICE.md`

| Campo | Tipo | Obrigatório | Valor quando não se aplica |
|---|---|---|---|
| cabeçalho comum | — | sim | — |
| `atualizado_em` | data | sim | — |
| `areas` | lista | sim | `[]` |

Cada item: `arquivo` (nome dentro de `base/`, sem diretório), `titulo`, `lacunas` (inteiro, `0` se nenhuma). Idêntico nas duas skills.

## Contrato de saída

A linha do tempo do histórico é montada a partir de `docs/relatorios/`, ordenada por data de fechamento, com busca por módulo afetado e por tipo.

Há duas fontes possíveis para essa lista: as `entradas` do `INDICE.md` e os arquivos `tecnico.md`/`uso.md` de cada pasta. **Nenhuma fonte declara qual é autoritativa** — L-21.

Nota de campo: o histórico usa `fechado_em` (nos relatórios) e `data` (nas entradas do índice) para a mesma ideia. Nomes diferentes, e o painel ordena por "data de fechamento".

## Limites e cotas

`NÃO DOCUMENTADO`: tamanho do índice, número de entradas, número de relatórios.

## Erros conhecidos e tratamento

- Nome dos arquivos dentro de `docs/relatorios/<pasta>/`: a runx declara `tecnico.md` e `uso.md` (`:291`, `:311`); o contrato só diz `docs/relatorios/<pasta>/` sem nomear (`:238`). O painel deve descobrir por `kind` no frontmatter, não por nome de arquivo — mais robusto e compatível com as duas fontes.
- Formato do nome da pasta: `2026-08-29-OC-2026-0142-calculo-frete-divergente` (`contrato:265`). Nenhuma fonte declara que o painel deva interpretar esse nome; o campo `pasta` da entrada do índice o repete.

## Riscos para a nossa implementação

- **`relatorios_indice` sem `trabalho_id`** (documentado): o validador precisa tratar o cabeçalho comum como três chaves obrigatórias + `trabalho_id` condicional ao kind. Aplicar as quatro cegamente rejeita o índice.
- **`modulo` singular no índice vs. `modulo_afetado` lista nos relatórios**: a busca "por módulo afetado" pedida na feature precisa decidir se casa contra um ou outro. Um relatório com dois módulos tem uma entrada de índice com qual deles?  `NÃO DOCUMENTADO` — L-22.
- **`relatorio_uso` não pode vazar código** é uma regra do método verificável mecanicamente (procurar caminhos de arquivo no YAML), mas não consta da lista de violações da v1. Fora de escopo.
- **Divergência entre `INDICE.md` e as pastas reais** (L-21): uma pasta de relatório sem entrada no índice fica invisível na linha do tempo se o painel confiar só no índice, e o índice é append-only mantido pela skill — pode ficar defasado.

## Fonte

- `docs/contrato/CONTRATO-expx-schema-v1.md:222-268` — acessado em 2026-08-29
- `~/.claude/skills/runx/references/00-schema.md:291-350` — acessado em 2026-08-29
- `~/.claude/skills/sprintx/references/00-schema.md:214-227` — acessado em 2026-08-29
