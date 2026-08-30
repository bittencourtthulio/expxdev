---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: memox-painel
sprint_id: sprint-03
titulo: Instalacao do memox pelo CLI
status: concluido
criterio_saida: npx expxdev init com memox copia skill hooks e registra os dois eventos em settings.json sem duplicar
fases: [F-03.1, F-03.2, F-03.3]
riscos: [O hook resolve o motor por caminho relativo e fica inerte em silencio se a skill nao for irma, Merge da chave hooks pode duplicar entrada em reinstalacao]
atualizado_em: 2026-08-29
---

# Sprint 03 — Instalação do memox pelo CLI

## Objetivo

Fazer `npx expxdev init` instalar o memox por completo: a skill no catálogo, os hooks copiados com bit de execução, os dois eventos registrados em `settings.json` de forma idempotente, e o `doctor` capaz de detectar instalação quebrada.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-03.1 | Catálogo e montagem dos hooks | nenhuma |
| F-03.2 | Registro em settings.json | nenhuma |
| F-03.3 | Diagnóstico e documentação | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`npm test` termina com 0 failed, com testes provando que: `memox` está no catálogo como camada apontando para a URL real; após `executarInit` o hook existe com bit de execução e o motor no caminho irmão que ele resolve; `mesclarSettings` registra os dois eventos sem duplicar na segunda execução e mantém o arquivo inalterado quando não há hooks; o `doctor` acusa hook sem motor; e o README não diz mais "cinco skills".

## Riscos conhecidos

- O hook resolve o motor como `DIR_HOOK/../skills/memox/assets/memox.py` e sai `0` em silêncio se não achar (`base/05-hooks-do-memox.md`). Instalação errada é invisível — endereçado por D-15 e pelo `doctor` (D-17).
- `mesclarSettings` nunca tratou a chave `hooks`, que é objeto de arrays (lacuna L-09, `base/00-LACUNAS.md`). Endereçado por D-16 e testado em T-03.05.
