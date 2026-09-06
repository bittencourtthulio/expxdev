---
expx_schema: 1
expx_tool: runx
kind: fases
trabalho_id: OC-2026-DEMO
sprint_id: sprint-01
atualizado_em: 2026-09-02
fases:
  - id: F-01.1
    titulo: Teste que reproduz
    status: concluido
    criterio_saida: Existe teste vermelho que reproduz o defeito
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01]
  - id: F-01.2
    titulo: Correcao e regressao
    status: em_andamento
    criterio_saida: Suite verde com o teste de regressao incluido
    paralelizavel: true
    paralela_com: [F-01.1]
    tasks: [T-01.02, T-01.03, T-01.04, T-01.05]
---

# Fases — Sprint 01
