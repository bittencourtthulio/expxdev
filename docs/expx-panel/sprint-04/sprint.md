---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: expx-panel
sprint_id: sprint-04
titulo: Interface do painel
status: concluido
criterio_saida: As seis telas do pedido renderizam a partir da API e a tela atualiza sozinha ao mudar arquivo
fases: [F-04.1, F-04.2, F-04.3, F-04.4]
riscos: [Nenhuma regra de negocio pode migrar para a UI conforme a arquitetura em camadas decidida na F2]
atualizado_em: 2026-08-29
---

# Sprint 04 — Interface do painel

## Objetivo

Entregar as seis telas do pedido em React, consumindo a API de leitura. Nenhuma regra de negócio na UI: ela renderiza o que o servidor manda.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-04.1 | Andaime da UI | nenhuma |
| F-04.2 | Visão global e quadro | F-04.3 |
| F-04.3 | Detalhe do trabalho | F-04.2 |
| F-04.4 | Conformidade, histórico e fora do schema | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`npm run build` empacota a UI sem erro, e um teste de componente prova que cada uma das seis telas renderiza a partir de um objeto de projeto de fixture.

## Riscos conhecidos

- A arquitetura em camadas decidida na F2 proíbe regra de negócio na UI; cálculo de progresso e detecção de violação vêm prontos do parser (`00-DECISOES.md`, D-30).
