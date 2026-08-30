---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: exportacao-csv
sprint_id: sprint-01
atualizado_em: 2026-08-27
tasks:
  - id: T-01.01
    titulo: Carregar configuracao
    fase: F-01.1
    status: concluida
    objetivo: Entregar carregar configuracao
    arquivos:
      cria: [src/config/env.ts]
      altera: []
    teste_integracao: Roda a suite da area e espera zero falhas
    teste_funcional: Dada entrada valida, devolve a saida esperada
    criterio_aceite: A suite da area termina com zero falhas
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-27
    suite: verde
  - id: T-01.02
    titulo: Gerar o CSV
    fase: F-01.1
    status: concluida
    objetivo: Entregar gerar o csv
    arquivos:
      cria: [src/csv/gerar.ts]
      altera: []
    teste_integracao: Roda a suite da area e espera zero falhas
    teste_funcional: Dada entrada valida, devolve a saida esperada
    criterio_aceite: A suite da area termina com zero falhas
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-27
    suite: verde
  - id: T-01.03
    titulo: Baixar pela rota
    fase: F-01.1
    status: concluida
    objetivo: Entregar baixar pela rota
    arquivos:
      cria: [src/rotas/baixar.ts]
      altera: []
    teste_integracao: Roda a suite da area e espera zero falhas
    teste_funcional: Dada entrada valida, devolve a saida esperada
    criterio_aceite: A suite da area termina com zero falhas
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-27
    suite: verde
---

# Tasks — Sprint 01
