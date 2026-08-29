---
expx_schema: 1
expx_tool: runx
kind: tasks
trabalho_id: OC-2026-9999
sprint_id: sprint-01
atualizado_em: 2026-08-29
tasks:
  - id: T-01.01
    titulo: Primeira task de bug sem teste de regressao
    fase: F-01.1
    status: concluida
    objetivo: Provar a violacao de bug sem teste_regressao
    arquivos:
      cria: [src/coisa.ts]
      altera: []
    teste_regressao: null
    teste_integracao: Roda a suite inteira e espera verde
    teste_funcional: Dado o valor X a funcao devolve Y
    criterio_aceite: A suite passa
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: vermelha
  - id: T-01.02
    titulo: Task paralelizavel com dependencia declarada
    fase: F-01.1
    status: pendente
    objetivo: Provar a violacao de paralelismo com dependencia
    arquivos:
      cria: [src/outra.ts]
      altera: []
    teste_regressao: null
    teste_integracao: Roda a suite e espera verde
    teste_funcional: Dado Z devolve W
    criterio_aceite: Passa
    depende_de: [T-01.01]
    paralelizavel: true
    concluida_em: null
    suite: nao_executada
  - id: T-01.03
    titulo: Task que depende de id inexistente
    fase: F-01.1
    status: pendente
    objetivo: Provar a violacao de referencia quebrada
    arquivos:
      cria: []
      altera: [src/coisa.ts]
    teste_regressao: null
    teste_integracao: Roda a suite e espera verde
    teste_funcional: Dado A devolve B
    criterio_aceite: Passa
    depende_de: [T-09.99]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks com violações

- T-01.01: primeira task de um bug **sem** `teste_regressao`, e `concluida` com `suite: vermelha` (duas violações).
- T-01.02: `paralelizavel: true` com `depende_de` não vazio.
- T-01.03: `depende_de` aponta `T-09.99`, que não existe.
