---
description: Gera o BRIEFING.md de um veredito já assinado, no formato que o sprintx ou o runx espera receber.
---

Use a skill `prodx`, etapa **P5**, parte do briefing, seguindo `references/05-veredito.md`.

O pedido está em `$ARGUMENTS` — PD-ID. Se vier vazio, liste os vereditos assinados sem briefing e pergunte qual.

## Verificação bloqueante — faça primeiro

Abra o `VEREDITO.md` e confirme **as duas** condições:

1. `veredito` é `fazer` ou `fazer_outra_coisa`
2. `aprovado_por` e `aprovado_em` estão **preenchidos por uma pessoa**, não como `PENDENTE`

**Se `aprovado_por` estiver `PENDENTE`, não gere o briefing.** Regra 2. Responda em uma linha explicando o bloqueio e ofereça colher a assinatura agora — ela é uma frase, não um processo.

Nunca preencha `aprovado_por` por conta própria, com o nome da skill, ou com o nome do dev que rodou o comando.

## Destino

| Classificação | Destino | Formato |
|---------------|---------|---------|
| `novo`, `melhoria` | sprintx | briefing de feature, entrada da F1 |
| `correcao` | runx | briefing de ocorrência, vira `00-OCORRENCIA.md` |

Consulte `references/integracao/sprintx.md` ou `references/integracao/runx.md` para o mapeamento de campos.

## Conteúdo

De `assets/TEMPLATE-BRIEFING.md`:

1. O problema — não a solução pedida (regra 4). Se o veredito foi `fazer_outra_coisa`, é o problema **reformulado**.
2. O escopo mínimo aprovado — o do P4, literal.
3. O que está explicitamente fora.
4. Critérios de aceite do ponto de vista do negócio.
5. Link para o veredito — PD-ID e caminho.

## Regra 10 — nenhuma decisão técnica

Arquitetura, camada, tecnologia, tabela, biblioteca e padrão de projeto são do sprintx e do runx. Se o briefing mencionar arquivo, tabela ou tecnologia fora da seção de contexto, reescreva.

O prodx também não estima esforço: isso é a F3.5 do sprintx.

## Caminho da triagem

Pedido aprovado na triagem entrega **um briefing de uma linha**, direto no `INDICE.md`, sem criar arquivo:

```
<PD-ID> | <classificacao> | <problema em uma linha> | aprovado por: <nome>, <data> | <destino>
```

## Ao terminar

Atualize `trabalho_gerado` no frontmatter do `VEREDITO.md` e na linha do `INDICE.md`.
