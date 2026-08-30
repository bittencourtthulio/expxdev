---
expx_schema: 1
expx_tool: runx
kind: tasks
trabalho_id: OC-2026-0142
sprint_id: sprint-01
atualizado_em: 2026-08-29
tasks:
  - id: T-01.01
    titulo: Congelar o comportamento atual
    fase: F-01.1
    status: concluida
    objetivo: Escrever caracterizacao do calculo de frete vigente
    arquivos:
      cria: [src/frete/calculo.caracterizacao.test.ts]
      altera: []
    teste_regressao: Reproduz o frete errado para 51kg antes do fix
    teste_integracao: Roda a caracterizacao contra vinte pesos conhecidos
    teste_funcional: Dado 50kg exatos, o valor atual e preservado
    criterio_aceite: Vinte casos de caracterizacao passam antes de qualquer alteracao
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-01.02
    titulo: Corrigir a faixa acima de 50kg
    fase: F-01.1
    status: em_andamento
    objetivo: Aplicar a tabela correta para peso acima de 50kg
    arquivos:
      cria: []
      altera: [src/frete/calculo.ts]
    teste_regressao: O caso de 51kg passa a devolver o valor da tabela nova
    teste_integracao: Roda a suite de frete inteira e nenhuma caracterizacao quebra
    teste_funcional: Dado 51kg, devolve o valor da faixa acima de 50kg
    criterio_aceite: O caso de 51kg devolve o valor correto e as vinte caracterizacoes seguem verdes
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 01
