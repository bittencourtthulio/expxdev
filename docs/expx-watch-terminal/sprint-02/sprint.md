---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: expx-watch-terminal
sprint_id: sprint-02
titulo: Desenho puro do painel em texto
status: concluido
criterio_saida: desenhar devolve a lista de linhas completa para as nove fixtures de disco em 80 e em 60 colunas, sem nenhum TTY envolvido
fases: [F-02.1, F-02.2, F-02.3]
riscos: [Toda a camada de desenho e construcao nova porque o projeto nao tem uma linha de ANSI nem le columns, Acento em NFD conta dois code points e quebraria o corte em 80 colunas]
atualizado_em: 2026-08-30
---

# Sprint 02 — Desenho puro do painel em texto

## Objetivo

Entregar a camada de desenho como função pura `(visao, largura, cor) => string[]`, testável sem nenhum TTY (D-11). É o maior bloco de trabalho realmente novo da feature: o projeto não tem uma linha de ANSI, não lê `columns` e não usa `setRawMode` (`base/bibliotecas-de-terminal.md`).

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Largura, corte e cor | F-02.2 |
| F-02.2 | Projecao do estado para a visao do watch | F-02.1 |
| F-02.3 | As cinco secoes do painel | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`desenhar` devolve a lista de linhas completa para as nove fixtures de disco (tabela em `sprint-01/sprint.md`), em 80 e em 60 colunas, sem nenhum TTY envolvido, e nenhuma linha devolvida excede a largura pedida.

## Riscos conhecidos

- Toda a camada de desenho é construção nova: nenhuma ocorrência de ANSI, `columns` ou `setRawMode` no projeto (`base/bibliotecas-de-terminal.md`, risco 1).
- Acento em NFD conta dois code points e quebraria o corte em 80 colunas (`base/schema-v1-e-kinds.md`, risco 3; decidido em D-15).
- No modo degradado, `raio`, `orcamento_*`, `branch` e `pr_estado` não têm fonte alguma — as linhas simplesmente não podem ser exibidas (`base/estado-json.md`, risco 2).
