---
description: P0 do prodx — triagem de um chamado recém-chegado: roda os oito gatilhos e decide entre veredito direto e avaliação completa. Seco e rápido, sem criar pasta.
---

Use a skill `prodx`, etapa **P0**, seguindo `references/00-triagem.md`.

O chamado está em `$ARGUMENTS`. Se vier vazio, peça o texto do chamado em uma linha e pare.

## Roteiro

1. Leia o pedido cru, sem reescrever.
2. Rode os oito gatilhos, cada um com resposta **sim** ou **não**. Na dúvida, a resposta é **sim**.
3. Conte:
   - **zero gatilhos** → veredito direto, linha no `INDICE.md`, destino (normalmente runx), fim.
   - **um ou mais** → crie `docs/produto/pedidos/<PD-ID>-<slug>/` e siga para o P2.
4. Registre a linha no `INDICE.md` nos dois casos. A triagem nunca é silenciosa.

## Tom

**Seco.** Modo didático não vale aqui — ninguém quer aula para aprovar a correção de um rótulo. Máximo cinco linhas de saída:

```
Triagem <PD-ID> — "<titulo>"
Gatilhos: <nenhum | G1, G2...>
Veredito: <veredito> (<motivo em poucas palavras>)
Destino: <runx | avaliacao completa>
Registrado no INDICE.md. Confirme com uma linha para seguir.
```

## Regras

- Regra 3: a triagem nunca é pulada, e a avaliação completa nunca roda sem gatilho disparado.
- Regra 2: mesmo no caminho curto, a confirmação de uma linha do humano é necessária antes de seguir para o runx.
- Pedido que passa na triagem **não gera pasta**.
- Se o `INDICE.md` não existir, crie-o de `assets/TEMPLATE-INDICE.md` antes da primeira linha.
- Se o pedido for vago demais para triar, não invente gatilho: peça o pedido concreto e não crie linha ainda.
