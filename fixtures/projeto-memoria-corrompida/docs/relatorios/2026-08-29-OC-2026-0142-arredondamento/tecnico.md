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
testes_adicionados: 2
---

# Relatório técnico — OC-2026-0142

## Causa raiz

O arredondamento acima de 50kg usava floor onde deveria usar round meio-para-cima.

## Correção

Troca do floor por arredondamento meio-para-cima na faixa alta.
