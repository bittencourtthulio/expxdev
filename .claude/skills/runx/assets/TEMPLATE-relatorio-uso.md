---
expx_schema: 1
expx_tool: runx
kind: relatorio_uso
trabalho_id: {{OC-ID}}
titulo: {{titulo em linguagem de cliente, sem acento, uma linha}}
tipo_ocorrencia: {{bug | melhoria-ui | melhoria-ux | novo-relatorio | regra-de-calculo | campo-novo | outro}}
fechado_em: {{AAAA-MM-DD}}
modulo_afetado: [{{area do sistema em linguagem de cliente}}]
---

<!--
LEITOR: o suporte copia este texto e devolve ao cliente.

PROIBIDO APARECER NESTE ARQUIVO — inclusive DENTRO DO FRONTMATTER:
  - nome de arquivo, de pasta ou de caminho
  - nome de função, classe, método ou variável
  - nome de tabela, de coluna ou de banco de dados
  - jargão técnico: endpoint, API, cache, migração, deploy, commit, branch,
    query, log, null, timeout, teste unitário, regressão, integração, build
  - stack trace, trecho de código ou mensagem de erro bruta
  - identificador interno: número de task, nome de sprint, código de commit
  - "N/A" ou "não aplicável" — escreva a dispensa em linguagem de cliente

O FRONTMATTER deste arquivo:
  - NAO leva arquivos_alterados nem testes_adicionados
  - titulo e modulo_afetado vao em linguagem de cliente
  - nenhum nome de arquivo, funcao, tabela ou coluna no YAML

OBRIGATÓRIO:
  - frases curtas, uma ideia por frase
  - falar do que a pessoa VÊ e FAZ no sistema: a tela, o botão, o valor
  - teste final: se um cliente que não é desenvolvedor não entenderia
    qualquer frase, está errado — reescreva

Apague este comentário antes de salvar? NÃO. Ele não aparece no texto
renderizado e serve de lembrete para quem editar o arquivo depois.
-->

# {{Título da ocorrência, em linguagem de cliente}}

## O que estava acontecendo

{{O problema, do ponto de vista de quem usa o sistema. O que aparecia errado, em qual tela, em qual situação.}}

## O que muda a partir de agora

{{O novo comportamento, descrito pelo que a pessoa vai ver.}}

## Se é preciso fazer algo diferente

{{O que a pessoa precisa fazer de diferente daqui para frente. Se não há nada, escreva: "Não é preciso fazer nada diferente."}}

## Se é preciso refazer alguma coisa que ficou errada no período

{{O que ficou errado enquanto o problema existiu e o que a pessoa deve conferir ou refazer. Se nada precisa ser refeito, escreva: "Nada precisa ser refeito." Se algo precisa, diga exatamente o que conferir e onde.}}
