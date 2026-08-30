---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: memox-painel
sprint_id: sprint-01
titulo: Capacidade de testar a memoria
status: concluido
criterio_saida: npm test verde com as duas fixtures novas e MemoriaSchema validando a projecao em runtime
fases: [F-01.1, F-01.2]
riscos: [O exemplo do motor pode divergir do que o memox grava hoje, Fixture com .expx pode ser ignorada por gitignore futuro]
atualizado_em: 2026-08-29
---

# Sprint 01 — Capacidade de testar a memória

## Objetivo

Entregar o que torna o TDD das sprints seguintes executável: as fixtures em disco que representam índice válido e índice corrompido, e o schema que valida a projeção da memória em runtime. Nenhuma funcionalidade de negócio.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Fixtures em disco | nenhuma |
| F-01.2 | Schema e tipo da memória | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`npm test` termina com 0 failed e `npm run typecheck` termina sem erro, com as duas fixtures novas (`projeto-memoria`, `projeto-memoria-corrompida`) presentes em disco, `MemoriaSchema` exportado por `src/parser/memoria/tipos.ts` validando a projeção em runtime, e `Estado` da UI com a chave `memoria` do tipo `Memoria | null`.

**O que esta sprint NÃO entrega:** o parser ainda não produz a chave `memoria` — isso é T-02.04. Até lá, `estado.memoria` é `null` em toda montagem, e é por isso que o tipo aceita `null`. Nenhum teste desta sprint afirma sobre a saída de `montarProjeto`.

O terceiro caso de teste — projeto sem índice — usa a fixture preexistente `fixtures/projeto-ok`, que continua sem índice (D-19).

## Riscos conhecidos

- A fixture deriva de `exemplos/indice.exemplo.json` do repositório MemoX (D-24); se o motor evoluir, o exemplo pode não refletir a gravação real (lacuna L-02, `base/00-LACUNAS.md`).
- O cast `as unknown as Estado` em `ui/src/telas/fixture.ts` impede o typecheck de acusar divergência entre o `Projeto` do servidor e o `Estado` da UI (`base/06-stack-testes-e-fixtures.md`, risco 3). Por isso a checagem do contrato entre camadas é feita em runtime, e só em T-02.04, quando o parser passa a produzir a chave.
- A fixture guarda `.expx/memoria/indice.json`. O `.gitignore` do repositório Expx hoje não a ignora — verificado em `base/06-stack-testes-e-fixtures.md` — mas uma linha futura a tornaria invisível.
