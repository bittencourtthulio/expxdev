---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: memox-painel
sprint_id: sprint-03
atualizado_em: 2026-08-29
fases:
  - id: F-03.1
    titulo: Catalogo e montagem dos hooks
    status: concluido
    criterio_saida: O catalogo tem seis skills e apos o init o hook e o motor existem como irmaos
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.01, T-03.02, T-03.03, T-03.04]
  - id: F-03.2
    titulo: Registro em settings.json
    status: concluido
    criterio_saida: mesclarSettings registra os dois eventos e a segunda execucao nao duplica
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.05, T-03.06]
  - id: F-03.3
    titulo: Diagnostico e documentacao
    status: concluido
    criterio_saida: O doctor acusa hook sem motor e o README nao diz mais cinco skills
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.07, T-03.08]
---

# Fases — Sprint 03

> Um bloco por fase. O paralelismo declarado aqui é definitivo.

---

## F-03.1 — Catálogo e montagem dos hooks

**Objetivo:** Registrar o memox como skill instalável, ensinar as fixtures a montar hooks, detectá-los e materializá-los no harness.

**Tasks que a compõem:** T-03.01, T-03.02, T-03.03, T-03.04

**Critério de saída:** `CATALOGO` tem seis entradas com `memox` como camada, e após `executarInit` o hook existe com bit de execução com o motor no caminho irmão que ele resolve.

**Roda em paralelo com:** nenhuma

---

## F-03.2 — Registro em settings.json

**Objetivo:** Registrar `UserPromptSubmit` e `Stop` sem duplicar em reinstalação.

**Tasks que a compõem:** T-03.05, T-03.06

**Critério de saída:** `mesclarSettings` grava os dois eventos, e uma segunda execução mantém exatamente uma entrada por evento.

**Roda em paralelo com:** nenhuma

---

## F-03.3 — Diagnóstico e documentação

**Objetivo:** Tornar visível a instalação quebrada que o hook esconde ao sair `0`, e acertar a contagem de skills na documentação.

**Tasks que a compõem:** T-03.07, T-03.08

**Critério de saída:** O `doctor` emite achado quando o hook do memox existe sem o motor irmão, e o README não diz mais "cinco skills".

**Roda em paralelo com:** nenhuma
