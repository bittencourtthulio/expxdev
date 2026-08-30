---
kind: produto
schema: expx-schema-v1
produto: <nome do produto>
criado_em: <AAAA-MM-DD>
atualizado_em: <AAAA-MM-DD>
modelo_negocio: <produto_unico_multi_cliente | instalacao_por_cliente | customizacao_por_contrato>
signatario: <nome ou papel de quem assina os vereditos>
signatario_provisorio: <true | false>
tem_perfil_legadox: <true | false>
lacunas_abertas: <numero>
---

# Produto — <nome>

## 1. O que o produto é

<Cinco linhas, sem jargão de vendas. O que ele faz, para quem, e por que
alguém paga por ele. Escreva como se explicasse a um desenvolvedor novo
no primeiro dia, não como se vendesse a um comprador.>

## 2. O que o produto deliberadamente NÃO é

<Esta seção vale mais que a anterior: é ela que sustenta a recusa de
pedido fora de escopo no P4. Negativas concretas e verificáveis, nunca
generalidades. Mínimo três.>

- Não <negativa concreta>.
- Não <negativa concreta>.
- Não <negativa concreta>.

## 3. Cliente que paga e usuário que usa

| | Quem | Observação |
|---|---|---|
| Paga | <quem contrata> | |
| Usa | <quem opera no dia a dia> | |

<Quando forem pessoas diferentes, explicite a consequência: quem paga
pede o que quer ver, quem usa sofre com o que foi pedido. É a origem de
metade dos pedidos ruins.>

## 4. Perfis de usuário

| Perfil | O que faz no sistema |
|--------|---------------------|
| <perfil> | <em uma linha> |

## 5. Modelo de negócio

<produto_unico_multi_cliente | instalacao_por_cliente | customizacao_por_contrato>

<Consequência para os vereditos. Em produto único multi-cliente, pedido
que serve a um cliente só é decisão de produto, não decisão técnica.>

## 6. Objetivos de negócio vigentes

| Objetivo | Horizonte |
|----------|-----------|
| <objetivo> | <até quando> |

## 7. Restrições que não se negociam

| Restrição | Natureza | Origem |
|-----------|----------|--------|
| <restrição> | <regulatoria \| contratual \| tecnica> | <norma, contrato ou limite> |

## 8. Quem decide

**Signatário:** <nome ou papel>
**Provisório:** <sim | nao>

<Regra 12: este campo nunca fica vazio, nem como NAO DETERMINADO.
Se provisório, registre o que falta para confirmar. Ninguém assinando é
o mesmo que o prodx não existir: os vereditos viram sugestão que ninguém
encampa.>

## 9. Zonas de risco

<Do PERFIL.md do legadox, quando existir. Tocar zona de risco é gatilho
G6 de avaliação completa. Sem legadox, escreva "sem PERFIL.md do legadox"
e siga.>

| Zona | Por que é risco |
|------|-----------------|

## 10. Mapa de funcionalidades existentes

<Insumo da verificação de existência do P3. Uma linha por funcionalidade,
agrupada por módulo, na linguagem do cliente e não na do código. Uma
funcionalidade mal descrita aqui é uma verificação que falha depois.>

### <Módulo>

- **<Funcionalidade>** — <o que faz, em uma linha> — <caminho no menu ou rota>
