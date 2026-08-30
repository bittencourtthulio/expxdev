# Contrato `expx-schema` v1

Este é o contrato entre as skills (`sprintx`, `runx`, `buildx`) e o painel. As skills **escrevem** este frontmatter; o painel **lê** e nunca escreve.

Guarde este arquivo no repositório do painel. Ele é a fonte da verdade sobre **os `kind`, seus campos e seus enums** quando skill e parser divergirem. As convenções que valem para todo artefato do método — nomes de chave, enums, datas, chave omitida — vêm do documento raiz [`CONVENCOES.md`](./CONVENCOES.md).

`expx_tool` aceita `sprintx`, `runx` e `buildx`: só essas três escrevem artefato de estado. Não confundir com `ferramenta`, do rastro de eventos, que aceita as oito skills — são campos de domínios diferentes.

**Dois níveis de estado.** A `sprintx` e a `runx` gravam o estado de um **trabalho**, costurado por `trabalho_id`. A `buildx` grava o estado de um **projeto**, costurado por `projeto_id` — e um projeto tem N trabalhos, um por feature do mapa. Os seis kinds da buildx são, por isso, os únicos além de `relatorios_indice` que não têm `trabalho_id`.

---

## Regras universais

As convenções valem para todo artefato do método e vivem no documento raiz
[`CONVENCOES.md`](./CONVENCOES.md), numeradas de R1 a R14. Este contrato **não as
repete** — repetir cria uma segunda fonte que envelhece.

As mais citadas por quem escreve frontmatter:

| | |
|---|---|
| **R1** | o bloco YAML é a primeira coisa do arquivo, entre `---` |
| **R2** | chave em `snake_case`, minúscula, sem acento |
| **R3** | valor de enum minúsculo e sem acento |
| **R4** | data ISO `AAAA-MM-DD`, obtida do sistema com `date +%Y-%m-%d` |
| **R5** | booleano `true`/`false`, sem aspas |
| **R6** | chave nunca omitida: `[]` para lista vazia, `null` para ausente |
| **R7** | o frontmatter é a única fonte para a máquina |
| **R8** | campos de texto são de uma linha |
| **R9** | `atualizado_em` reescrito a cada gravação |
| **R10** | nenhum caminho absoluto em nenhum valor |

Chave obrigatória ausente é **violação**, não rejeição (R6): o arquivo continua no
painel, com o defeito à vista.

## Enums

| Campo | Valores |
|---|---|
| `expx_tool` | `sprintx` · `runx` · `buildx` |
| `tipo_trabalho` | `feature` · `ocorrencia` |
| `tipo_ocorrencia` | `bug` · `melhoria-ui` · `melhoria-ux` · `novo-relatorio` · `regra-de-calculo` · `campo-novo` · `outro` · `null` |
| `estagio` | sprintx: `f1`…`f6` · runx: `e1`…`e5` · buildx: `b1`…`b6` |
| `status` (trabalho, sprint, fase) | `nao_iniciado` · `em_andamento` · `bloqueado` · `concluido` |
| `status` (task) | `pendente` · `em_andamento` · `concluida` · `bloqueada` |
| `suite` | `verde` · `vermelha` · `nao_executada` |
| `veredito` | `aprovado` · `reprovado` |
| `veredito` (buildx, kind `validacao`) | `aprovado` · `aprovado_com_pendencia` · `reprovado` |
| `modo` (buildx) | `autonomo` · `briefing` |
| `status` (feature do mapa) | `pendente` · `em_andamento` · `entregue` · `bloqueada` |
| `origem` (feature do mapa) | `descricao` · `premissa` · `recursao` |
| `classe` (pendência da recursão) | `trabalho_novo` · `replanejamento` · `decisao_humana` · `recurso_externo` |
| `severidade` | `alta` · `media` · `baixa` |
| `modo` (causa raiz) | `causa_raiz` · `analise_impacto` |
| `evidencia` | `teste_falho` · `log` · `codigo` · `null` |

## Cabeçalho comum

Todo arquivo carrega estas quatro chaves antes das específicas:

```yaml
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: exportacao-csv-relatorios
```

`trabalho_id` é o slug da feature (sprintx) ou o ID da ocorrência (runx, ex. `OC-2026-0142`). É a chave que costura tudo.

---

## Os `kind`

### `orquestrador` — `ORQUESTRADOR.md`

