---
expx_schema: 1
expx_tool: runx
kind: ocorrencia
trabalho_id: {{OC-ID}}
titulo: {{titulo sem acento, uma linha}}
tipo_ocorrencia: {{bug | melhoria-ui | melhoria-ux | novo-relatorio | regra-de-calculo | campo-novo | outro}}
recebido_em: {{AAAA-MM-DD}}
origem: {{ticket-NNNN | canal | caminho do arquivo | null}}
tem_reproducao: {{true | false}}
modulo_afetado: [{{modulo}}]
atualizado_em: {{AAAA-MM-DD}}
---

> Frontmatter obrigatorio (expx-schema v1). Formato completo em `references/00-schema.md`. Substitua os marcadores; NUNCA omita uma chave — ausente e `null`, lista vazia e `[]`. Sem acento em chave nem em valor de enum. `atualizado_em` e reescrito a cada gravacao.

# {{OC-ID}} — {{título da ocorrência}}

> Substitua todos os marcadores `{{...}}`. O relato do cliente é preservado LITERALMENTE: não reescreva, não corrija, não resuma. Se um campo não veio no chamado, escreva `NÃO DETERMINADO`.

## Identificação

| Campo | Valor |
|---|---|
| identificador | {{OC-ID vindo do ticket, ou OC-AAAA-NNNN gerado}} |
| titulo | {{título curto da ocorrência}} |
| tipo | {{bug \| melhoria-ui \| melhoria-ux \| novo-relatorio \| regra-de-calculo \| campo-novo \| outro}} |
| aberta em | {{AAAA-MM-DD}} |

{{Se o tipo era ambíguo, registre a escolha aqui em uma linha: "Tipo ambíguo entre X e Y; escolhido X porque ...".}}

## Relato original do cliente

> {{Cole aqui o texto do cliente, literalmente, sem editar.}}

## Passos de reprodução

1. {{passo}}
2. {{passo}}
3. {{resultado observado}} — esperado: {{resultado esperado}}

{{Ou `NÃO DETERMINADO`. Atenção: se o tipo é `bug` e não há passos nem evidência suficiente, o E1 para aqui e pergunta.}}

## Ambiente, versão e dados relevantes

- **Ambiente:** {{produção \| homologação \| ... , ou NÃO DETERMINADO}}
- **Versão:** {{versão/release do sistema, ou NÃO DETERMINADO}}
- **Usuário/perfil:** {{quem reproduziu, com qual papel, ou NÃO DETERMINADO}}
- **Dados envolvidos:** {{identificadores de registro, valores citados no relato, ou NÃO DETERMINADO}}
- **Evidências anexadas:** {{print, log, mensagem de erro, ou NÃO DETERMINADO}}
