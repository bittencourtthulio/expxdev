# Enums do expx-schema v1

## Contrato de entrada

Valores literais que o parser aceita em cada campo de enum. Comparação feita entre as três fontes.

| Campo | Valores no contrato | Confirmação nas skills |
|---|---|---|
| `expx_tool` | `sprintx` `runx` | idêntico nas duas skills |
| `tipo_trabalho` | `feature` `ocorrencia` | idêntico nas duas skills |
| `tipo_ocorrencia` | `bug` `melhoria-ui` `melhoria-ux` `novo-relatorio` `regra-de-calculo` `campo-novo` `outro` `null` | **DIVERGE** — runx lista os mesmos 7 valores mas SEM `null` (`runx/references/00-schema.md:38`). Ver lacuna L-01 |
| `estagio` | sprintx `f1`…`f6`, runx `e1`…`e5` | sprintx declara só `f1`..`f6`; runx declara só `e1`..`e5`. O painel precisa do conjunto unificado dos 11 valores |
| `status` (trabalho, sprint, fase) | `nao_iniciado` `em_andamento` `bloqueado` `concluido` | idêntico nas duas skills |
| `status` (task) | `pendente` `em_andamento` `concluida` `bloqueada` | idêntico nas duas skills |
| `suite` | `verde` `vermelha` `nao_executada` | idêntico nas duas skills |
| `veredito` | `aprovado` `reprovado` | idêntico na runx; ausente na sprintx (kind `qa` é só runx) |
| `severidade` | `alta` `media` `baixa` | idêntico nas duas skills |
| `modo` (causa raiz) | `causa_raiz` `analise_impacto` | idêntico na runx |
| `evidencia` | `teste_falho` `log` `codigo` `null` | idêntico na runx |
| `status` (decisão) | **AUSENTE do contrato** | sprintx declara `fechada` `pendente` (`sprintx/references/00-schema.md:206`). Ver lacuna L-02 |

## Contrato de saída

Para cada campo de enum, o parser devolve o valor literal quando pertence ao conjunto, ou uma rejeição identificando o campo e o valor recebido.

## Limites e cotas

Nenhum enum é extensível. `NÃO DOCUMENTADO` qualquer mecanismo de valor customizado.

## Erros conhecidos e tratamento

Valor fora do enum → "fora do schema" (`docs/contrato/CONTRATO-expx-schema-v1.md:279`).

Dois pares de enums são visualmente parecidos e as skills alertam explicitamente contra confundi-los (`sprintx/references/00-schema.md:48-54`):

- `estagio` (`f1`..`f6`, `e1`..`e5`) é a máquina de estados do método, minúsculo, no frontmatter. **Não confundir** com o id de FASE do plano, que é `F-NN.M` e vive em `fases:`, `fase:` e `caminho_critico:`. Namespaces distintos.
- `status` de task usa vocabulário feminino (`concluida`, `bloqueada`); `status` de trabalho, sprint e fase usa masculino (`concluido`, `bloqueado`). Trocar um pelo outro é erro.

## Riscos para a nossa implementação

- O par `concluida`/`concluido` difere em uma letra e se aplica a objetos diferentes. Um validador que use um único enum de status para tudo aceita silenciosamente `concluido` numa task, e o painel mostra progresso errado sem nenhuma rejeição. O validador precisa de dois enums separados, aplicados por tipo de objeto.
- `estagio` como conjunto unificado (`f1`..`f6` + `e1`..`e5`) permite, se implementado ingenuamente, um arquivo `expx_tool: sprintx` com `estagio: e3`. Combinação incoerente que nenhuma das três fontes declara como inválida — `NÃO DOCUMENTADO`. Ver lacuna L-03.
- O quadro por estágio precisa das 11 colunas na ordem correta; a ordem `f1`→`f6` e `e1`→`e5` está implícita na numeração, não declarada como ordenação.

## Fonte

- `docs/contrato/CONTRATO-expx-schema-v1.md:23-36` — acessado em 2026-08-29
- `~/.claude/skills/sprintx/references/00-schema.md:32-54,206` — acessado em 2026-08-29
- `~/.claude/skills/runx/references/00-schema.md:32-62` — acessado em 2026-08-29
