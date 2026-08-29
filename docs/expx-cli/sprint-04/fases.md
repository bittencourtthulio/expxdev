---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: expx-cli
sprint_id: sprint-04
atualizado_em: 2026-08-29
fases:
  - id: F-04.1
    titulo: Roteador de subcomando
    status: concluido
    criterio_saida: Os seis subcomandos sao roteados e desconhecido devolve codigo 1 com ajuda
    paralelizavel: false
    paralela_com: []
    tasks: [T-04.01, T-04.02]
  - id: F-04.2
    titulo: Init e selecao
    status: concluido
    criterio_saida: init monta o .expx com as skills escolhidas e avisa sobre camadas sem base
    paralelizavel: false
    paralela_com: []
    tasks: [T-04.03, T-04.04, T-04.05]
  - id: F-04.3
    titulo: Add remove e panel
    status: concluido
    criterio_saida: add e remove alteram a selecao e panel sobe o painel sem .expx
    paralelizavel: false
    paralela_com: []
    tasks: [T-04.06, T-04.07]
---

# Fases — Sprint 04

---

## F-04.1 — Roteador de subcomando

**Objetivo:** transformar o parser atual, que só aceita opções, em um roteador de subcomandos.

**Tasks que a compõem:** T-04.01, T-04.02

**Critério de saída:** os seis subcomandos são roteados e subcomando desconhecido devolve código 1 com ajuda.

**Roda em paralelo com:** nenhuma

---

## F-04.2 — Init e seleção

**Objetivo:** executar o fluxo de instalação de ponta a ponta, interativo ou por flag.

**Tasks que a compõem:** T-04.03, T-04.04, T-04.05

**Critério de saída:** `init` monta o `.expx/` com as skills escolhidas e avisa sobre camadas sem base.

**Roda em paralelo com:** nenhuma

---

## F-04.3 — Add, remove e panel

**Objetivo:** completar os subcomandos de seleção e preservar o painel.

**Tasks que a compõem:** T-04.06, T-04.07

**Critério de saída:** `add` e `remove` alteram a seleção e `panel` sobe o painel sem `.expx/`.

**Roda em paralelo com:** nenhuma
