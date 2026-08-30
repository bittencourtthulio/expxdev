# Integração — memox

O memox é o índice do que já foi feito, por arquivo e por módulo. É a integração que faz o prodx **melhorar com o tempo**.

## O que o memox indexa do prodx

1. **`docs/produto/INDICE.md`** — uma linha por pedido, com título, veredito e motivo. É o que responde "isso já foi pedido antes e o que decidimos?".
2. **Os `VEREDITO.md`** de todos os pedidos avaliados, inclusive e principalmente os `nao_fazer` — pedido recusado nunca é apagado (regra 9), e a avaliação é ativo permanente.

Indexar por: termo do título, módulo afetado, veredito e data.

## Por que isso importa

A verificação de existência do **P3** consulta o índice do memox como segundo lugar de busca. Quanto mais o memox souber, menos o P3 depende de o dev lembrar que alguma coisa existe.

O ciclo:

1. P3 procura no memox e acha uma funcionalidade obscura → veredito `ja_existe`
2. O veredito é indexado
3. O próximo pedido igual acha o veredito antes de achar a funcionalidade — mais barato ainda

O mesmo vale para as recusas: o **P4 pergunta 7** (recorrência) conta quantas vezes o pedido apareceu consultando o índice. Sem memox, essa contagem depende de busca textual no `INDICE.md`, que funciona mas é mais fraca.

## O que o prodx consome do memox

| Etapa | Uso |
|-------|-----|
| P1 | Mapa de funcionalidades — o que já foi construído, por módulo |
| P3 | Segundo lugar de busca na verificação de existência, por termo e por módulo |
| P4 | Contagem de recorrência e recuperação da recusa anterior |

## Comportamento sem prodx instalado

O memox indexa o que existe. Sem `docs/produto/`, nada muda no comportamento dele.

## Comportamento do prodx sem memox

O P3 registra a ausência, marca a confiança do desfecho como reduzida, e segue com os outros quatro lugares de busca. **A ausência nunca bloqueia o prodx.**
