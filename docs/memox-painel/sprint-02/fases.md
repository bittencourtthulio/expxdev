---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: memox-painel
sprint_id: sprint-02
atualizado_em: 2026-08-29
fases:
  - id: F-02.1
    titulo: Leitura e projecao do indice
    status: concluido
    criterio_saida: lerMemoria devolve a projecao na fixture com indice e null nas fixtures sem indice e corrompida
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.01, T-02.02, T-02.03]
  - id: F-02.2
    titulo: Exposicao pelo servidor
    status: concluido
    criterio_saida: GET /api/memoria responde 200 e /api/projeto traz a chave memoria
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.04, T-02.05]
  - id: F-02.3
    titulo: Tela de Memoria
    status: concluido
    criterio_saida: A secao Memoria renderiza as quatro tabelas com indice, o estado vazio sem indice, e exporta csv
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.06, T-02.07, T-02.08, T-02.09, T-02.10]
---

# Fases — Sprint 02

> Um bloco por fase. O paralelismo declarado aqui é definitivo.

---

## F-02.1 — Leitura e projeção do índice

**Objetivo:** Ler o índice do disco, validar e reduzi-lo à projeção enxuta que o painel serve.

**Tasks que a compõem:** T-02.01, T-02.02, T-02.03

**Critério de saída:** `lerMemoria` devolve a projeção na fixture com índice, e `null` nas fixtures sem índice e corrompida.

**Roda em paralelo com:** nenhuma

---

## F-02.2 — Exposição pelo servidor

**Objetivo:** Acrescentar a memória ao estado montado e servi-la por rota própria.

**Tasks que a compõem:** T-02.04, T-02.05

**Critério de saída:** `GET /api/memoria` responde `200` com `{ memoria }` e `GET /api/projeto` traz a chave `memoria`.

**Roda em paralelo com:** nenhuma

---

## F-02.3 — Tela de Memória

**Objetivo:** Mostrar a memória numa seção própria da UI, com estado vazio útil.

**Tasks que a compõem:** T-02.06, T-02.07, T-02.08, T-02.09, T-02.10

**Critério de saída:** A seção Memória renderiza as quatro tabelas (arquivos de risco, regressões, coincidências, artefatos contaminados) na fixture com índice, mostra o estado vazio com o comando de indexação na fixture sem índice, exporta CSV, e aparece na activitybar com o contador de regressões.

**Roda em paralelo com:** nenhuma