```yaml
---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: exportacao-csv-relatorios
titulo: Exportação de relatórios em CSV
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f3
status: em_andamento
criado_em: 2026-08-20
atualizado_em: 2026-08-29
concluido_em: null
sprints: [sprint-01, sprint-02]
caminho_critico: [F-01, F-03]
---
```

### `sprint` — `sprint-NN/sprint.md`

```yaml
---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: exportacao-csv-relatorios
sprint_id: sprint-01
titulo: Fundação
status: em_andamento
criterio_saida: Suite verde e client cobrindo os quatro endpoints
fases: [F-01, F-02]
riscos: [Rate limit nao documentado na fonte]
atualizado_em: 2026-08-29
---
```

### `fases` — `sprint-NN/fases.md`

```yaml
---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: exportacao-csv-relatorios
sprint_id: sprint-01
atualizado_em: 2026-08-29
fases:
  - id: F-01
    titulo: Config e segredos
    status: concluido
    criterio_saida: Variaveis carregadas e validadas na subida
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02]
---
```

### `tasks` — `sprint-NN/tasks.md`

O arquivo mais importante para o painel.

```yaml
---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: exportacao-csv-relatorios
sprint_id: sprint-01
atualizado_em: 2026-08-29
tasks:
  - id: T-01.01
    titulo: Carregar configuracao de ambiente
    fase: F-01
    status: concluida
    objetivo: Ler e validar as variaveis obrigatorias na subida
    arquivos: [src/config/env.ts, src/config/env.test.ts]
    teste_regressao: null
    teste_integracao: Sobe a app sem variavel obrigatoria e espera falha clara
    teste_funcional: Dado env valido, retorna objeto tipado com defaults
    criterio_aceite: App nao sobe sem as quatro variaveis obrigatorias
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
---
```

`teste_integracao` e `teste_funcional` são strings obrigatórias e não vazias. O painel usa a ausência delas como violação do método.

### `bloqueios` — `BLOQUEIOS.md` / `00-BLOQUEIOS.md`

```yaml
---
expx_schema: 1
expx_tool: runx
kind: bloqueios
trabalho_id: OC-2026-0142
atualizado_em: 2026-08-29
bloqueios:
  - id: B-01
    task: T-01.03
    aberto_em: 2026-08-29
    resolvido_em: null
    descricao: Falta credencial de sandbox para validar o webhook
---
```

### `ocorrencia` — `00-OCORRENCIA.md` (só runx)

```yaml
---
expx_schema: 1
expx_tool: runx
kind: ocorrencia
trabalho_id: OC-2026-0142
titulo: Calculo de frete divergente acima de 50kg
tipo_ocorrencia: bug
recebido_em: 2026-08-28
origem: ticket-4471
tem_reproducao: true
modulo_afetado: [frete, checkout]
---
```

### `causa_raiz` — `01-CAUSA-RAIZ.md` (só runx)

```yaml
---
expx_schema: 1
expx_tool: runx
kind: causa_raiz
trabalho_id: OC-2026-0142
modo: causa_raiz
comprovada: true
evidencia: teste_falho
arquivos_impactados: [src/frete/calculo.ts]
decisoes:
  - id: D-01
    decisao: Corrigir arredondamento na faixa de peso
    alternativa_descartada: Reescrever a tabela de faixas
    motivo: Escopo menor e risco menor de regressao
atualizado_em: 2026-08-29
---
```

### `qa` — `QA.md` (só runx)

```yaml
---
expx_schema: 1
expx_tool: runx
kind: qa
trabalho_id: OC-2026-0142
veredito: aprovado
executado_em: 2026-08-29
achados:
  - severidade: baixa
    arquivo: src/frete/calculo.ts
    problema: Comentario desatualizado sobre a faixa antiga
    correcao_sugerida: Atualizar comentario
---
```

### `base_indice` — `base/00-INDICE.md`

```yaml
---
expx_schema: 1
expx_tool: runx
kind: base_indice
trabalho_id: OC-2026-0142
atualizado_em: 2026-08-29
areas:
  - arquivo: calculo-frete.md
    titulo: Calculo de frete
    lacunas: 2
---
```

### `relatorio_tecnico` e `relatorio_uso` — `docs/relatorios/<pasta>/`

```yaml
---
expx_schema: 1
expx_tool: runx
kind: relatorio_tecnico
trabalho_id: OC-2026-0142
titulo: Calculo de frete divergente acima de 50kg
tipo_ocorrencia: bug
fechado_em: 2026-08-29
modulo_afetado: [frete]
arquivos_alterados: [src/frete/calculo.ts]
testes_adicionados: 3
---
```

