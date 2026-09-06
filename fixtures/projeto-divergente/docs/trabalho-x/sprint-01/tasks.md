---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: trabalho-x
sprint_id: sprint-01
atualizado_em: 2026-08-28
tasks:
  - id: T-01.01
    titulo: Task ainda pendente apesar do trabalho concluido
    fase: F-01.1
    status: pendente
    objetivo: Fixture da divergencia status x progresso
    arquivos:
      cria: [src/exemplo.ts, src/exemplo.test.ts]
      altera: []
    teste_integracao: Fixture nao roda codigo real
    teste_funcional: Fixture nao roda codigo real
    criterio_aceite: Fixture nao roda codigo real
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.02
    titulo: Segunda task tambem pendente
    fase: F-01.1
    status: pendente
    objetivo: Fixture da divergencia status x progresso
    arquivos:
      cria: []
      altera: [src/exemplo.ts]
    teste_integracao: Fixture nao roda codigo real
    teste_funcional: Fixture nao roda codigo real
    criterio_aceite: Fixture nao roda codigo real
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 01

Fixture: ORQUESTRADOR diz `status: concluido`, ambas as tasks aqui continuam `pendente`.
