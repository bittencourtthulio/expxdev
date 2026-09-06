---
expx_schema: 1
expx_tool: runx
kind: plano
trabalho_id: {{OC-ID}}
sprint_id: sprint-{{NN}}
atualizado_em: {{AAAA-MM-DD}}
sprint:
  titulo: {{titulo da sprint, uma linha}}
  status: {{nao_iniciado | em_andamento | bloqueado | concluido}}
  criterio_saida: {{condicao verificavel, uma linha}}
  riscos: [{{risco, uma linha}}]
  fora_de_escopo: [{{o que foi percebido e NAO sera tocado}}]
fases:
  - id: F-{{NN}}.1
    titulo: {{titulo da fase}}
    status: {{nao_iniciado | em_andamento | bloqueado | concluido}}
    criterio_saida: {{condicao verificavel, binaria, uma linha}}
    paralelizavel: false
    paralela_com: []
    tasks: [T-{{NN}}.01, T-{{NN}}.02]
tasks:
  - id: T-{{NN}}.01
    titulo: {{titulo curto, sem acento, uma linha}}
    fase: F-{{NN}}.1
    status: pendente
    objetivo: {{uma frase}}
    arquivos:
      cria: [{{caminho/relativo/novo.ext}}]
      altera: []
    teste_regressao: {{o teste que reproduz o problema e hoje falha - OBRIGATORIO quando tipo: bug}}
    teste_integracao: {{o que valida, contra o que - uma frase, OBRIGATORIO}}
    teste_funcional: {{o que valida, com qual entrada e saida - uma frase, OBRIGATORIO}}
    criterio_aceite: {{condicao verificavel, binaria, sem adjetivo}}
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-{{NN}}.02
    titulo: {{titulo curto, sem acento, uma linha}}
    fase: F-{{NN}}.1
    status: pendente
    objetivo: {{uma frase}}
    arquivos:
      cria: []
      altera: [{{caminho/relativo/existente.ext}}]
    teste_integracao: {{o que valida, contra o que - uma frase, OBRIGATORIO}}
    teste_funcional: {{o que valida, com qual entrada e saida - uma frase, OBRIGATORIO}}
    criterio_aceite: {{condicao verificavel, binaria, sem adjetivo}}
    depende_de: [T-{{NN}}.01]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

> Frontmatter obrigatorio (expx-schema v1). Formato completo em `references/00-schema.md`.
> Substitua TODOS os marcadores; NUNCA omita uma chave — ausente e `null`, lista vazia e `[]`.
> Sem acento em chave nem em valor de enum. `atualizado_em` e reescrito a cada gravacao.
>
> **Um unico bloco YAML.** Os leitores de frontmatter param no primeiro `---` de fechamento:
> um segundo bloco neste arquivo seria invisivel para os hooks de metodo.
>
> **Este arquivo se chama `sprint-NN/tasks.md`.** O nome nao muda — e o caminho que os hooks
> procuram. Use este template apenas quando o plano tem UMA sprint e UMA fase; com mais de
> uma sprint ou mais de uma fase, use `TEMPLATE-sprint.md`, `TEMPLATE-fases.md` e
> `TEMPLATE-tasks.md`, os tres arquivos separados de sempre.
>
> `teste_regressao` existe APENAS na primeira task da primeira fase, e e obrigatorio quando
> `tipo: bug`. Nas demais tasks, a chave nao aparece.

# Plano — Sprint {{NN}} — {{título da sprint}}

## Objetivo da sprint

{{O que esta sprint entrega, em uma ou duas frases.}}

## Critério de saída da sprint

{{Condição verificável, binária, sem adjetivo. Ex.: "a suíte roda com `<comando>` e termina com 0 failed".}}

## Riscos conhecidos

- {{risco vindo da base ou das decisões, com referência ao arquivo que o registra}}
- {{ou "Nenhum risco registrado."}}

## Fora de escopo

> Escopo travado (regra 8). O que foi percebido e NÃO será tocado nesta ocorrência.
> Melhoria avulsa vira sugestão de nova ocorrência no relatório técnico, nunca implementação.

- {{o que não será tocado}} — {{por quê}}

## Fase F-{{NN}}.1 — {{título da fase}}

**Objetivo:** {{o que esta fase entrega}}

**Tasks:** T-{{NN}}.01, T-{{NN}}.02

**Critério de saída:** {{condição verificável e binária}}

**Roda em paralelo com:** nenhuma.

### Grafo de tasks

```mermaid
%% Grafo de tasks — sprint-{{NN}} — gerado pela runx a partir deste arquivo
flowchart LR
  subgraph fase_{{NN}}_1["F-{{NN}}.1 {{título curto da fase}}"]
    T_{{NN}}_01["T-{{NN}}.01<br/>{{título curto}}"]
    T_{{NN}}_02["T-{{NN}}.02<br/>{{título curto}}"]
  end
  T_{{NN}}_01 --> T_{{NN}}_02
  classDef pendente fill:#F3F0EA,stroke:#8A7F70,color:#1A1815
  classDef em_andamento fill:#FDF0D5,stroke:#B4541E,color:#1A1815
  classDef concluida fill:#DFF0D8,stroke:#4A6B3A,color:#1A1815
  classDef bloqueada fill:#F8D7DA,stroke:#8C2F24,color:#1A1815
  classDef regressao fill:#E8DFF5,stroke:#6B4A9B,color:#1A1815,stroke-width:3px
  classDef critico stroke-width:3px
  class T_{{NN}}_01 regressao
  class T_{{NN}}_02 pendente
```

> Regras do diagrama em `references/07-diagrama.md`. Os identificadores dos nós vêm concretos
> (`T_01_01`), nunca com marcador — `{{ }}` é sintaxe de nó hexagonal do Mermaid e quebraria
> o bloco em posição de identificador (DR-53).

## Tasks

---

```yaml
id: T-{{NN}}.01
titulo: {{título curto da task}}
objetivo: {{uma frase}}
arquivos:
  cria: [{{caminho/relativo/novo.ext}}]
  altera: []
teste_regressao: {{o teste que reproduz o problema e hoje falha}}
teste_integracao: {{o que valida, contra o quê — em uma frase}}
teste_funcional: {{o que valida, com qual entrada e qual saída — em uma frase}}
criterio_aceite: {{condição verificável, binária, sem adjetivo}}
depende_de: []
paralelizavel: false
status: pendente
```

---

```yaml
id: T-{{NN}}.02
titulo: {{título curto da task}}
objetivo: {{uma frase}}
arquivos:
  cria: []
  altera: [{{caminho/relativo/existente.ext}}]
teste_integracao: {{o que valida, contra o quê — em uma frase}}
teste_funcional: {{o que valida, com qual entrada e qual saída — em uma frase}}
criterio_aceite: {{condição verificável, binária, sem adjetivo}}
depende_de: [T-{{NN}}.01]
paralelizavel: false
status: pendente
```
