---
kind: pedido
schema: expx-schema-v1
pd_id: <PD-AAAA-NNNN>
titulo: <titulo curto na linguagem de quem pediu>
data: <AAAA-MM-DD>
origem: <cliente | suporte | interno>
autor: <quem pediu>
canal: <por onde chegou>
classificacao: <correcao | duvida | melhoria | novo | fora_de_escopo>
gatilhos_disparados: [<G1..G8>]
aguardando_resposta: <true | false>
---

# <PD-ID> — <título>

## 1. Pedido original

<Texto literal, como chegou, com os erros e a informalidade. Não limpe,
não resuma, não traduza para linguagem técnica. O original é evidência.>

> <pedido literal>

**Quem pediu:** <nome> · **Canal:** <canal> · **Quando:** <AAAA-MM-DD>

## 2. Solução pedida

<O que o cliente pediu, literalmente, em termos de artefato.>

## 3. Problema por trás

<O que dói. O que ele não consegue fazer hoje. Se não foi dito e não deu
para apurar: NAO DETERMINADO, e a pergunta vai para a seção 8.>

## 4. Motivação

<Por que dói agora. O que mudou. Quem cobra isso dele. Frequentemente não
é obtível — NAO DETERMINADO é resposta legítima, invenção não é.>

## 5. Pergunta estruturante

> Se isso fosse resolvido de outro jeito, o cliente ficaria satisfeito?

**Resposta:** <sim | nao>

<Se sim: a solução pedida não é o requisito, o problema é. Se não: o
cliente quer aquele artefato específico — registre a restrição não dita
que explica isso.>

## 6. Classificação

**<correcao | duvida | melhoria | novo | fora_de_escopo>** — <justificativa em uma linha>

<Provisória até o P3: um `novo` vira `duvida` com frequência quando a
verificação de existência acha a tela.>

## 7. Verificação de comportamento intencional

<Obrigatório quando a classificação for `correcao` e o pedido descrever
cálculo, prazo, permissão, bloqueio ou validação. Regra 7.>

**Onde procurei:** <comentários, testes, migrações, relatórios de uso do runx, restrições do PRODUTO.md>
**Achei:** <evidência de que é deliberado, ou "nada — procurei e não achei">
**Conclusão:** <e bug | e comportamento intencional, reclassificar>

## 8. Perguntas em aberto

<Máximo cinco. Informação que falta vira pergunta, nunca suposição
(regra 8). Se houver pergunta essencial, o P3 não começa.>

| # | Pergunta | Para quem | O que muda na resposta |
|---|----------|-----------|------------------------|
