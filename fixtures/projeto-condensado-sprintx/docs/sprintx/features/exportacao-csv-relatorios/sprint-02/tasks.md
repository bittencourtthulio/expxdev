---
expx_schema: 1
expx_tool: sprintx
kind: plano
trabalho_id: exportacao-csv-relatorios
sprint_id: sprint-02
atualizado_em: 2026-08-29
sprint:
  titulo: Geracao do CSV
  status: em_andamento
  criterio_saida: Relatorio de 10 mil linhas exporta em CSV valido
  riscos: [Limite de memoria nao documentado na fonte]
  fora_de_escopo: [Exportacao em XLSX]
fases:
  - id: F-02.1
    titulo: Gerador de CSV
    status: em_andamento
    criterio_saida: Campo com virgula e aspas sai escapado
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.01]
tasks:
  - id: T-02.01
    titulo: Escapar separador e aspas
    fase: F-02.1
    status: concluida
    objetivo: Gerar CSV valido quando o dado tem virgula ou aspas
    arquivos:
      cria: [src/csv/escapar.ts, src/csv/escapar.test.ts]
      altera: []
    teste_integracao: Gera o CSV de uma fixture com virgula e aspas e reabre com o parser
    teste_funcional: Dado o valor `a,"b`, retorna `"a,""b"`
    criterio_aceite: O CSV gerado reabre sem erro no parser de referencia
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: parcial
---

# prosa
