---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: expx-panel
sprint_id: sprint-04
atualizado_em: 2026-08-29
fases:
  - id: F-04.1
    titulo: Andaime da UI
    status: concluido
    criterio_saida: A app React monta consome a API e reage ao websocket
    paralelizavel: false
    paralela_com: []
    tasks: [T-04.01, T-04.02]
  - id: F-04.2
    titulo: Visao global e quadro
    status: concluido
    criterio_saida: Os cards de resumo e o quadro por estagio renderizam com filtro
    paralelizavel: true
    paralela_com: [F-04.3]
    tasks: [T-04.03, T-04.04]
  - id: F-04.3
    titulo: Detalhe do trabalho
    status: concluido
    criterio_saida: A tela de detalhe mostra sprints fases tasks progresso e dependencias
    paralelizavel: true
    paralela_com: [F-04.2]
    tasks: [T-04.05, T-04.06]
  - id: F-04.4
    titulo: Conformidade historico e fora do schema
    status: concluido
    criterio_saida: As tres telas restantes renderizam a partir da API
    paralelizavel: false
    paralela_com: []
    tasks: [T-04.07, T-04.08, T-04.09]
---

# Fases — Sprint 04

---

## F-04.1 — Andaime da UI

**Objetivo:** Ter a app React montando, consumindo `GET /api/projeto` e reagindo ao websocket.

**Tasks que a compõem:** T-04.01, T-04.02

**Critério de saída:** A app monta, carrega o projeto e substitui o estado ao receber mensagem do websocket.

**Roda em paralelo com:** nenhuma

---

## F-04.2 — Visão global e quadro

**Objetivo:** Entregar os cards de resumo e o quadro por estágio com os filtros do pedido.

**Tasks que a compõem:** T-04.03, T-04.04

**Critério de saída:** Os quatro cards e as onze colunas renderizam, e os filtros de ferramenta, tipo e status funcionam.

**Roda em paralelo com:** F-04.3

---

## F-04.3 — Detalhe do trabalho

**Objetivo:** Entregar a tela de detalhe com sprints, fases, tasks, progresso, dependências e caminho crítico.

**Tasks que a compõem:** T-04.05, T-04.06

**Critério de saída:** A tela mostra as barras de progresso, destaca o paralelizável e evidencia o caminho crítico.

**Roda em paralelo com:** F-04.2

---

## F-04.4 — Conformidade, histórico e fora do schema

**Objetivo:** Entregar as três telas restantes do pedido.

**Tasks que a compõem:** T-04.07, T-04.08, T-04.09

**Critério de saída:** As três telas renderizam a partir da API, com busca no histórico e botão de copiar no relatório de uso.

**Roda em paralelo com:** nenhuma
