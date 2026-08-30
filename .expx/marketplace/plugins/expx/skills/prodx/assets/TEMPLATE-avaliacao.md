---
kind: avaliacao
schema: expx-schema-v1
pd_id: <PD-AAAA-NNNN>
data: <AAAA-MM-DD>
dentro_do_escopo: <sim | nao | nao_determinado>
beneficiario: <um_cliente | um_perfil | todos>
serve_objetivo: <sim | nao | nao_determinado>
custo_de_nao_fazer: <cliente_perdido | risco_regulatorio | processo_manual | nada>
tem_solucao_fora_do_software: <true | false>
recorrencia: <numero>
---

# <PD-ID> — Avaliação

## 1. Está dentro do que o produto é?

**<sim | nao | nao determinado>**

<Confronte com a seção "o que o produto deliberadamente NÃO é" do
PRODUTO.md. Se bate com uma negativa, cite-a literalmente. Se o
PRODUTO.md não tem negativa que cubra o caso, isso é lacuna: registre e
leve a pergunta ao signatário.>

## 2. Quem se beneficia?

**<um cliente | um perfil | todos>**

<Em produto multi-cliente, pedido que serve a um só é decisão de produto.
Registre as três opções com o custo de cada uma e leve ao veredito para
assinatura. Nunca mande direto para o sprintx.>

| Opção | Custo | Consequência |
|-------|-------|--------------|
| Virar customização | | |
| Virar produto | | |
| Recusar | | |

## 3. Qual objetivo de negócio isso serve?

**<objetivo do PRODUTO.md, ou "nenhum">**

<Se não serve nenhum, isso é um achado, não um detalhe — repita na seção
de achados destacados. Pode ainda ser feito por relacionamento ou
contrato, mas a decisão precisa ser tomada sabendo disso.>

## 4. Qual o custo de NÃO fazer?

**<cliente perdido | risco regulatorio | processo manual | nada>**

<"Nada" é resposta legítima e frequente. Cliente perdido: qual cliente,
qual contrato, quem afirmou — cite a fonte. Ameaça repassada por terceiro
perde força e isso importa no veredito. Processo manual: número de
pessoas e horas por semana, não adjetivo.>

## 5. Existe solução fora do software?

**<sim | nao>**

| Alternativa | Resolve? | Por quê |
|-------------|----------|---------|
| Configuração já disponível | | |
| Treinamento | | |
| Ajuste de processo | | |
| Ferramenta que o cliente já tem | | |

<Software é a solução mais cara. Se alguma resolve, é candidata a
fazer_outra_coisa ou nao_fazer.>

## 6. Escopo mínimo

<Regra 6: nunca fica vazio. Se você não achou uma versão menor, procurou
pouco. Técnicas: corte de perfil, de volume, de automação, de
generalidade, e aproveitamento do EXISTE PARCIAL do P3.>

**A versão dez vezes menor:** <uma frase que caiba num briefing>

**O que ela deliberadamente deixa de fora:** <lista curta>

**Se o escopo mínimo for igual ao pedido:** <argumento de por que não dá
para cortar — é o único caso em que "não há versão menor" é aceitável>

## 7. Recorrência

**recorrencia:** <numero>

| PD-ID anterior | Veredito | Motivo | Data |
|----------------|----------|--------|------|

**O motivo anterior ainda vale?** <sim | nao> — <justificativa>

<Um pedido recusado que volta pela quinta vez é sinal de que a recusa
envelheceu. Registre a mudança de contexto, não repita a recusa por
inércia.>

## Achados destacados

<O que apareceu e não estava previsto: objetivo não servido, decisão de
produto da pergunta 2, recusa envelhecida da 7.>

## O que muda a recomendação

<Insumo direto do VEREDITO.md: qual fato, se descoberto, derruba a
conclusão.>
