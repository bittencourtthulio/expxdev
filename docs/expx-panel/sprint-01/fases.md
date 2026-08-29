---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: expx-panel
sprint_id: sprint-01
atualizado_em: 2026-08-29
fases:
  - id: F-01.1
    titulo: Andaime do projeto
    status: concluido
    criterio_saida: npm test e npm run build rodam sem erro num projeto vazio de regras
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02]
  - id: F-01.2
    titulo: Fixtures boas
    status: concluido
    criterio_saida: Existe um projeto-exemplo em disco com os 13 kinds validos
    paralelizavel: true
    paralela_com: [F-01.3]
    tasks: [T-01.03, T-01.04, T-01.05]
  - id: F-01.3
    titulo: Fixtures ruins
    status: concluido
    criterio_saida: Existem em disco os sete casos ruins do pedido, cada um isolado
    paralelizavel: true
    paralela_com: [F-01.2]
    tasks: [T-01.06, T-01.07]
---

# Fases — Sprint 01

> Um bloco por fase. O paralelismo declarado aqui é definitivo: a execução nunca decide paralelismo sozinha.

---

## F-01.1 — Andaime do projeto

**Objetivo:** Ter um pacote TypeScript ESM que compila em modo strict e roda a suíte de testes.

**Tasks que a compõem:** T-01.01, T-01.02

**Critério de saída:** `npm test` e `npm run build` terminam com código 0 num projeto ainda sem regras.

**Roda em paralelo com:** nenhuma

---

## F-01.2 — Fixtures boas

**Objetivo:** Ter em disco um projeto-exemplo com trabalhos sprintx e runx misturados, cobrindo os 13 kinds válidos.

**Tasks que a compõem:** T-01.03, T-01.04, T-01.05

**Critério de saída:** `fixtures/projeto-ok/` contém pelo menos um arquivo de cada um dos 13 kinds, todos com frontmatter válido.

**Roda em paralelo com:** F-01.3

---

## F-01.3 — Fixtures ruins

**Objetivo:** Ter em disco os sete casos ruins que o parser precisa tratar sem quebrar.

**Tasks que a compõem:** T-01.06, T-01.07

**Critério de saída:** `fixtures/projeto-ruim/` contém os sete casos, cada um em arquivo próprio e isolado dos demais.

**Roda em paralelo com:** F-01.2
