---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: expx-cli
sprint_id: sprint-01
atualizado_em: 2026-08-29
fases:
  - id: F-01.1
    titulo: Fixtures de projeto
    status: concluido
    criterio_saida: As sete fixtures de projeto existem e um teste as le sem erro
    paralelizavel: true
    paralela_com: [F-01.2]
    tasks: [T-01.01, T-01.02, T-01.03]
  - id: F-01.2
    titulo: Fixtures de repositorio de skill
    status: concluido
    criterio_saida: Um repositorio git local com tags e criado e clonado por um teste
    paralelizavel: true
    paralela_com: [F-01.1]
    tasks: [T-01.04, T-01.05]
  - id: F-01.3
    titulo: Harness de teste
    status: concluido
    criterio_saida: projetoTemporario cria e descarta pasta isolada e npm test termina com 0 failed
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.06, T-01.07]
---

# Fases — Sprint 01

> Um bloco por fase. O paralelismo declarado aqui é definitivo: a execução nunca decide paralelismo sozinha.

---

## F-01.1 — Fixtures de projeto

**Objetivo:** criar em disco os cenários de projeto que a suíte inteira vai reutilizar.

**Tasks que a compõem:** T-01.01, T-01.02, T-01.03

**Critério de saída:** as sete fixtures de projeto existem sob `fixtures/cli/` e um teste as lê sem erro.

**Roda em paralelo com:** F-01.2

---

## F-01.2 — Fixtures de repositório de skill

**Objetivo:** substituir a rede por repositórios git locais, cobrindo os dois layouts reais e o caso sem tag.

**Tasks que a compõem:** T-01.04, T-01.05

**Critério de saída:** um repositório git local com tags é criado por script e clonado com sucesso por um teste.

**Roda em paralelo com:** F-01.1

---

## F-01.3 — Harness de teste

**Objetivo:** dar à suíte a capacidade de montar e descartar um projeto temporário isolado.

**Tasks que a compõem:** T-01.06, T-01.07

**Critério de saída:** `projetoTemporario` cria e descarta pasta isolada, e `npm test` termina com 0 failed.

**Roda em paralelo com:** nenhuma
