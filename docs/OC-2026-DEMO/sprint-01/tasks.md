---
expx_schema: 1
expx_tool: runx
kind: tasks
trabalho_id: OC-2026-DEMO
sprint_id: sprint-01
atualizado_em: 2026-09-02
tasks:
  - id: T-01.01
    titulo: Teste que reproduz o defeito
    fase: F-01.1
    status: concluida
    objetivo: Provar o defeito com teste vermelho antes de tocar no codigo
    arquivos:
      cria: [src/calculo/frete.test.ts]
      altera: []
    teste_integracao: Roda a suite e confere que o novo teste falha
    teste_funcional: Dado peso 51kg, espera a faixa correta e observa a errada
    criterio_aceite: O teste falha pelo motivo certo antes da correcao
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-09-02
    suite: vermelha
  - id: T-01.02
    titulo: Corrigir a faixa acima de 50kg
    fase: F-01.2
    status: em_andamento
    objetivo: Ajustar o limite superior da faixa no calculo do frete
    arquivos:
      cria: []
      altera: [src/calculo/frete.ts]
    teste_integracao: Suite inteira verde depois da correcao
    teste_funcional: Dado peso 51kg, devolve o valor da tabela oficial
    criterio_aceite: O teste da T-01.01 passa a verde
    depende_de: [T-01.01]
    paralelizavel: true
    concluida_em: null
    suite: nao_executada
  - id: T-01.03
    titulo: Teste de regressao da faixa vizinha
    fase: F-01.2
    status: em_andamento
    objetivo: Garantir que a faixa ate 50kg nao mudou de comportamento
    arquivos:
      cria: [src/calculo/frete-regressao.test.ts]
      altera: []
    teste_integracao: Suite verde com o teste de regressao incluido
    teste_funcional: Dado peso 50kg, o valor permanece o de antes da correcao
    criterio_aceite: A faixa vizinha continua com o mesmo resultado
    depende_de: [T-01.01]
    paralelizavel: true
    concluida_em: null
    suite: nao_executada
  - id: T-01.04
    titulo: Atualizar a tabela de faixas na documentacao
    fase: F-01.2
    status: pendente
    objetivo: Deixar a documentacao coerente com o calculo corrigido
    arquivos:
      cria: []
      altera: [docs/calculo/faixas.md]
    teste_integracao: A documentacao cita as mesmas faixas do codigo
    teste_funcional: Leitura da tabela bate com o teste funcional da T-01.02
    criterio_aceite: Nenhuma faixa documentada diverge do codigo
    depende_de: [T-01.02]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.05
    titulo: Conferir o calculo no relatorio mensal
    fase: F-01.2
    status: pendente
    objetivo: Verificar se o relatorio consumia a faixa defeituosa
    arquivos:
      cria: []
      altera: [src/relatorio/mensal.ts]
    teste_integracao: O relatorio mensal fecha com o total esperado
    teste_funcional: Dado mes com pedidos acima de 50kg, o total confere
    criterio_aceite: O relatorio usa o calculo corrigido
    depende_de: [T-01.02]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 01