Para `relatorio_uso`, mesmo cabeçalho com `kind: relatorio_uso` e sem `arquivos_alterados` nem `testes_adicionados` — o arquivo de cliente não menciona código nem no YAML.

### `relatorios_indice` — `docs/relatorios/INDICE.md`

```yaml
---
expx_schema: 1
expx_tool: runx
kind: relatorios_indice
atualizado_em: 2026-08-29
entradas:
  - data: 2026-08-29
    oc_id: OC-2026-0142
    tipo: bug
    modulo: frete
    resumo: Arredondamento errado acima de 50kg
    pasta: 2026-08-29-OC-2026-0142-calculo-frete-divergente
---
```

---

## Os kinds da buildx

Os seis abaixo descrevem o estado de um **projeto**, não de um trabalho. Todos
usam `projeto_id` no lugar de `trabalho_id`, e `etapa` no lugar de `estagio`
quando marcam posição na máquina de estados.

### `projeto` — `docs/projeto/PROJETO.md`

```yaml
---
expx_schema: 1
expx_tool: buildx
kind: projeto
projeto_id: gestao-de-contratos
titulo: Sistema de gestao de contratos
modo: autonomo
criado_em: 2026-08-30
atualizado_em: 2026-08-30
etapa: b3
total_features: 11
features_entregues: 4
features_bloqueadas: 0
ciclos_recursao: 0
---
```

### `premissas` — `docs/projeto/PREMISSAS.md`

```yaml
---
expx_schema: 1
expx_tool: buildx
kind: premissas
projeto_id: gestao-de-contratos
atualizado_em: 2026-08-30
total: 23
---
```

### `mapa` — `docs/projeto/MAPA.md`

```yaml
---
expx_schema: 1
expx_tool: buildx
kind: mapa
projeto_id: gestao-de-contratos
atualizado_em: 2026-08-30
total_features: 11
pendentes: 6
em_andamento: 1
entregues: 4
bloqueadas: 0
---
```

### `recursao` — `docs/projeto/RECURSAO.md`

```yaml
---
expx_schema: 1
expx_tool: buildx
kind: recursao
projeto_id: gestao-de-contratos
atualizado_em: 2026-08-30
ciclo_atual: 2
teto_ciclos: 3
pendencias_abertas: 2
pendencias_resolvidas: 5
---
```

### `validacao` — `docs/projeto/VALIDACAO.md`

```yaml
---
expx_schema: 1
expx_tool: buildx
kind: validacao
projeto_id: gestao-de-contratos
data: 2026-08-30
veredito: aprovado
itens_conferidos: 34
itens_atendidos: 32
itens_pendentes: 2
---
```

`veredito` aqui tem **três** valores, e não os dois do enum geral: a buildx
precisa distinguir a entrega íntegra da entrega com pendência declarada, e
apagar essa diferença esconderia justamente o que o relatório final mostra.

### `relatorio` — `docs/projeto/RELATORIO.md`

```yaml
---
expx_schema: 1
expx_tool: buildx
kind: relatorio
projeto_id: gestao-de-contratos
data: 2026-08-30
modo: autonomo
features_entregues: 11
prs_abertos: 11
pendencias_declaradas: 2
premissas_registradas: 23
ciclos_recursao: 2
---
```

### A ponte entre os dois níveis

Todo artefato de trabalho gerado sob uma buildx acrescenta duas chaves ao
frontmatter da skill que o gravou:

| Chave | Valor |
|---|---|
| `origem_buildx` | o `projeto_id` |
| `feature_id` | o `FT-NN` do mapa |

São elas que permitem abrir um plano de sprint qualquer e saber de qual projeto
e de qual feature ele veio. Ambas são opcionais: trabalho sem buildx não as tem.

---

## Onde o painel procura

```
docs/<slug>/                        ← trabalhos do sprintx
docs/manutencao/<OC-ID>-<slug>/     ← trabalhos do runx
docs/relatorios/                    ← histórico
docs/projeto/                       ← o projeto da buildx
```

Regra de descoberta: qualquer `ORQUESTRADOR.md` com frontmatter `kind: orquestrador` é um trabalho. Arquivo sem frontmatter válido é ignorado e reportado como "fora do schema", nunca causa crash do parser.