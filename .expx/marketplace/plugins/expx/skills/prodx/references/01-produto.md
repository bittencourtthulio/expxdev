# P1 — Contexto de produto

Roda uma vez, atualizado sob demanda. Produz `docs/produto/PRODUTO.md` e `docs/produto/LACUNAS.md`.

Sem ele a skill vira genérica e qualquer IA responderia igual. O `PRODUTO.md` é o que faz o prodx conhecer **este** produto.

## Pré-requisitos

Nenhum. O P1 roda em repositório novo. O que ele não achar vira lacuna, não vira invenção.

## Fontes, em ordem de confiabilidade

1. **`PERFIL.md` do legadox**, quando existir — módulos, zonas de risco, dependências.
2. **As telas e rotas do sistema** — arquivos de rota, menus, controllers, views. É a evidência mais dura do que o produto faz.
3. **O índice do memox** — o que já foi construído, por arquivo e por módulo.
4. **Os relatórios de uso do runx** — a melhor descrição existente do que o sistema faz **na linguagem do cliente**. Leia todos antes de escrever o mapa de funcionalidades.
5. **O que o usuário informar** — vale como fonte, e é a única fonte possível para negócio, signatário e objetivos.

Documentação comercial (site, proposta, apresentação) é fonte fraca: descreve o que se quer vender, não o que existe. Use só para o campo "o que o produto é", e confronte com as rotas.

## Passo a passo

### 1. Levante o que dá para verificar sozinho

Mapeie rotas, telas e módulos. Leia os relatórios de uso do runx. Monte o **mapa de funcionalidades** — uma linha por funcionalidade, agrupada por módulo, na linguagem do cliente e não na do código.

Este mapa é o insumo do P3. Uma funcionalidade mal descrita aqui é uma verificação de existência que falha depois.

### 2. Pergunte o que não dá

Bloco de no máximo cinco perguntas por vez. As que quase sempre faltam:

- Qual o modelo de negócio: produto único multi-cliente, instalação por cliente, ou customização por contrato?
- Quem paga e quem usa — são as mesmas pessoas?
- Quais objetivos de negócio estão vigentes, e até quando?
- O que o produto deliberadamente **não** é?
- **Quem, hoje, na prática, diria não a um cliente?**

### 3. Trate o campo do signatário como bloqueante

Regra 12: o campo de quem assina **nunca fica vazio** no `PRODUTO.md` — nem como `NAO DETERMINADO`.

Como nesta casa não existe papel de produto, a skill **provoca a definição**. Pergunte assim:

> Quem, na prática, hoje diria "não" a um cliente? O dono da empresa, o líder técnico, ou o responsável pelo atendimento?

Registre a pessoa como **signatário provisório**, com `provisorio: true`. Deixe explícito no arquivo que é provisório e que deve ser confirmado.

Se o usuário se recusar a nomear alguém, explique o custo em uma frase e insista uma vez:

> Ninguém assinando é o mesmo que o prodx não existir: os vereditos viram sugestão que ninguém encampa.

Se ainda assim não vier nome, registre o **papel** (ex.: `lider_tecnico`) em vez do nome, mantendo `provisorio: true`, e abra lacuna. Nunca deixe vazio.

### 4. Escreva o que o produto NÃO é

Esta seção vale mais que a anterior: é ela que sustenta a recusa de pedido fora de escopo no P4.

Escreva em negativas concretas e verificáveis, não em generalidades:

- Ruim: "Não é um sistema para tudo."
- Bom: "Não é sistema de folha de pagamento. Não controla frota. Não faz emissão fiscal — integra com quem faz."

Se o usuário não souber dizer, derive das recusas já registradas no `INDICE.md` e confirme.

### 5. Separe cliente que paga de usuário que usa

Quando forem pessoas diferentes, isso precisa estar explícito. É a origem de metade dos pedidos ruins: quem paga pede o que quer ver, quem usa sofre com o que foi pedido.

### 6. Registre as lacunas

Tudo que não foi verificável vira `NAO DETERMINADO` no `PRODUTO.md` **e** uma entrada em `LACUNAS.md` com: o campo, por que não foi determinado, e quem saberia responder.

## Formato da saída

Use `assets/TEMPLATE-PRODUTO.md`. Seções obrigatórias, nesta ordem:

1. O que o produto é — cinco linhas, sem jargão de vendas
2. O que o produto deliberadamente NÃO é
3. Cliente que paga e usuário que usa
4. Perfis de usuário e o que cada um faz
5. Modelo de negócio
6. Objetivos de negócio vigentes, com horizonte
7. Restrições que não se negociam — regulatórias, contratuais, técnicas
8. Quem decide — signatário, com marcação de provisório
9. Zonas de risco (do legadox, quando existir)
10. Mapa de funcionalidades existentes, por módulo, linha única cada

## Critério de saída

- `docs/produto/PRODUTO.md` existe, com frontmatter `kind: produto`.
- O campo do signatário está preenchido (regra 12).
- A seção "o que o produto NÃO é" tem pelo menos três negativas concretas.
- O mapa de funcionalidades cobre todos os módulos achados nas rotas.
- Todo `NAO DETERMINADO` tem entrada correspondente em `LACUNAS.md`.
- Nenhuma afirmação sem fonte verificável (regra 11).

## Quando falha

| Falha | O que fazer |
|-------|-------------|
| Repositório sem rotas legíveis (monolito antigo, código gerado) | Monte o mapa a partir dos relatórios de uso do runx e do menu da aplicação. Marque o mapa como parcial em `LACUNAS.md`. |
| Usuário não sabe o modelo de negócio | Derive das evidências: existe tabela/coluna de tenant ou empresa? Há mais de um banco? Confirme a derivação com ele antes de gravar. |
| Usuário não nomeia signatário | Registre o papel, `provisorio: true`, e abra lacuna. Nunca vazio. |
| Não há objetivos de negócio declarados | `NAO DETERMINADO` + lacuna. O P4 vai reportar "não serve objetivo conhecido" como achado, não como reprovação. |
| O produto mudou desde a última montagem | Atualize apenas as seções afetadas e registre a data em `atualizado_em`. Não reescreva o arquivo inteiro do zero. |

## Atualização sob demanda

Reabra o P1 quando:

- Um veredito depender de campo marcado `NAO DETERMINADO`.
- Uma funcionalidade nova entrar em produção (o mapa envelheceu).
- O signatário provisório for confirmado ou trocado — troque `provisorio: true` para `false` e registre a data.
