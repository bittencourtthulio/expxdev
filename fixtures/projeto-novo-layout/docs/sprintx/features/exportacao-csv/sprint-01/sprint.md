---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: exportacao-csv
sprint_id: sprint-01
titulo: Fundacao
status: em_andamento
criterio_saida: Suite verde e gerador de CSV cobrindo escaping e encoding
fases: [F-01.1, F-01.2]
riscos:
  - Encoding UTF-8 com BOM exigido pelo Excel em portugues
atualizado_em: 2026-08-28
---

# Sprint 01 — Fundação

## Objetivo

Entregar a capacidade de testar e o gerador de CSV.

## Critério de saída

A suíte roda com `npm test` e termina com 0 failed.
