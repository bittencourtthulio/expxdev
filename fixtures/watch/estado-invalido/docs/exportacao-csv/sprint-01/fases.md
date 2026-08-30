---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: exportacao-csv
sprint_id: sprint-01
atualizado_em: 2026-08-29
fases:
  - id: F-01.1
    titulo: Config e ambiente
    status: concluido
    criterio_saida: Variaveis carregadas e validadas na subida
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01]
  - id: F-01.2
    titulo: Geracao do CSV
    status: em_andamento
    criterio_saida: CSV gerado com as quatro colunas obrigatorias
    paralelizavel: true
    paralela_com: [F-01.1]
    tasks: [T-01.02, T-01.03]
---

# Fases — Sprint 01
