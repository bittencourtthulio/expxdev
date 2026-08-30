---
description: P2 a P5 do prodx — avaliação completa de um pedido que disparou gatilho na triagem, até o veredito pronto para assinatura.
---

Use a skill `prodx`, etapas **P2 a P5**.

O pedido está em `$ARGUMENTS` — PD-ID, ou o texto do pedido. Se vier vazio, liste os pedidos abertos com o estágio de cada um e pergunte qual.

## Antes de começar

Confirme que a triagem rodou e que **pelo menos um gatilho disparou** (regra 3). Se não rodou, rode-a primeiro. Se nenhum gatilho disparou, não abra avaliação completa: dê o veredito direto.

Consulte a máquina de estados do `SKILL.md` e execute **a etapa pendente**, não a primeira. Se o usuário pedir uma etapa adiantada, explique o que falta e execute a pendente.

## Etapas

| Etapa | Reference | Saída |
|-------|-----------|-------|
| P2 — entendimento | `references/02-pedido.md` | `01-pedido.md` |
| P3 — existência | `references/03-existencia.md` | `02-existencia.md` |
| P4 — avaliação | `references/04-avaliacao.md` | `03-avaliacao.md` |
| P5 — veredito | `references/05-veredito.md` | `VEREDITO.md` |

Atalho obrigatório: se o P3 der **EXISTE**, pule o P4 e vá direto ao P5 com veredito `ja_existe`.

Pare no P2 se houver pergunta essencial em aberto (regra 8): informação que falta vira pergunta, nunca suposição.

## Tom

**Modo didático**, padrão nesta casa: explique o raciocínio de cada etapa enquanto trabalha, mostre o que considerou e descartou, e diga por que aquela pergunta importa.

Passe ao modo conciso quando **as duas** condições valerem: signatário com `provisorio: false` no `PRODUTO.md` **e** mais de trinta pedidos avaliados no `INDICE.md`.

## Regras

- Regra 4: a solução pedida nunca é o requisito. O requisito é o problema.
- Regra 5: existência com evidência — tela, rota, arquivo ou relatório.
- Regra 6: escopo mínimo nunca fica vazio.
- Regra 7: pedido rotulado como bug é verificado contra comportamento intencional.
- Regra 1: a skill não assina. Deixe `aprovado_por` e `aprovado_em` como `PENDENTE` e diga quem deve assinar.

## Ao terminar

Apresente a recomendação com força, diga por que ela e não as outras três, e peça a assinatura de quem está registrado no `PRODUTO.md`. Atualize a linha do pedido no `INDICE.md`.
