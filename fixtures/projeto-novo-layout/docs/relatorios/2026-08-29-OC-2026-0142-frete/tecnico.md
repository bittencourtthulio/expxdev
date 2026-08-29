---
expx_schema: 1
expx_tool: runx
kind: relatorio_tecnico
trabalho_id: OC-2026-0142
titulo: Calculo de frete divergente acima de 50kg
tipo_ocorrencia: bug
fechado_em: 2026-08-29
modulo_afetado: [frete]
arquivos_alterados: [src/frete/calculo.ts]
testes_adicionados: 3
---

# Relatório técnico — OC-2026-0142

## Causa raiz

O cálculo truncava o peso em vez de arredondar na faixa acima de 50kg.

## Correção

Troca de `Math.trunc` por `Math.round` na função de faixa, com teste de regressão.
