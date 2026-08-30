---
kind: produto_indice
schema: expx-schema-v1
criado_em: <AAAA-MM-DD>
atualizado_em: <AAAA-MM-DD>
total_pedidos: 0
via_triagem: 0
via_avaliacao: 0
nao_viraram_trabalho: 0
---

# Índice de pedidos

Append-only. Uma linha por pedido, da triagem à avaliação completa.
É o ativo de longo prazo do prodx: é o que responde "isso já foi pedido
antes e o que decidimos?".

Pedido recusado **nunca é apagado**: a avaliação vale para a próxima vez.

| data | PD-ID | titulo | origem | via | veredito | motivo | trabalho_gerado |
|------|-------|--------|--------|-----|----------|--------|-----------------|

## Indicadores

<Recalcule ao acrescentar linhas.>

- **Total de pedidos:** <n>
- **Via triagem:** <n> (<%>)
- **Via avaliação completa:** <n> (<%>) — acima de 50% os gatilhos estão largos demais
- **Não viraram trabalho:** <n> (<%>) — soma de ja_existe, nao_fazer e fazer_outra_coisa

<A última linha é o indicador honesto de utilidade da skill. Se tudo que
entra sai como "fazer", o prodx é burocracia.>
