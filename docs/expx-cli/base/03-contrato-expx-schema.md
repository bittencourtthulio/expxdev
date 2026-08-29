# Contrato `expx-schema` v1 e a compatibilidade de versão

Área interna. Relevante porque o `update` precisa bloquear skill que declare schema maior que o suportado (promptcli2.md, passo 5 do update).

## Contrato de entrada

O contrato vive em `docs/contrato/CONTRATO-expx-schema-v1.md` (284 linhas) e é declarado como "a fonte da verdade quando skill e parser divergirem" (`docs/contrato/CONTRATO-expx-schema-v1.md:5`).

Cabeçalho comum de todo arquivo de estado — quatro chaves antes das específicas (`CONTRATO:41-47`):

```yaml
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: exportacao-csv-relatorios
```

Treze kinds reconhecidos pelo painel (`src/parser/esquema/cabecalho.ts:8-22`): `orquestrador`, `sprint`, `fases`, `tasks`, `bloqueios`, `decisoes`, `ocorrencia`, `causa_raiz`, `qa`, `base_indice`, `relatorio_tecnico`, `relatorio_uso`, `relatorios_indice`.

Onde o painel procura (`CONTRATO:277-283`):

```
docs/<slug>/                        ← trabalhos do sprintx
docs/manutencao/<OC-ID>-<slug>/     ← trabalhos do runx
docs/relatorios/                    ← histórico
```

## Contrato de saída

O painel declara a versão que sabe ler em DOIS lugares hoje:

- `VERSAO_SCHEMA_SUPORTADA = 1` exportada do pacote (`src/index.ts:9`)
- `VERSAO_SUPORTADA = 1` no parser, com a decisão D-09 citada (`src/parser/esquema/cabecalho.ts:5`)

Arquivo com `expx_schema` maior que o suportado é **rejeitado** com motivo próprio `VersaoFutura` = `"versao de schema futura"` (`src/parser/leitura/rejeicao.ts:21`), separado do erro genérico de esquema, "para dar a mensagem que o pedido exige em vez de um erro genérico" (`src/parser/esquema/cabecalho.ts:34-37`).

Distinção que o projeto já formalizou e que o CLI deve respeitar (`src/parser/leitura/rejeicao.ts:5-15`):

- **REJEIÇÃO** — falha de leitura, o arquivo não entra no painel.
- **VIOLAÇÃO** — o arquivo foi lido e o conteúdo desobedece uma regra do método.

## Limites e cotas

- Versão suportada atual: `1`. Não existe versão `2` publicada — `NÃO DOCUMENTADO`.
- O contrato NÃO define política de compatibilidade entre versões de schema (nem semver, nem regra de "minor compatível"). Só existe o comportamento de fato: maior que o suportado é rejeitado. Ver `00-LACUNAS.md`.

## Erros conhecidos e tratamento

Motivos de rejeição já implementados (`src/parser/leitura/rejeicao.ts:17-24`):

| Motivo | Texto |
|---|---|
| `SemFrontmatter` | `sem frontmatter valido` |
| `YamlInvalido` | `YAML invalido` |
| `KindDesconhecido` | `kind desconhecido` |
| `VersaoFutura` | `versao de schema futura` |
| `VersaoAusente` | `expx_schema ausente ou nao numerico` |
| `EstruturaInvalida` | `estrutura incompativel com o kind` |

Existe fixture dedicada a esse caso: `fixtures/projeto-ruim/docs/schema-futuro/ORQUESTRADOR.md`.

## Riscos para a nossa implementação

1. O promptcli2.md manda o update **bloquear** skill que declare `expx-schema` maior que o suportado "por este CLI e por este painel". Hoje a versão suportada está declarada em dois pontos (`src/index.ts:9` e `src/parser/esquema/cabecalho.ts:5`) que podem divergir. O CLI precisa de UMA fonte única, ou de um teste que garanta a igualdade.
2. **Onde a skill declara a versão de schema que exige?** Nada no contrato nem no código diz como uma skill anuncia isso (no `SKILL.md`? em um manifesto próprio?). Lacuna crítica — sem isso o passo 5 do update é inimplementável. Registrado em `00-LACUNAS.md`.
3. O contrato é o mesmo para `sprintx` e `runx` — o CLI empacota as duas famílias, e mudança em kind compartilhado vale para as duas.

## Fonte

`docs/contrato/CONTRATO-expx-schema-v1.md`, `src/index.ts`, `src/parser/esquema/cabecalho.ts`, `src/parser/leitura/rejeicao.ts`, `fixtures/projeto-ruim/docs/schema-futuro/` — lidos em 2026-08-29.
