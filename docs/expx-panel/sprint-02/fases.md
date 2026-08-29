---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: expx-panel
sprint_id: sprint-02
atualizado_em: 2026-08-29
fases:
  - id: F-02.1
    titulo: Tipos e esquemas zod
    status: concluido
    criterio_saida: Todo kind do contrato tem esquema zod e o esquema rejeita valor fora do enum
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.01, T-02.02, T-02.03]
  - id: F-02.2
    titulo: Leitura de arquivo e rejeicoes
    status: concluido
    criterio_saida: Ler qualquer arquivo das fixtures devolve aceito ou rejeitado sem lancar
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.04, T-02.05, T-02.06]
  - id: F-02.3
    titulo: Descoberta de trabalhos
    status: concluido
    criterio_saida: Varrer fixtures/projeto-ok devolve exatamente dois trabalhos
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.07, T-02.08]
  - id: F-02.4
    titulo: Agregacao do projeto
    status: concluido
    criterio_saida: O objeto do projeto traz trabalhos com sprints fases tasks bloqueios e historico
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.09, T-02.10, T-02.11]
  - id: F-02.5
    titulo: Regras de conformidade
    status: concluido
    criterio_saida: As sete violacoes do pedido sao detectadas e nenhuma dispara em projeto-ok
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.12, T-02.13, T-02.14, T-02.15]
---

# Fases — Sprint 02

> Um bloco por fase. O paralelismo declarado aqui é definitivo.

---

## F-02.1 — Tipos e esquemas zod

**Objetivo:** Traduzir o contrato expx-schema v1 em esquemas zod que validam em runtime e geram os tipos estáticos.

**Tasks que a compõem:** T-02.01, T-02.02, T-02.03

**Critério de saída:** Existe um esquema por kind e um teste que prova a rejeição de valor fora do enum.

**Roda em paralelo com:** nenhuma

---

## F-02.2 — Leitura de arquivo e rejeições

**Objetivo:** Ler um arquivo do disco e devolver ou o estado tipado ou uma rejeição com motivo, nunca uma exceção.

**Tasks que a compõem:** T-02.04, T-02.05, T-02.06

**Critério de saída:** Ler qualquer arquivo de `fixtures/projeto-ruim` devolve rejeição com motivo e não lança.

**Roda em paralelo com:** nenhuma

---

## F-02.3 — Descoberta de trabalhos

**Objetivo:** Varrer uma pasta e encontrar os trabalhos pelos `ORQUESTRADOR.md` válidos.

**Tasks que a compõem:** T-02.07, T-02.08

**Critério de saída:** `fixtures/projeto-ok` devolve exatamente dois trabalhos, um sprintx e um runx.

**Roda em paralelo com:** nenhuma

---

## F-02.4 — Agregação do projeto

**Objetivo:** Montar o objeto único do projeto com trabalhos, sprints, fases, tasks, bloqueios e histórico.

**Tasks que a compõem:** T-02.09, T-02.10, T-02.11

**Critério de saída:** O objeto do projeto traz, para o trabalho sprintx da fixture, suas sprints com fases e tasks aninhadas.

**Roda em paralelo com:** nenhuma

---

## F-02.5 — Regras de conformidade

**Objetivo:** Detectar as sete violações do pedido sobre o objeto do projeto já montado.

**Tasks que a compõem:** T-02.12, T-02.13, T-02.14, T-02.15

**Critério de saída:** As sete violações disparam em `fixtures/projeto-ruim` e nenhuma dispara em `fixtures/projeto-ok`.

**Paralelismo interno:** as quatro tasks rodam em paralelo entre si — cada uma escreve num arquivo próprio e todas consomem o objeto do projeto já pronto pela F-02.4.

**Roda em paralelo com:** nenhuma
