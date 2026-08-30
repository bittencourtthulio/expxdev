---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: memox-painel
sprint_id: sprint-02
titulo: Leitura da memoria e tela no painel
status: concluido
criterio_saida: GET /api/memoria responde 200 e a secao Memoria renderiza as quatro tabelas o estado vazio e o csv
fases: [F-02.1, F-02.2, F-02.3]
riscos: [Payload do websocket cresce com a memoria embutida no estado, Reindexacao gravando em .expx pode realimentar a recarga do observador]
atualizado_em: 2026-08-29
---

# Sprint 02 — Leitura da memória e tela no painel

## Objetivo

Ler `.expx/memoria/indice.json`, projetá-lo enxuto no `EstadoPainel`, servi-lo por rota própria e mostrá-lo numa seção Memória da UI, com estado vazio que ensina a gerar o índice.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Leitura e projeção do índice | nenhuma |
| F-02.2 | Exposição pelo servidor | nenhuma |
| F-02.3 | Tela de Memória | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`GET /api/memoria` responde `200` com `{ memoria }` e `POST` na mesma rota responde `405`; `GET /api/projeto` traz a chave `memoria`; a seção Memória renderiza as quatro tabelas (arquivos de risco, regressões, coincidências, artefatos contaminados) na fixture com índice, mostra o estado vazio com o comando de indexação na fixture sem índice, e exporta os arquivos de risco em CSV.

## Riscos conhecidos

- O painel difunde o estado inteiro a cada mudança de arquivo (decisão D-28, `base/02-painel-estado-e-api.md`); embutir a memória aumenta cada difusão. Mitigado pela projeção enxuta (D-04).
- A reindexação grava em `.expx/memoria/`, que o observador hoje não ignora (`base/02-painel-estado-e-api.md`, lacuna L-10). Endereçado por T-02.03 (D-06).
