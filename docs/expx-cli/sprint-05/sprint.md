---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: expx-cli
sprint_id: sprint-05
titulo: Update doctor e publicacao
status: concluido
criterio_saida: update respeita modificacao local e doctor diagnostica o projeto quebrado das fixtures
fases: [F-05.1, F-05.2, F-05.3]
riscos: [Rollback ficou pelo versionador entao o update e obrigado a dizer isso na saida]
atualizado_em: 2026-08-29
---

# Sprint 05 — Update, doctor e publicação

## Objetivo

Fechar a definição de pronto: o `update` com suas oito etapas e seis flags, o `doctor` com os onze verificadores, e o pacote pronto para publicar como `@expx/cli`.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-05.1 | Update | nenhuma |
| F-05.2 | Doctor | F-05.3 |
| F-05.3 | Publicação | F-05.2 |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`update` respeita modificação local e não sobrescreve, e `doctor` diagnostica corretamente as fixtures de projeto quebrado; `npm test` termina com 0 failed.

## Riscos conhecidos

- O rollback ficou pelo versionador (D-10), então o `update` é **obrigado** a dizer isso na saída — se não disser, a decisão foi violada.
- O comportamento de plugin pode mudar de versão do Claude Code (L-16), por isso o `doctor` verifica o efeito e não só a sintaxe (D-05).
