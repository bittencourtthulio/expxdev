---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: expx-panel
sprint_id: sprint-02
titulo: Camada de parser
status: concluido
criterio_saida: O parser le fixtures/projeto-ok e fixtures/projeto-ruim sem lancar excecao e separa aceitos, rejeitados e violacoes
fases: [F-02.1, F-02.2, F-02.3, F-02.4, F-02.5]
riscos: [A linha da violacao exige parse posicional alem do gray-matter conforme D-24, O contrato e as skills divergem em arquivos e no kind decisoes resolvidos por D-01 e D-02]
atualizado_em: 2026-08-29
---

# Sprint 02 — Camada de parser

## Objetivo

Entregar a camada de parser inteira, isolada de servidor e de UI: recebe um caminho de pasta, devolve um objeto tipado, uma lista de rejeições e uma lista de violações. Testável sozinha contra as fixtures da sprint-01.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Tipos e esquemas zod | nenhuma |
| F-02.2 | Leitura de arquivo e rejeições | nenhuma |
| F-02.3 | Descoberta de trabalhos | nenhuma |
| F-02.4 | Agregação do projeto | nenhuma |
| F-02.5 | Regras de conformidade | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`npm test` termina com 0 failed; o parser lê `fixtures/projeto-ok` devolvendo 2 trabalhos e 0 rejeições, e lê `fixtures/projeto-ruim` devolvendo as rejeições e violações esperadas sem lançar exceção.

## Riscos conhecidos

- Obter a linha de uma violação dentro da lista `tasks:` exige parse posicional com `yaml` além do gray-matter (`base/11-conformidade-e-rejeicoes.md`, decisão D-24).
- O contrato e as skills divergem no campo `arquivos` e no kind `decisoes`; o parser aceita o superconjunto (decisões D-01 e D-02). Um teste por forma evita regressão silenciosa.
