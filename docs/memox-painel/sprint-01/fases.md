---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: memox-painel
sprint_id: sprint-01
atualizado_em: 2026-08-29
fases:
  - id: F-01.1
    titulo: Fixtures em disco
    status: concluido
    criterio_saida: As duas fixtures novas existem e um teste le cada uma afirmando o conteudo
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02]
  - id: F-01.2
    titulo: Schema e tipo da memoria
    status: concluido
    criterio_saida: MemoriaSchema aceita a projecao da fixture e rejeita objeto sem gerado_em
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.03, T-01.04]
---

# Fases — Sprint 01

> Um bloco por fase. O paralelismo declarado aqui é definitivo: a execução nunca decide paralelismo sozinha.

> **Nota da rodada 2 (pós-auditoria).** A ordem das fases foi invertida e o paralelismo entre elas foi removido. A auditoria mostrou que o tipo depende da fixture para ser validado em runtime, então declarar as fases paralelas escondia uma dependência real. Na rodada 3, as tasks de F-01.1 passaram a `paralelizavel: false` para não contradizer a fase que as contém.

---

## F-01.1 — Fixtures em disco

**Objetivo:** Criar os projetos de fixture que representam índice válido e índice corrompido.

**Tasks que a compõem:** T-01.01, T-01.02

**Critério de saída:** As pastas `fixtures/projeto-memoria/` e `fixtures/projeto-memoria-corrompida/` existem, e um teste lê cada uma afirmando o conteúdo. O terceiro caso — projeto sem índice — é coberto pela fixture preexistente `fixtures/projeto-ok`, que não ganha índice (D-19).

**Roda em paralelo com:** nenhuma

---

## F-01.2 — Schema e tipo da memória

**Objetivo:** Declarar o schema zod da projeção e espelhar o tipo derivado na UI.

**Tasks que a compõem:** T-01.03, T-01.04

**Critério de saída:** `MemoriaSchema.safeParse` aceita a projeção montada da fixture e rejeita objeto sem `gerado_em`, e `Estado` da UI tem a chave `memoria` do tipo `Memoria | null`.

**Roda em paralelo com:** nenhuma
