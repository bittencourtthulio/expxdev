---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: expx-panel
sprint_id: sprint-03
atualizado_em: 2026-08-29
fases:
  - id: F-03.1
    titulo: API de leitura
    status: concluido
    criterio_saida: GET /api/projeto devolve o objeto do projeto em JSON com codigo 200
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.01, T-03.02]
  - id: F-03.2
    titulo: Observacao e websocket
    status: concluido
    criterio_saida: Alterar um arquivo da fixture faz o servidor empurrar estado novo
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.03, T-03.04]
  - id: F-03.3
    titulo: CLI
    status: concluido
    criterio_saida: npx expx-painel sobe o servidor com as flags do contrato de linha de comando
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.05, T-03.06]
---

# Fases — Sprint 03

---

## F-03.1 — API de leitura

**Objetivo:** Servir o objeto do projeto por HTTP, escutando exclusivamente em 127.0.0.1.

**Tasks que a compõem:** T-03.01, T-03.02

**Critério de saída:** `GET /api/projeto` devolve 200 com o objeto do projeto em JSON.

**Roda em paralelo com:** nenhuma

---

## F-03.2 — Observação e websocket

**Objetivo:** Observar a pasta e empurrar o estado novo aos clientes conectados quando um arquivo mudar.

**Tasks que a compõem:** T-03.03, T-03.04

**Critério de saída:** Alterar um arquivo da fixture faz o servidor empurrar o estado novo pelo websocket.

**Roda em paralelo com:** nenhuma

---

## F-03.3 — CLI

**Objetivo:** Entregar o binário `expx-painel` com as flags do pedido.

**Tasks que a compõem:** T-03.05, T-03.06

**Critério de saída:** `npx expx-painel --porta N --dir D --no-open` sobe o servidor com os valores informados.

**Roda em paralelo com:** nenhuma
