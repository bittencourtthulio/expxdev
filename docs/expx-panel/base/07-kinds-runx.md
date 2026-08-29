# kinds exclusivos da runx — `ocorrencia`, `causa_raiz`, `qa`

## Contrato de entrada

### `kind: ocorrencia` — `00-OCORRENCIA.md`

| Campo | Tipo | Obrigatório | Valor quando não se aplica |
|---|---|---|---|
| cabeçalho comum | — | sim | `expx_tool: runx` sempre |
| `titulo` | string uma linha | sim | — |
| `tipo_ocorrencia` | enum | sim | nunca `null` na runx |
| `recebido_em` | data | sim | — |
| `origem` | string \| null | sim | `null` se não houver |
| `tem_reproducao` | booleano | sim | `false` quando não há passos de reprodução |
| `modulo_afetado` | lista de strings | sim | `[]` se ainda não determinado |
| `atualizado_em` | data | **DIVERGE** | ver abaixo |

**DIVERGÊNCIA — `atualizado_em`**: o contrato (`:168-180`) NÃO lista `atualizado_em` neste kind; a runx (`:110-124`) lista. Como a regra universal 6 proíbe omitir chave e a regra 9 manda reescrever `atualizado_em` a cada gravação, a ausência no contrato parece omissão do próprio contrato. Lacuna L-19.

Regras (`runx:122-124`): `origem` identifica de onde veio o chamado (ticket, canal, arquivo); `tem_reproducao` reflete o portão do E1; `modulo_afetado` é a lista de módulos em linguagem do sistema.

### `kind: causa_raiz` — `01-CAUSA-RAIZ.md`

| Campo | Tipo | Obrigatório | Valor quando não se aplica |
|---|---|---|---|
| cabeçalho comum | — | sim | — |
| `modo` | enum | sim | `causa_raiz` \| `analise_impacto` |
| `comprovada` | booleano \| null | sim | `null` quando `modo: analise_impacto` |
| `evidencia` | enum \| null | sim | `null` quando `analise_impacto` ou quando não comprovada |
| `arquivos_impactados` | lista de strings | sim | `[]` |
| `decisoes` | lista | sim | `[]` |
| `atualizado_em` | data | sim | — |

Cada item de `decisoes`: `id` (`D-NN`), `decisao`, `alternativa_descartada`, `motivo`. **Nota**: esta lista `decisoes` tem forma diferente da do kind `decisoes` da sprintx — sem `status` e sem `bloqueante`. Mesmo nome de campo, contratos distintos; o parser não pode compartilhar o mesmo tipo entre os dois.

Regras (`runx:158-163`): `modo` é `causa_raiz` quando `tipo_ocorrencia: bug`, `analise_impacto` nos demais tipos. Quando `analise_impacto`, `comprovada` e `evidencia` vão como `null`, chaves presentes. Quando `causa_raiz` e a prova não apareceu, `comprovada: false` e `evidencia: null`.

### `kind: qa` — `QA.md`

| Campo | Tipo | Obrigatório | Valor quando não se aplica |
|---|---|---|---|
| cabeçalho comum | — | sim | — |
| `veredito` | enum | sim | `aprovado` \| `reprovado` |
| `executado_em` | data | sim | — |
| `achados` | lista | sim | `[]` |
| `atualizado_em` | data | **DIVERGE** | contrato não lista, runx lista (`:281`). Lacuna L-19 |

Cada item de `achados`: `severidade` (enum), `arquivo`, `problema`, `correcao_sugerida`.

Regra dura (`runx:283-285`): existe achado de `severidade: alta` → `veredito: reprovado`, sem exceção. É uma violação mecanicamente detectável, embora não conste da lista de violações pedida para a v1.

## Contrato de saída

Estes kinds enriquecem o detalhe de um trabalho runx. `causa_raiz` e `qa` são um por ocorrência; o painel os exibe junto ao trabalho, não como entidades independentes.

## Limites e cotas

`NÃO DOCUMENTADO`.

## Erros conhecidos e tratamento

- Nenhuma fonte declara o que fazer quando um trabalho runx não tem `00-OCORRENCIA.md`, `01-CAUSA-RAIZ.md` ou `QA.md` — arquivos que só existem depois do estágio que os produz. Ausência é o estado normal em E1/E2, não um erro. O painel não deve reportar ausência como rejeição. `NÃO DOCUMENTADO` explicitamente, mas inferível da máquina de estados — L-20.
- `tipo_ocorrencia` aparece em três kinds distintos (`orquestrador`, `ocorrencia`, `relatorio_*`) para o mesmo trabalho. Discordância entre eles não tem tratamento declarado.

## Riscos para a nossa implementação

- **`comprovada` é `boolean | null`** e as três combinações com `evidencia` são significativas (comprovada, não comprovada, não se aplica). Tratar `null` como `false` apaga a distinção entre "não há causa a comprovar" e "não conseguimos comprovar".
- **A lista `decisoes` com dois formatos** (aqui e no kind `decisoes` da sprintx) é uma armadilha de tipagem: nomes iguais, campos diferentes.
- **A coerência `modo` × `tipo_ocorrencia`** (`bug` → `causa_raiz`) é uma regra da runx, mecanicamente verificável, que não está na lista de violações da v1. Fora de escopo, mas vale registrar.

## Fonte

- `docs/contrato/CONTRATO-expx-schema-v1.md:166-220` — acessado em 2026-08-29
- `~/.claude/skills/runx/references/00-schema.md:108-170,268-289` — acessado em 2026-08-29
