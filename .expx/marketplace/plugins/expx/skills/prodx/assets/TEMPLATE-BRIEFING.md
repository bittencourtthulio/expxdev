---
kind: briefing
schema: expx-schema-v1
pd_id: <PD-AAAA-NNNN>
data: <AAAA-MM-DD>
destino: <sprintx | runx>
classificacao: <correcao | melhoria | novo>
veredito_origem: <caminho do VEREDITO.md>
aprovado_por: <nome de quem assinou o veredito>
aprovado_em: <AAAA-MM-DD>
---

# <PD-ID> — Briefing

<Gerado apenas quando o veredito for fazer ou fazer_outra_coisa E o campo
aprovado_por do VEREDITO.md estiver preenchido por uma pessoa.>

## O problema

<Regra 4: o problema, não a solução pedida. Se o veredito foi
fazer_outra_coisa, este é o problema reformulado, e não o pedido
original.>

## Escopo mínimo aprovado

<Do P4, literal, como foi assinado.>

## O que está explicitamente fora

<Evita que a descoberta do sprintx (F2) reabra escopo já recusado.>

## Critérios de aceite do ponto de vista do negócio

<O que o usuário consegue fazer que não conseguia. Nada de critério
técnico.>

- <critério>

## Contexto para quem vai investigar

<Opcional. Onde o problema aparece, como referência — marcado como
contexto, nunca como instrução. Esta é a única seção em que um caminho de
arquivo pode ser citado.>

## Origem

**Veredito:** <PD-ID> · <caminho do VEREDITO.md>
**Assinado por:** <nome>, <AAAA-MM-DD>

---

<Regra 10: este briefing não contém decisão técnica. Arquitetura, camada,
tecnologia, tabela, biblioteca e padrão de projeto são do sprintx e do
runx. O prodx também não estima esforço: isso é a F3.5 do sprintx.>
