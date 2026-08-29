# kind `tasks` — `sprint-NN/tasks.md`

> O arquivo mais importante para o painel (`docs/contrato/CONTRATO-expx-schema-v1.md:118`). Alimenta o detalhe do trabalho, as barras de progresso, o grafo de dependências e a maior parte da tela de conformidade.

## Contrato de entrada

Cabeçalho do arquivo:

| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| `expx_schema` | inteiro | sim | `1` |
| `expx_tool` | enum | sim | `sprintx` \| `runx` |
| `kind` | literal | sim | `tasks` |
| `trabalho_id` | string | sim | slug (sprintx) ou OC-ID (runx) |
| `sprint_id` | string | sim | `sprint-NN` |
| `atualizado_em` | data | sim | `AAAA-MM-DD` |
| `tasks` | lista | sim | `[]` se vazia |

Cada item de `tasks`:

| Campo | Tipo | Obrigatório | Valor quando não se aplica |
|---|---|---|---|
| `id` | string `T-NN.MM` | sim | — |
| `titulo` | string uma linha | sim | — |
| `fase` | string `F-NN.M` | sim | — |
| `status` | enum task | sim | — |
| `objetivo` | string uma linha | sim | — |
| `arquivos` | **ver divergência abaixo** | sim | — |
| `teste_regressao` | string \| null | **ver divergência abaixo** | `null` |
| `teste_integracao` | string NÃO VAZIA | sim | nunca null |
| `teste_funcional` | string NÃO VAZIA | sim | nunca null |
| `criterio_aceite` | string uma linha | sim | — |
| `depende_de` | lista de ids | sim | `[]` |
| `paralelizavel` | booleano | sim | — |
| `concluida_em` | data \| null | sim | `null` enquanto não `concluida` |
| `suite` | enum suite | sim | `nao_executada` até rodar |

### DIVERGÊNCIA CRÍTICA — o campo `arquivos`

As fontes discordam sobre a forma deste campo:

- **Contrato** (`docs/contrato/CONTRATO-expx-schema-v1.md:135`): lista plana de strings.
  ```yaml
  arquivos: [src/config/env.ts, src/config/env.test.ts]
  ```
- **sprintx** (`~/.claude/skills/sprintx/references/00-schema.md:157-159`) e **runx** (`~/.claude/skills/runx/references/00-schema.md:218-220`): mapa com `cria` e `altera`.
  ```yaml
  arquivos:
    cria: [src/config/env.ts, src/config/env.test.ts]
    altera: []
  ```

As duas skills concordam entre si e discordam do contrato. Como as skills são quem **escreve** os arquivos, o painel encontrará no disco a forma de mapa. Registrado como lacuna L-04 — decisão do usuário, não do planejamento.

### DIVERGÊNCIA — o campo `teste_regressao`

- **Contrato**: aparece no exemplo do kind `tasks` sem qualificar quando é obrigatório; o exemplo é de um trabalho `sprintx` e traz `teste_regressao: null`.
- **sprintx** (`00-schema.md:150-170`): o campo **não existe** na lista de campos da task. O texto diz "EXATAMENTE os mesmos campos do Contrato da Task do SKILL.md — nenhum a mais, nenhum a menos". O `SKILL.md` da sprintx não lista `teste_regressao`.
- **runx** (`00-schema.md:239-240`): "OBRIGATÓRIO na primeira task da primeira fase quando `tipo_ocorrencia: bug`, e `null` em todas as demais tasks. A chave está sempre presente."

Consequência direta para a tela de conformidade: a violação "bug cuja primeira task não tem teste_regressao" só se aplica a trabalhos `expx_tool: runx` com `tipo_ocorrencia: bug`. Aplicá-la a trabalhos sprintx produziria violação falsa — o que a definição de pronto proíbe explicitamente. Registrado como lacuna L-08: se a chave deve estar presente com `null` em arquivos sprintx, ou ausente.

## Contrato de saída

O parser devolve a lista de tasks tipada, cada uma com `sprint_id` e `trabalho_id` herdados do cabeçalho do arquivo, mais a linha de origem no arquivo para permitir que a tela de conformidade aponte arquivo e linha.

## Limites e cotas

`NÃO DOCUMENTADO`: número máximo de tasks por arquivo, profundidade da cadeia `depende_de`, tamanho máximo dos campos de texto.

## Erros conhecidos e tratamento

Regras duras declaradas pelas duas skills, idênticas (`sprintx:229-236`, `runx:232-245`):

- `teste_integracao` e `teste_funcional` são obrigatórias e NÃO VAZIAS. "O painel usa a ausência delas como violação do método" — o texto diz **violação**, não rejeição. É a evidência mais forte de que existem duas classes de erro (ver L-05).
- `concluida_em` é `null` enquanto a task não estiver `concluida`.
- `suite` é `nao_executada` até a suíte rodar; depois `verde` ou `vermelha`.

Violações da tela de conformidade que nascem deste kind (do pedido da feature):

| Violação | Como detectar no frontmatter |
|---|---|
| task sem `teste_integracao` ou `teste_funcional` | campo ausente, `null`, ou string vazia/só espaços |
| task `concluida` com `suite` diferente de `verde` | `status == concluida && suite != verde` |
| task `paralelizavel: true` com `depende_de` não vazio | `paralelizavel == true && depende_de.length > 0` |
| bug cuja primeira task não tem `teste_regressao` | só quando `expx_tool == runx && tipo_ocorrencia == bug`; "primeira task" = ver L-09 |

## Riscos para a nossa implementação

- **`arquivos` em duas formas** (L-04): um parser que espere só uma das formas rejeita metade dos arquivos reais ou perde o dado. O parser precisa aceitar as duas e normalizar, ou rejeitar explicitamente uma delas — não pode falhar silenciosamente.
- **"primeira task" não é definida** (L-09): a runx diz "primeira task da primeira fase". Ordem por id (`T-01.01`), por posição na lista YAML, ou pela fase declarada primeiro em `fases:`? As três podem divergir. Uma escolha errada gera violação falsa num bug legítimo.
- **`teste_integracao` vazio vs. ausente**: a regra 6 diz que a chave nunca é omitida; a regra deste kind diz que o valor nunca é vazio. São dois erros distintos que a tela de conformidade provavelmente deve mostrar igual, mas o parser precisa distinguir para dar mensagem correta.
- **Task referenciando fase inexistente**: `fase: F-09.9` sem entrada correspondente em `fases.md`. Nenhuma fonte declara tratamento. `NÃO DOCUMENTADO` — L-10.
- **`depende_de` apontando task inexistente ou ciclo**: nenhuma fonte declara tratamento; a visualização de dependências trava num ciclo se implementada ingenuamente. `NÃO DOCUMENTADO` — L-11.

## Fonte

- `docs/contrato/CONTRATO-expx-schema-v1.md:116-146` — acessado em 2026-08-29
- `~/.claude/skills/sprintx/references/00-schema.md:150-170,229-236` — acessado em 2026-08-29
- `~/.claude/skills/runx/references/00-schema.md:199-245` — acessado em 2026-08-29
