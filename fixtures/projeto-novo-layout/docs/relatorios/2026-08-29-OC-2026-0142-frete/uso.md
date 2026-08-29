---
expx_schema: 1
expx_tool: runx
kind: relatorio_uso
trabalho_id: OC-2026-0142
titulo: Calculo de frete divergente acima de 50kg
tipo_ocorrencia: bug
fechado_em: 2026-08-29
modulo_afetado: [frete]
---

# O que mudou — frete acima de 50 kg

Pedidos acima de 50 kg estavam calculando um valor de frete menor que o da tabela.
O cálculo foi corrigido e agora o valor cobrado confere com a tabela vigente.

Nenhuma ação é necessária da sua parte. Pedidos novos já saem com o valor correto.
