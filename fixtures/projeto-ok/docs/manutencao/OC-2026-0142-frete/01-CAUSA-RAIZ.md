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
atualizado_em: 2026-08-28
---

# Causa raiz — OC-2026-0142

STATUS: COMPROVADO. O arredondamento trunca em vez de arredondar acima de 50kg.
