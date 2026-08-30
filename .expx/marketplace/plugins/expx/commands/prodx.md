---
description: Roteador do prodx — conduz à criação do PRODUTO.md se ele não existir; senão mostra os pedidos abertos, o estágio de cada um e a proporção entre triagem e avaliação completa.
---

Use a skill `prodx`.

Este é o comando de entrada. Ele não executa etapa nenhuma por conta própria: identifica o estado e encaminha.

## 1. Verifique o estado

Nesta ordem:

1. `docs/produto/PRODUTO.md` existe?
2. `docs/produto/INDICE.md` existe?
3. Há pastas em `docs/produto/pedidos/` com `VEREDITO.md` ausente ou com `aprovado_por: PENDENTE`?

## 2. Se o PRODUTO.md não existir

Conduza à criação. Explique em três linhas por que ele é necessário — sem ele a skill vira genérica e qualquer IA responderia igual — e execute o P1 seguindo `references/01-produto.md`.

Não peça permissão para criar o arquivo; conduza a conversa que levanta o conteúdo.

## 3. Se existir, mostre o painel

```
prodx — <nome do produto>
Signatario: <nome> <(provisorio)>

PEDIDOS ABERTOS
| PD-ID | titulo | estagio | aguardando |
|-------|--------|---------|------------|

INDICADORES
Pedidos registrados: <n>
Via triagem: <n> (<%>)
Via avaliacao completa: <n> (<%>)
Nao viraram trabalho: <n> (<%>)
```

O estágio de cada pedido vem da máquina de estados do `SKILL.md`, deduzido dos arquivos presentes na pasta.

## 4. Comente os indicadores

- **Avaliação completa acima de 50%** — diga que os gatilhos estão largos demais, aponte quais (normalmente G4 ou G8) e ofereça ajustá-los.
- **"Não viraram trabalho" perto de zero** — diga que o prodx está virando carimbo, e que este é o indicador honesto de utilidade da skill.
- **Signatário provisório** — lembre em uma linha que a confirmação está pendente.

## 5. Encaminhe

Se há pedido aguardando ação, diga qual comando roda: `/prodx-triar`, `/prodx-avaliar`, `/prodx-existe` ou `/prodx-briefing`.

Se há mais de um pedido aberto e o usuário não indicou qual, liste com o estágio e pergunte — não escolha por ele.
