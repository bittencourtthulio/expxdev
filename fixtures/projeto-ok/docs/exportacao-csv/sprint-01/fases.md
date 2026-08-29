---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: exportacao-csv
sprint_id: sprint-01
atualizado_em: 2026-08-28
fases:
  - id: F-01.1
    titulo: Config e fixtures
    status: concluido
    criterio_saida: Suite roda e as fixtures de relatorio existem
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02]
  - id: F-01.2
    titulo: Gerador de CSV
    status: em_andamento
    criterio_saida: Gerador cobre escaping de aspas e quebra de linha
    paralelizavel: true
    paralela_com: [F-01.3]
    tasks: [T-01.03]
  - id: F-01.3
    titulo: Enfileiramento do job
    status: nao_iniciado
    criterio_saida: Job de exportacao entra na fila e e consumido
    paralelizavel: true
    paralela_com: [F-01.2]
    tasks: [T-01.04]
---

# Fases — Sprint 01

## F-01.1 — Config e fixtures

**Critério de saída:** a suíte roda e as fixtures de relatório existem.

## F-01.2 — Gerador de CSV

**Critério de saída:** o gerador cobre escaping de aspas e quebra de linha.

**Roda em paralelo com:** F-01.3

## F-01.3 — Enfileiramento do job

**Critério de saída:** o job de exportação entra na fila e é consumido.

**Roda em paralelo com:** F-01.2
