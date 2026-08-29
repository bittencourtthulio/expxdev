---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: chave-ausente
sprint_id: sprint-01
atualizado_em: 2026-08-29
tasks:
  - id: T-01.01
    titulo: Task sem os testes obrigatorios
    fase: F-01.1
    status: pendente
    objetivo: Provar que a chave ausente e detectada
    arquivos:
      cria: [src/algo.ts]
      altera: []
    criterio_aceite: Nao tem teste_integracao nem teste_funcional declarados
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.02
    titulo: Task com teste apenas de espacos
    fase: F-01.1
    status: pendente
    objetivo: Provar que string vazia conta como ausente
    arquivos:
      cria: []
      altera: [src/algo.ts]
    teste_integracao: "   "
    teste_funcional: ""
    criterio_aceite: Os dois testes existem como chave mas sem conteudo
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks com chaves ausentes

T-01.01 não tem `teste_integracao` nem `teste_funcional` — as chaves faltam.
T-01.02 tem as chaves, mas com string vazia ou só espaços.
