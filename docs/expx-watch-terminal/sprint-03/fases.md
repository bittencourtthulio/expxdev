---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: expx-watch-terminal
sprint_id: sprint-03
atualizado_em: 2026-08-30
fases:
  - id: F-03.1
    titulo: Observador de duas raizes
    status: concluido
    criterio_saida: observarFontes dispara ao mudar docs e ao mudar .expx/estado.json, com debounce, e para sem vazar handle
    paralelizavel: true
    paralela_com: [F-03.2]
    tasks: [T-03.01, T-03.02]
  - id: F-03.2
    titulo: Terminal - redesenho, restauracao e opcoes
    status: concluido
    criterio_saida: o redesenho reescreve so as linhas mudadas, a restauracao roda nos quatro caminhos de saida, e as tres formas de invocacao sao interpretadas
    paralelizavel: true
    paralela_com: [F-03.1]
    tasks: [T-03.03, T-03.04, T-03.05]
  - id: F-03.3
    titulo: Subcomando watch no CLI
    status: concluido
    criterio_saida: expx watch nas tres formas devolve codigo de saida correto, o modo todos lista sem arvore, e o teste de somente leitura passa
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.06, T-03.07, T-03.08, T-03.09]
---

# Fases — Sprint 03

---

## F-03.1 — Observador de duas raízes

**Objetivo:** observar `docs/` e `.expx/estado.json` com gatilhos separados, sem tocar o observador do painel.

**Tasks que a compõem:** T-03.01, T-03.02

**Critério de saída:** `observarFontes` dispara ao mudar `docs/` e ao mudar `.expx/estado.json`, com debounce, e para sem vazar handle.

**Roda em paralelo com:** F-03.2 — arquivos disjuntos.

---

## F-03.2 — Terminal: redesenho, restauração e opções

**Objetivo:** redesenhar sem piscar, devolver o terminal ao estado anterior em qualquer caminho de saída, e interpretar as opções — T-03.05 é parser puro sem dependência, e roda aqui em vez de esperar F-03.3 (achado BAIXA da auditoria).

**Tasks que a compõem:** T-03.03, T-03.04, T-03.05

**Critério de saída:** o redesenho reescreve só as linhas mudadas, a restauração roda nos quatro caminhos de saída, e as três formas de invocação são interpretadas.

**Roda em paralelo com:** F-03.1 — arquivos disjuntos.

---

## F-03.3 — Subcomando watch no CLI

**Objetivo:** expor as três formas de invocação e provar a regra de somente leitura.

**Tasks que a compõem:** T-03.06, T-03.07, T-03.08, T-03.09

**Critério de saída:** `expx watch` nas três formas devolve o código de saída correto, o modo `--todos` lista sem árvore, e o teste de somente leitura passa.

**Roda em paralelo com:** nenhuma — consome F-03.1 e F-03.2.
