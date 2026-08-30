# {{ÁREA / MÓDULO / ENTIDADE MAPEADA}}

> Substitua todos os marcadores `{{...}}`. Se o código não deixa claro, escreva `NÃO DETERMINADO` — nunca preencha com o que "deve ser". Toda afirmação sobre comportamento aponta para arquivo e linha. Proibido escrever código de implementação aqui: trechos citados do código existente, sim; código novo, não.

## O que é e onde vive

{{Arquivos e caminhos relativos, com linha quando fizer sentido. Uma frase dizendo o papel desta área.}}

## Contrato de entrada

{{Parâmetros, payload, campos de formulário: nome, tipo, obrigatoriedade, validação existente. Ou `NÃO DETERMINADO`.}}

## Contrato de saída

{{Retorno, resposta, efeito colateral, o que é persistido. Ou `NÃO DETERMINADO`.}}

## Estrutura de dados

{{Tabelas e colunas envolvidas, tipos, chaves, índices, constraints. Cite a migração ou o arquivo de schema que afirma cada coisa. Inclua um exemplo real de registro quando possível; se não houver acesso a dado real, `NÃO DETERMINADO` — não invente um registro plausível.}}

## Funções e trechos relevantes

{{Assinaturas e trechos de código citados textualmente, com caminho e linha.}}

```
{{trecho citado}}
```
`{{caminho/relativo/arquivo.ext}}:{{linha}}`

## Quem chama e quem é chamado

**Chamadores:** {{telas, jobs, endpoints, relatórios, integrações — cada um com caminho e linha}}

**Dependências:** {{o que esta área invoca, especialmente o que atravessa fronteira: banco, fila, HTTP, cache, arquivo}}

## Testes existentes

{{O que já é coberto, com o arquivo de teste e o caso. E, explicitamente, o que NÃO é coberto.}}

## Limites e regras de negócio conhecidas

{{Faixas, limites, arredondamentos, regras de exceção — cada uma com a referência de arquivo e linha que a afirma. Ou `NÃO DETERMINADO`.}}

## Riscos para esta ocorrência

{{O que, do que está acima, pode quebrar ao mexer nesta ocorrência.}}

## Fonte

{{Caminhos de arquivo lidos e, quando houver, documentação interna}} — mapeado em {{AAAA-MM-DD}}
