---
kind: veredito
schema: expx-schema-v1
pd_id: <PD-AAAA-NNNN>
titulo: <titulo curto>
data: <AAAA-MM-DD>
veredito: <ja_existe | nao_fazer | fazer_outra_coisa | fazer>
via: <triagem | avaliacao>
gatilhos_disparados: [<G1..G8>]
aprovado_por: PENDENTE
aprovado_em: PENDENTE
provisorio: <true | false>
trabalho_gerado: <runx:<id> | sprintx:<id> | ->
recorrencia: <numero>
---

# <PD-ID> — Veredito

## Recomendação

**<JA EXISTE | NAO FAZER | FAZER OUTRA COISA | FAZER>**

## Raciocínio

<Três linhas. Três, não dez. Se não cabe em três, a avaliação não
convergiu: volte ao P4 e identifique qual das sete perguntas ficou
ambígua.>

1. <linha>
2. <linha>
3. <linha>

## Evidência principal

<A única evidência que, sozinha, sustenta a recomendação. No formato do
P3: tela + caminho · rota + arquivo:linha · arquivo:linha · ocorrência +
trecho · PD-ID + veredito.>

## O que muda a recomendação

<Qual fato, se for descoberto, derruba esta conclusão. Para nao_fazer,
este campo é o que permite revisar a recusa quando o contexto mudar — o
motivo precisa ser datado, falseável e ligado a uma premissa.>

## Escopo mínimo aprovado

<Do P4, literal. Vazio apenas quando o veredito for ja_existe ou
nao_fazer.>

## Assinatura

<Regra 1: a skill não decide, recomenda com evidência; humano assina.
Regra 2: nenhum trabalho segue para sprintx ou runx sem este campo
preenchido. A skill nunca preenche estes dois campos por conta própria.>

**Deve assinar:** <signatário do PRODUTO.md> <(provisório)>

| Campo | Valor |
|-------|-------|
| Aprovado por | PENDENTE |
| Aprovado em | PENDENTE |

**Divergência registrada:** <quando quem assina discorda do veredito,
registre aqui o argumento dele e siga a decisão dele. Ele assina, ele
decide.>

## Comunicação

**Texto ao cliente:** <escrito | nao se aplica>
**Enviado por:** <o prodx não fala com o cliente — quem envia é o atendimento>
