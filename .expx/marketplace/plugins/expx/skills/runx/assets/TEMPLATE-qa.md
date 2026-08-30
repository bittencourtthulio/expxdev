---
expx_schema: 1
expx_tool: runx
kind: qa
trabalho_id: {{OC-ID}}
veredito: {{aprovado | reprovado}}
executado_em: {{AAAA-MM-DD}}
achados:
  - severidade: {{alta | media | baixa}}
    arquivo: {{caminho/relativo/arquivo.ext}}
    problema: {{o problema, uma linha}}
    correcao_sugerida: {{o que fazer, uma linha}}
atualizado_em: {{AAAA-MM-DD}}
---

> Sem achados, use `achados: []`. Existe achado `severidade: alta` → `veredito: reprovado`, sem excecao. O campo `veredito` espelha a linha VEREDITO da prosa.

> Frontmatter obrigatorio (expx-schema v1). Formato completo em `references/00-schema.md`. Substitua os marcadores; NUNCA omita uma chave — ausente e `null`, lista vazia e `[]`. Sem acento em chave nem em valor de enum. `atualizado_em` e reescrito a cada gravacao.

# QA — {{OC-ID}} {{slug}}

> Escrito no E4, por quem NÃO implementou. Este estágio só aponta: nenhum arquivo de código, teste ou plano é alterado aqui.

**Data:** {{AAAA-MM-DD}}

## Verificações

| # | Item | Resultado |
|---|---|---|
| 1 | O teste de regressão falhava antes e passa agora | {{OK \| ACHADO}} |
| 2 | Cada task tem os dois testes e eles testam o que dizem testar | {{OK \| ACHADO}} |
| 3 | Nenhum teste passaria com a implementação errada | {{OK \| ACHADO}} |
| 4 | A suíte inteira passa, incluindo o que não foi tocado | {{OK \| ACHADO}} |
| 5 | O critério de aceite de cada task foi atendido de fato | {{OK \| ACHADO}} |
| 6 | Os critérios de saída de cada fase e sprint foram atendidos | {{OK \| ACHADO}} |
| 7 | Nada fora do escopo declarado foi alterado (diff conferido) | {{OK \| ACHADO}} |
| 8 | O comportamento descrito na investigação é o comportamento real | {{OK \| ACHADO}} |

## Conferência do diff contra o escopo

**Arquivos no diff e não autorizados** (ALTA): {{lista, ou "nenhum"}}
**Arquivos autorizados e ausentes do diff** (MÉDIA): {{lista, ou "nenhum"}}

## Achados

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| {{ALTA \| MÉDIA \| BAIXA}} | `{{caminho/relativo}}` | {{o problema}} | {{o que fazer}} |

{{Se não houver achados, apague a tabela e escreva: `Nenhum achado.`}}

## Saída da suíte

```
{{cole aqui a saída da execução completa da suíte, rodada por você — não o resultado relatado pelo E3}}
```

## Veredito

{{Use LITERALMENTE uma destas duas linhas. Existe achado ALTA → REPROVADO. Nenhum achado ALTA → APROVADO (MÉDIA e BAIXA ficam registrados, não bloqueiam).}}

VEREDITO: APROVADO — a ocorrência está pronta para fechamento.
VEREDITO: REPROVADO — a ocorrência não está pronta para fechamento.
