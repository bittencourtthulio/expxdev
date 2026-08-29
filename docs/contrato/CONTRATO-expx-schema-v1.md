# Contrato `expx-schema` v1

Este é o contrato entre as skills (`sprintx`, `runx`) e o painel. As skills **escrevem** este frontmatter; o painel **lê** e nunca escreve.

Guarde este arquivo no repositório do painel. Ele é a fonte da verdade quando skill e parser divergirem.

---

## Regras universais

Valem para todo arquivo com frontmatter, sem exceção.

1. O bloco YAML é a **primeira coisa do arquivo**, delimitado por `---`.
2. Toda chave em `snake_case`, minúscula, **sem acento**.
3. Todo valor de enum em minúscula e **sem acento**: `concluida`, nunca `Concluída`.
4. Datas em ISO: `AAAA-MM-DD`.
5. Booleanos: `true` / `false`.
6. Lista vazia é `[]`. Valor ausente é `null`. **Nunca omitir a chave** — o painel diferencia "não se aplica" de "esqueceram de escrever".
7. O frontmatter é a **única** fonte para o painel. A prosa abaixo dele é para humano e pode dizer o que quiser.
8. Nada de duplicar prosa longa no YAML. Campos de texto são de uma linha.
9. `atualizado_em` é reescrito a cada gravação do arquivo.

## Enums

| Campo | Valores |
|---|---|
| `expx_tool` | `sprintx` · `runx` |
| `tipo_trabalho` | `feature` · `ocorrencia` |
| `tipo_ocorrencia` | `bug` · `melhoria-ui` · `melhoria-ux` · `novo-relatorio` · `regra-de-calculo` · `campo-novo` · `outro` · `null` |
| `estagio` | sprintx: `f1`…`f6` · runx: `e1`…`e5` |
| `status` (trabalho, sprint, fase) | `nao_iniciado` · `em_andamento` · `bloqueado` · `concluido` |
| `status` (task) | `pendente` · `em_andamento` · `concluida` · `bloqueada` |
| `suite` | `verde` · `vermelha` · `nao_executada` |
| `veredito` | `aprovado` · `reprovado` |
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

## Onde o painel procura

```
docs/<slug>/                        ← trabalhos do sprintx
docs/manutencao/<OC-ID>-<slug>/     ← trabalhos do runx
docs/relatorios/                    ← histórico
```

Regra de descoberta: qualquer `ORQUESTRADOR.md` com frontmatter `kind: orquestrador` é um trabalho. Arquivo sem frontmatter válido é ignorado e reportado como "fora do schema", nunca causa crash do parser.