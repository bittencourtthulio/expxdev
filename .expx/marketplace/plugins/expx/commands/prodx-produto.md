---
description: P1 do prodx — cria ou atualiza o docs/produto/PRODUTO.md, o contexto de produto que sustenta todos os vereditos.
---

Use a skill `prodx`, etapa **P1**, seguindo `references/01-produto.md`.

Argumento opcional em `$ARGUMENTS`: a seção a atualizar. Sem argumento, monte ou revise o arquivo inteiro.

## Roteiro

1. **Levante o que dá para verificar sozinho** — rotas, telas, módulos, o `PERFIL.md` do legadox, o índice do memox, e os relatórios de uso do runx. O mapa de funcionalidades sai daí.
2. **Pergunte o que não dá** — em bloco de no máximo cinco perguntas por vez.
3. **Trate o signatário como bloqueante** — regra 12. Pergunte quem, na prática, hoje diria não a um cliente. Registre como provisório. Nunca deixe vazio, nem como `NAO DETERMINADO`.
4. **Escreva o que o produto NÃO é** — pelo menos três negativas concretas e verificáveis. É esta seção que sustenta a recusa de pedido fora de escopo.
5. **Separe quem paga de quem usa.**
6. **Registre as lacunas** — todo `NAO DETERMINADO` vira entrada em `docs/produto/LACUNAS.md`, com o campo, por que não foi determinado, e quem saberia responder.

## Regras

- Regra 11: nada de invenção. O não verificável vira `NAO DETERMINADO`.
- Regra 12: o campo de quem assina nunca fica vazio.
- Documentação comercial é fonte fraca — confronte com as rotas.

## Saída

`docs/produto/PRODUTO.md` a partir de `assets/TEMPLATE-PRODUTO.md`, com as dez seções, e `docs/produto/LACUNAS.md` atualizado.

Ao terminar, informe quantas lacunas ficaram abertas e se o signatário é provisório.
