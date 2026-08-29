---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: expx-cli
sprint_id: sprint-04
titulo: Subcomandos init add remove e panel
status: concluido
criterio_saida: expx init instala num projeto limpo e expx panel sobe o painel sem nada instalado
fases: [F-04.1, F-04.2, F-04.3]
riscos: [A instalacao depende do binario claude estar disponivel na maquina]
atualizado_em: 2026-08-29
---

# Sprint 04 — Subcomandos: init, add, remove, panel

## Objetivo

Dar interface de linha de comando ao núcleo já testado: roteador de subcomando, o fluxo do `init` (interativo e por flag), `add`/`remove`, e o `panel` preservando o comportamento atual do painel.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-04.1 | Roteador de subcomando | nenhuma |
| F-04.2 | Init e seleção | nenhuma |
| F-04.3 | Add, remove e panel | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`expx init` instala num projeto limpo com as skills escolhidas, e `expx panel` sobe o painel num projeto sem nada instalado; `npm test` termina com 0 failed.

## Riscos conhecidos

- A instalação de fato depende do binário `claude` estar disponível na máquina (D-03, `base/09-validacao-marketplace-local.md`); quando ausente, o init precisa degradar com instrução clara em vez de falhar.
- O `marketplace add` grava caminho absoluto no settings do usuário (`base/09`), então o passo não é reproduzível por commit.
