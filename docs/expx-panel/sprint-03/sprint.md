---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: expx-panel
sprint_id: sprint-03
titulo: Servidor e atualizacao ao vivo
status: concluido
criterio_saida: O servidor sobe em 127.0.0.1 serve a API de leitura e empurra estado novo por websocket ao mudar arquivo
fases: [F-03.1, F-03.2, F-03.3]
riscos: [Leitura durante gravacao da skill pode gerar rejeicao transitoria absorvida pelo debounce de D-27]
atualizado_em: 2026-08-29
---

# Sprint 03 — Servidor e atualização ao vivo

## Objetivo

Expor o objeto do projeto por uma API de leitura HTTP, observar a pasta `docs/` e empurrar o estado novo por websocket quando um arquivo mudar. Nenhuma regra de negócio aqui: o servidor só serve o que o parser produz.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-03.1 | API de leitura | nenhuma |
| F-03.2 | Observação e websocket | nenhuma |
| F-03.3 | CLI | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

Um teste sobe o servidor apontado para `fixtures/projeto-ok`, obtém o projeto por `GET /api/projeto`, altera um arquivo da fixture e recebe o estado novo pelo websocket, tudo com o servidor escutando apenas em 127.0.0.1.

## Riscos conhecidos

- Ler um arquivo no instante em que a skill o grava produz rejeição transitória; o debounce de 300ms (decisão D-27) absorve, mas o teste precisa provar que o estado converge (`base/12-atualizacao-ao-vivo.md`).
