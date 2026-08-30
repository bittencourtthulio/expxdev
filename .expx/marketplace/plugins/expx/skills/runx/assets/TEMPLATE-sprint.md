---
expx_schema: 1
expx_tool: runx
kind: sprint
trabalho_id: {{OC-ID}}
sprint_id: sprint-{{NN}}
titulo: {{titulo da sprint, uma linha}}
status: {{nao_iniciado | em_andamento | bloqueado | concluido}}
criterio_saida: {{condicao verificavel, uma linha}}
fases: [F-{{NN}}.1]
riscos: [{{risco, uma linha}}]
atualizado_em: {{AAAA-MM-DD}}
---

> Frontmatter obrigatorio (expx-schema v1). Formato completo em `references/00-schema.md`. Substitua os marcadores; NUNCA omita uma chave — ausente e `null`, lista vazia e `[]`. Sem acento em chave nem em valor de enum. `atualizado_em` e reescrito a cada gravacao.

# Sprint {{NN}} — {{título da sprint}}

## Objetivo

{{O que esta sprint entrega, em uma ou duas frases.}}

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-{{NN}}.1 | {{título}} | {{F-NN.M ou "nenhuma"}} |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

> Lembrete de proporcionalidade: crie uma segunda sprint APENAS quando existir um portão real entre blocos entregáveis — algo que precisa estar aplicado antes que o bloco seguinte possa ser testado. "São dois assuntos diferentes" não é portão; isso é duas fases.

## Critério de saída

{{Condição verificável, binária, sem adjetivo, que precisa ser verdade para esta sprint estar concluída. Ex.: "a suíte roda com `<comando>` e termina com 0 failed".}}

## Riscos conhecidos

- {{risco vindo da base ou das decisões, com referência ao arquivo que o registra}}
- {{ou "Nenhum risco registrado."}}

## Fora de escopo

> Escopo travado (regra 8). O que foi percebido e NÃO será tocado nesta ocorrência. Melhoria avulsa vira sugestão de nova ocorrência no relatório técnico, nunca implementação.

- {{o que não será tocado}} — {{por quê}}
