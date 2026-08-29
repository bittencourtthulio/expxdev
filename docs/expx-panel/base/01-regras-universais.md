# Regras universais do expx-schema v1

> Fonte primária deste arquivo: o contrato. Onde o contrato e os schemas das skills divergem, a divergência está registrada em `00-LACUNAS.md` e NÃO foi resolvida aqui.

## Contrato de entrada

O painel recebe um caminho de pasta (`--dir`, padrão `./docs`) e varre arquivos `.md`. Cada arquivo pode ou não ter um bloco de frontmatter YAML.

As nove regras que todo arquivo com frontmatter obedece (`docs/contrato/CONTRATO-expx-schema-v1.md:9-21`):

1. O bloco YAML é a primeira coisa do arquivo, delimitado por `---` antes e depois.
2. Toda chave em `snake_case`, minúscula, sem acento.
3. Todo valor de enum em minúscula e sem acento: `concluida`, nunca `Concluída`.
4. Datas em ISO `AAAA-MM-DD`.
5. Booleanos `true`/`false`, sem aspas (regra 5 do contrato; a nota "sem aspas" aparece nos schemas das skills, `sprintx/references/00-schema.md:29`).
6. Lista vazia é `[]`. Valor ausente é `null`. **Nunca omitir a chave** — o painel diferencia "não se aplica" de "esqueceram de escrever".
7. O frontmatter é a única fonte para o painel. A prosa abaixo dele é para humano e pode dizer o que quiser.
8. Campos de texto no YAML são de uma linha.
9. `atualizado_em` é reescrito a cada gravação do arquivo.

## Contrato de saída

O parser devolve, para cada arquivo lido, um de dois resultados — nunca uma exceção:

- **aceito**: objeto tipado com o `kind` identificado e os campos validados.
- **rejeitado**: registro com caminho do arquivo, motivo da rejeição e, quando disponível, a linha.

## Limites e cotas

- `expx_schema` vale `1` nesta versão do contrato. Não há outro valor documentado.
- Nenhum limite de tamanho de arquivo, de quantidade de trabalhos, de tasks por sprint ou de profundidade de pasta é declarado: `NÃO DOCUMENTADO` em todas as três fontes.
- Nenhum encoding é declarado explicitamente: `NÃO DOCUMENTADO`. Os arquivos observados estão em UTF-8.

## Erros conhecidos e tratamento

O contrato define uma única regra de tratamento, na seção "Onde o painel procura" (`docs/contrato/CONTRATO-expx-schema-v1.md:279`):

> Arquivo sem frontmatter válido é ignorado e reportado como "fora do schema", nunca causa crash do parser.

Casos que o painel precisa tratar sem derrubar o servidor, derivados das regras acima:

| Condição | Origem da regra | Tratamento documentado |
|---|---|---|
| YAML sintaticamente inválido | contrato:279 | rejeição "fora do schema" |
| Ausência de bloco frontmatter | contrato:279 | rejeição "fora do schema" |
| `kind` desconhecido | contrato:279 | rejeição "fora do schema" |
| Valor fora do enum | contrato:279 | rejeição "fora do schema" |
| Chave omitida (viola regra 6) | contrato:14 | `NÃO DOCUMENTADO` se é rejeição ou violação de método — ver lacuna L-05 |
| `expx_schema` maior que 1 | `NÃO DOCUMENTADO` no contrato | ver lacuna L-06; a exigência veio do pedido da feature, não da fonte |

## Riscos para a nossa implementação

- A regra 6 ("nunca omitir a chave") cria duas classes de erro que o contrato não distingue: arquivo que o painel **rejeita** e arquivo que o painel **aceita mas marca como violação do método**. A tela de conformidade e a tela de "fora do schema" são telas diferentes; sem essa distinção definida, um mesmo arquivo pode cair nas duas ou em nenhuma. Lacuna L-05.
- A regra 3 exige enum sem acento, mas o contrato usa `titulo: Exportação de relatórios em CSV` e `titulo: Fundação` nos próprios exemplos — acento em campo de texto livre é permitido; em enum, não. O parser precisa aplicar a normalização apenas nos campos de enum, nunca nos de texto.
- A regra 1 exige o bloco YAML como primeira coisa do arquivo. Um BOM UTF-8 ou uma linha em branco antes do `---` quebra essa condição literalmente. Comportamento `NÃO DOCUMENTADO` — lacuna L-07.

## Fonte

- `docs/contrato/CONTRATO-expx-schema-v1.md:9-21` (regras universais) e `:279` (regra de descoberta) — acessado em 2026-08-29
- `~/.claude/skills/sprintx/references/00-schema.md:17-30` — acessado em 2026-08-29
- `~/.claude/skills/runx/references/00-schema.md:17-30` — acessado em 2026-08-29
