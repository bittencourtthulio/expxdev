---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: exportacao-csv
sprint_id: sprint-01
atualizado_em: 2026-08-28
tasks:
  - id: T-01.01
    titulo: Carregar configuracao de exportacao
    fase: F-01.1
    status: concluida
    objetivo: Ler e validar os limites de exportacao na subida
    arquivos:
      cria: [src/config/exportacao.ts, src/config/exportacao.test.ts]
      altera: []
    teste_integracao: Sobe a app sem o limite configurado e espera falha clara
    teste_funcional: Dado env valido, retorna objeto tipado com o limite padrao
    criterio_aceite: App nao sobe sem o limite de linhas configurado
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-22
    suite: verde
  - id: T-01.02
    titulo: Fixtures de relatorio
    fase: F-01.1
    status: concluida
    objetivo: Ter relatorios de exemplo para os testes do gerador
    arquivos:
      cria: [fixtures/relatorios/simples.json, fixtures/relatorios/com-aspas.json]
      altera: []
    teste_integracao: Le as duas fixtures e espera JSON valido
    teste_funcional: Dada a fixture com aspas, o campo contem aspas duplas literais
    criterio_aceite: As duas fixtures existem e sao JSON valido
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: 2026-08-25
    suite: verde
  - id: T-01.03
    titulo: Gerador de CSV com escaping
    fase: F-01.2
    status: bloqueada
    objetivo: Converter registros em CSV respeitando escaping e encoding
    arquivos:
      cria: [src/relatorios/csv.ts, src/relatorios/csv.test.ts]
      altera: []
    teste_integracao: Gera CSV da fixture com aspas e reabre com parser de CSV sem erro
    teste_funcional: Dado campo com aspas, a saida duplica as aspas conforme RFC 4180
    criterio_aceite: CSV gerado reabre em parser padrao com os mesmos valores
    depende_de: [T-01.02]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-01.04
    titulo: Enfileirar o job de exportacao
    fase: F-01.3
    status: pendente
    objetivo: Publicar o pedido de exportacao na fila existente
    arquivos:
      cria: [src/relatorios/fila.ts, src/relatorios/fila.test.ts]
      altera: []
    teste_integracao: Publica um job e espera o consumidor receber a mensagem
    teste_funcional: Dado um pedido valido, a mensagem carrega o id do relatorio
    criterio_aceite: O job aparece na fila com o id do relatorio no payload
    depende_de: []
    paralelizavel: true
    concluida_em: null
    suite: nao_executada
---

# Tasks — Sprint 01

```yaml
id: T-01.01
status: concluida  # 2026-08-22 · suíte: 12 passed, 0 failed
```

```yaml
id: T-01.02
status: concluida  # 2026-08-25 · suíte: 18 passed, 0 failed
```

```yaml
id: T-01.03
status: bloqueada  # ver B-01
```

```yaml
id: T-01.04
status: pendente
```
