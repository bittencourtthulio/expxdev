# Contrato `expx-schema` v1 e os kinds (`src/parser/esquema/`)

O que a árvore do watch pode mostrar sai daqui. É a fonte do modo degradado — quando `estado.json` está inválido, é só isto que resta.

## Contrato de entrada

Cabeçalho comum a todo arquivo de estado, quatro chaves nesta ordem: `expx_schema`, `expx_tool`, `kind`, `trabalho_id` (`CONTRATO-expx-schema-v1.md`; implementado em `src/parser/esquema/cabecalho.ts`, com `VERSAO_SUPORTADA`).

Kinds que a árvore usa, com os campos disponíveis (`src/parser/esquema/kinds.ts`):

**`orquestrador`** (`kinds.ts:70-83`) — um por trabalho, é o que define que uma pasta é um trabalho:
`titulo`, `tipo_trabalho`, `tipo_ocorrencia`, `estagio`, `status`, `criado_em`, `atualizado_em`, `concluido_em`, `sprints[]`, `caminho_critico[]`.

**`sprint`** (`kinds.ts:85-95`): `sprint_id`, `titulo`, `status`, `criterio_saida`, `fases[]`, `riscos[]`, `atualizado_em`.

**`fases`** (`kinds.ts:105-111`) → lista de `Fase` (`kinds.ts:96-104`): `id`, `titulo`, `status`, `criterio_saida`, **`paralelizavel`**, **`paralela_com[]`**, `tasks[]`.

**`tasks`** (`kinds.ts:113-119`) → lista de `Task` (`kinds.ts:46-67`): `id`, `titulo`, **`fase`**, **`status`**, `objetivo`, `arquivos`, `teste_regressao`, `teste_integracao`, `teste_funcional`, `criterio_aceite`, **`depende_de[]`**, **`paralelizavel`**, `concluida_em`, `suite`.

**`bloqueios`** (`kinds.ts:129-134`) → lista de `Bloqueio` (`kinds.ts:117-123`): `id`, `task`, `aberto_em`, `resolvido_em`, `descricao`.

Os quatro campos em negrito são exatamente o que a especificação pede para a árvore: status por task, task em andamento, dependências compactas, paralelizável agrupado. **Todos existem.**

## Contrato de saída

Enums (`src/parser/esquema/enums.ts`), todos minúsculos e sem acento por R3:

| Enum | Valores |
|---|---|
| `expx_tool` | `sprintx` \| `runx` |
| `tipo_trabalho` | `feature` \| `ocorrencia` |
| `estagio` | `f1` `f2` `f3` `f4` `f5` `f6` |
| `status` (trabalho, sprint, fase) | `nao_iniciado` \| `em_andamento` \| `bloqueado` \| `concluido` |
| `status` (task) | `pendente` \| `em_andamento` \| `concluida` \| `bloqueada` |
| `suite` | `verde` \| `vermelha` \| `nao_executada` |

**Duas distinções que o contrato marca como armadilha** e que o desenho da árvore precisa respeitar:

1. `estagio` (`f1`..`f6`) é a fase da máquina de estados do método. O id de uma **fase do plano** é `F-NN.M` (ex.: `F-01.1`) e vive em `fases:`, `fase:` e `caminho_critico:`. Namespaces distintos, apesar do "F".
2. Status de **task** usa vocabulário feminino (`concluida`, `bloqueada`); status de **trabalho, sprint e fase** usa o masculino (`concluido`, `bloqueado`). Quatro valores por enum, e só dois coincidem.

Ids (`CONVENCOES.md` R12): task `T-NN.MM`, fase `F-NN.M`, sprint `sprint-NN`, bloqueio `B-NN`, decisão `D-NN`, ocorrência `OC-AAAA-NNNN`.

## Limites e cotas

- Campos de texto são de **uma linha** (R8) — nenhum campo do frontmatter carrega parágrafo, então o truncamento em 80 colunas nunca corta prosa longa vinda do YAML.
- `arquivos` da task tem **duas formas aceitas** (lacuna L-04 do painel, decisão D-01): lista plana ou `{cria, altera}`. `Arquivos` (`kinds.ts:35-44`) normaliza as duas para o mapa.
- Nenhum caminho absoluto em nenhum valor (R10).
- Prosa em português com acento; identificadores sem acento (R13). **Títulos e objetivos têm acento** — relevante para cálculo de largura em terminal, ver Riscos.

## Erros conhecidos e tratamento

- **Chave omitida é violação, não rejeição** (R6, e a decisão da lacuna L-05). O arquivo continua sendo lido e aparece com o defeito à vista. A justificativa no contrato: "rejeitar faria o trabalho sumir da tela justamente quando ele tem um problema — o oposto do que o painel serve para fazer". **É exatamente o comportamento que a tolerância a falha do watch pede** para frontmatter inválido: mostrar o que deu para ler, marcar o resto como fora do schema.
- Campo ausente **não** é preenchido com padrão em silêncio: um `[]` do arquivo e um `[]` inventado pelo leitor são coisas diferentes (R6, segunda consequência).
- `teste_integracao`, `teste_funcional` e `criterio_aceite` são `.nullable().optional()` no zod (`kinds.ts:59-61`) por decisão D-03/D-04: a ausência vira violação, não rejeição.
- BOM é tolerado na entrada; linha em branco antes do `---` invalida o bloco (R1, R14).

## Riscos para a nossa implementação

1. **O modo degradado perde o cabeçalho quase inteiro.** Sem `estado.json`, o plano dá `titulo`, `estagio`, `status` e a contagem de tasks — mas **não** dá `raio`, `orcamento_arquivos`, `orcamento_linhas`, `branch` nem `pr_estado`. Nenhum kind os declara. Ver `estado-json.md`, risco 2.

2. **"Qual é o trabalho atual" não existe no plano.** O `estado.json` responde isso com o campo `trabalho`. O plano tem N trabalhos, cada um com `status`, e nada marca um como "o atual". No modo degradado o watch precisa de um critério derivado — `status: em_andamento`, ou `atualizado_em` mais recente. **Nenhuma fonte do método afirma qual.** Ver lacuna L-01.

3. **Acento conta caractere, não coluna.** R13 garante acento em `titulo`, `objetivo` e `detalhe`. Em UTF-8 com NFC, `ç` é um code point e uma coluna, então `String.length` funciona; em NFD (comum em nomes vindos do macOS) o mesmo `ç` são dois code points e uma coluna, e o truncamento em 80 colunas erraria. `NÃO DOCUMENTADO` qual normalização os arquivos usam.

4. **`status` masculino e feminino não são intercambiáveis.** Uma função de cor por status que aceite `string` casaria `concluido` e `concluida` por engano ou deixaria um dos dois sem cor. Os tipos zod já separam os dois enums; convém não achatá-los.

5. **`caminho_critico` mistura ids de fase e de task** (`CONTRATO-expx-schema-v1.md`, seção do orquestrador: "lista ids de fase (`F-NN.M`) e/ou de task (`T-NN.MM`)"). Um destaque de caminho crítico na árvore precisa casar contra os dois namespaces.

## Fonte

`docs/contrato/CONTRATO-expx-schema-v1.md` (296 linhas), `docs/contrato/CONVENCOES.md` (165 linhas, R1–R14), `src/parser/esquema/kinds.ts`, `src/parser/esquema/enums.ts`, `src/parser/esquema/cabecalho.ts` — lidos em 2026-08-30
