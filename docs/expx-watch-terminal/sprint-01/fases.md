---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: expx-watch-terminal
sprint_id: sprint-01
atualizado_em: 2026-08-30
fases:
  - id: F-01.1
    titulo: Fixtures das fontes e dos casos de borda
    status: concluido
    criterio_saida: as nove fixtures de disco existem em fixtures/watch conforme a tabela nominal de sprint.md e um teste afirma a existencia e o formato de cada uma
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02, T-01.03]
  - id: F-01.2
    titulo: Leitor do estado.json
    status: concluido
    criterio_saida: lerEstadoExpx devolve o estado tipado ou null e nunca lanca, para os quatro casos de entrada
    paralelizavel: true
    paralela_com: [F-01.3]
    tasks: [T-01.04, T-01.05]
  - id: F-01.3
    titulo: Leitor do rastro de eventos
    status: concluido
    criterio_saida: lerRastro devolve as ultimas linhas validas em ordem inversa e nunca lanca, inclusive com arquivo rotacionado
    paralelizavel: true
    paralela_com: [F-01.2]
    tasks: [T-01.06, T-01.07]
---

# Fases — Sprint 01

> Um bloco por fase. O paralelismo declarado aqui é definitivo: a execução nunca decide paralelismo sozinha.

---

## F-01.1 — Fixtures das fontes e dos casos de borda

**Objetivo:** pôr em disco as nove fixtures que a especificação exige em forma de diretório.

**Tasks que a compõem:** T-01.01, T-01.02, T-01.03

**Critério de saída:** as nove fixtures de disco existem em `fixtures/watch/` conforme a tabela nominal de `sprint.md`, e um teste afirma a existência e o formato de cada uma. As fixtures 9 e 10 da especificação são modos de teste (largura 60 e cor desligada), exercitadas em T-02.09, e não pertencem a esta fase.

**Roda em paralelo com:** nenhuma — as fases F-01.2 e F-01.3 consomem estas fixtures nos testes.

---

## F-01.2 — Leitor do estado.json

**Objetivo:** ler `.expx/estado.json` com validação de schema, falhando aberto para `null`.

**Tasks que a compõem:** T-01.04, T-01.05

**Critério de saída:** `lerEstadoExpx` devolve o estado tipado ou `null` e nunca lança, para os quatro casos de entrada (válido, ausente, JSON inválido, versão ≠ 1).

**Roda em paralelo com:** F-01.3 — arquivos disjuntos, nenhuma dependência entre as duas.

---

## F-01.3 — Leitor do rastro de eventos

**Objetivo:** ler as últimas linhas do rastro sem reler o arquivo inteiro, reaproveitando o schema zod que já existe.

**Tasks que a compõem:** T-01.06, T-01.07

**Critério de saída:** `lerRastro` devolve as últimas linhas válidas em ordem inversa e nunca lança, inclusive com arquivo rotacionado.

**Roda em paralelo com:** F-01.2 — arquivos disjuntos, nenhuma dependência entre as duas.
