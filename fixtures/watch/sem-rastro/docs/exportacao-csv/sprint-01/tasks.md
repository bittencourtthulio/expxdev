---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: exportacao-csv
sprint_id: sprint-01
atualizado_em: 2026-08-29
tasks:
  - id: T-01.01
    titulo: Carregar configuracao de ambiente
    fase: F-01.1
    status: concluida
    objetivo: Ler e validar as variaveis obrigatorias na subida
    arquivos:
      cria: [src/config/env.ts, src/config/env.test.ts]
      altera: []
    teste_integracao: Sobe a app sem variavel obrigatoria e espera falha
    teste_funcional: Dado env valido, retorna objeto tipado com defaults
    criterio_aceite: App nao sobe sem as quatro variaveis obrigatorias
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
  - id: T-01.02
    titulo: Gerar o arquivo CSV
    fase: F-01.2
    status: em_andamento
    objetivo: Escrever o CSV com as quatro colunas obrigatorias
    arquivos:
      cria: [src/csv/gerar.ts, src/csv/gerar.test.ts]
      altera: []
    teste_integracao: Gera CSV de dez linhas e confere o cabecalho
    teste_funcional: Dado registro com virgula no texto, escapa corretamente
    criterio_aceite: O CSV tem as quatro colunas e escapa virgula e aspas
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.03
    titulo: Baixar o CSV pela rota
    fase: F-01.2
    status: pendente
    objetivo: Expor a rota de download do relatorio
    arquivos:
      cria: [src/rotas/baixar.ts, src/rotas/baixar.test.ts]
      altera: []
    teste_integracao: Chama a rota e espera 200 com content-type text/csv
    teste_funcional: Dado id inexistente, responde 404 sem corpo
    criterio_aceite: A rota responde 200 com text/csv e 404 para id inexistente
    depende_de: [T-01.02]
    paralelizavel: true
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 01
