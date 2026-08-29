---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: expx-cli
sprint_id: sprint-05
atualizado_em: 2026-08-29
fases:
  - id: F-05.1
    titulo: Update
    status: concluido
    criterio_saida: update compara com o lock, respeita modificacao local e bloqueia schema incompativel
    paralelizavel: false
    paralela_com: []
    tasks: [T-05.01, T-05.02, T-05.03, T-05.04]
  - id: F-05.2
    titulo: Doctor
    status: concluido
    criterio_saida: doctor aponta cada defeito das fixtures quebradas com a correcao sugerida
    paralelizavel: true
    paralela_com: [F-05.3]
    tasks: [T-05.05, T-05.06]
  - id: F-05.3
    titulo: Publicacao
    status: concluido
    criterio_saida: O pacote empacota como expx-cli e o binario expx roda a partir do tarball
    paralelizavel: true
    paralela_com: [F-05.2]
    tasks: [T-05.07]
---

# Fases — Sprint 05

---

## F-05.1 — Update

**Objetivo:** atualizar as skills instaladas sem jamais perder trabalho local.

**Tasks que a compõem:** T-05.01, T-05.02, T-05.03, T-05.04

**Critério de saída:** `update` compara com o lock, respeita modificação local e bloqueia schema incompatível.

**Roda em paralelo com:** nenhuma

---

## F-05.2 — Doctor

**Objetivo:** diagnosticar instalação quebrada com correção sugerida.

**Tasks que a compõem:** T-05.05, T-05.06

**Critério de saída:** `doctor` aponta cada defeito das fixtures quebradas com a correção sugerida.

**Roda em paralelo com:** F-05.3

---

## F-05.3 — Publicação

**Objetivo:** deixar o pacote publicável como `@expx/cli` sem quebrar o painel.

**Tasks que a compõem:** T-05.07

**Critério de saída:** o pacote empacota como `@expx/cli` e o binário `expx` roda a partir do tarball.

**Roda em paralelo com:** F-05.2
