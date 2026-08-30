---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: expx-watch-terminal
sprint_id: sprint-01
atualizado_em: 2026-08-30
tasks:
  - id: T-01.01
    titulo: Fixtures das duas fontes primarias
    fase: F-01.1
    status: concluida
    objetivo: Criar as fixtures de estado.json e de rastro, cada uma com o plano em disco que os testes do desenho vao ler
    arquivos:
      cria: [src/watch/fixtures-fontes.test.ts, fixtures/watch/com-estado/.expx/estado.json, fixtures/watch/com-estado/docs/eventos/exportacao-csv.jsonl, fixtures/watch/com-estado/docs/eventos/exportacao-csv.1.jsonl, fixtures/watch/com-estado/docs/exportacao-csv/ORQUESTRADOR.md, fixtures/watch/com-estado/docs/exportacao-csv/00-BLOQUEIOS.md, fixtures/watch/com-estado/docs/exportacao-csv/sprint-01/sprint.md, fixtures/watch/com-estado/docs/exportacao-csv/sprint-01/fases.md, fixtures/watch/com-estado/docs/exportacao-csv/sprint-01/tasks.md, fixtures/watch/legado-raio-alto/.expx/estado.json, fixtures/watch/legado-raio-alto/docs/OC-2026-0142-frete/ORQUESTRADOR.md, fixtures/watch/legado-raio-alto/docs/OC-2026-0142-frete/sprint-01/sprint.md, fixtures/watch/legado-raio-alto/docs/OC-2026-0142-frete/sprint-01/fases.md, fixtures/watch/legado-raio-alto/docs/OC-2026-0142-frete/sprint-01/tasks.md, fixtures/watch/estado-invalido/.expx/estado.json, fixtures/watch/estado-invalido/docs/exportacao-csv/ORQUESTRADOR.md, fixtures/watch/estado-invalido/docs/exportacao-csv/sprint-01/sprint.md, fixtures/watch/estado-invalido/docs/exportacao-csv/sprint-01/fases.md, fixtures/watch/estado-invalido/docs/exportacao-csv/sprint-01/tasks.md, fixtures/watch/estado-versao-futura/.expx/estado.json]
      altera: []
    teste_integracao: Afirma que os quatro estado.json existem com as quinze chaves do contrato e que com-estado, legado-raio-alto e estado-invalido tem plano legivel por montarProjeto
    teste_funcional: Dado o estado.json de legado-raio-alto, o campo raio vale alto e orcamento_arquivos vale 2/3
    criterio_aceite: Os quatro estado.json existem, tres das fixtures devolvem um trabalho em montarProjeto, e o .1.jsonl tem ts mais antigos que o .jsonl
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-30
    suite: verde
  - id: T-01.02
    titulo: Fixtures dos casos de borda de trabalho
    fase: F-01.1
    status: concluida
    objetivo: Criar as fixtures de trabalho concluido, de nenhum trabalho aberto, de rastro ausente e de varios trabalhos com os quatro status
    arquivos:
      cria: [src/watch/fixtures-borda.test.ts, fixtures/watch/concluido/docs/exportacao-csv/ORQUESTRADOR.md, fixtures/watch/concluido/docs/exportacao-csv/sprint-01/sprint.md, fixtures/watch/concluido/docs/exportacao-csv/sprint-01/fases.md, fixtures/watch/concluido/docs/exportacao-csv/sprint-01/tasks.md, fixtures/watch/sem-trabalho/docs/.gitkeep, fixtures/watch/sem-rastro/.expx/estado.json, fixtures/watch/sem-rastro/docs/exportacao-csv/ORQUESTRADOR.md, fixtures/watch/sem-rastro/docs/exportacao-csv/sprint-01/sprint.md, fixtures/watch/sem-rastro/docs/exportacao-csv/sprint-01/fases.md, fixtures/watch/sem-rastro/docs/exportacao-csv/sprint-01/tasks.md, fixtures/watch/varios-trabalhos/docs/nao-iniciado/ORQUESTRADOR.md, fixtures/watch/varios-trabalhos/docs/bloqueado/ORQUESTRADOR.md, fixtures/watch/varios-trabalhos/docs/em-andamento/ORQUESTRADOR.md, fixtures/watch/varios-trabalhos/docs/concluido/ORQUESTRADOR.md]
      altera: []
    teste_integracao: Afirma que concluido tem status concluido, sem-trabalho nao tem ORQUESTRADOR, sem-rastro tem plano sem docs/eventos, e varios-trabalhos tem um trabalho de cada um dos quatro status
    teste_funcional: Dado montarProjeto sobre a fixture concluido, devolve um trabalho com progresso igual a 1
    criterio_aceite: O tasks.md de concluido tem tres tasks todas concluida e montarProjeto devolve progresso 1, sobre sem-trabalho devolve trabalhos vazio e rejeicoes vazio, e sobre varios-trabalhos devolve quatro trabalhos com status distintos
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-30
    suite: verde
  - id: T-01.03
    titulo: Fixture de bloqueio aberto
    fase: F-01.1
    status: concluida
    objetivo: Garantir uma fixture com bloqueio aberto e task bloqueada, para a secao que sobe ao topo
    arquivos:
      cria: [src/watch/fixtures-bloqueio.test.ts, fixtures/watch/com-bloqueio/docs/exportacao-csv/ORQUESTRADOR.md, fixtures/watch/com-bloqueio/docs/exportacao-csv/00-BLOQUEIOS.md, fixtures/watch/com-bloqueio/docs/exportacao-csv/sprint-01/sprint.md, fixtures/watch/com-bloqueio/docs/exportacao-csv/sprint-01/fases.md, fixtures/watch/com-bloqueio/docs/exportacao-csv/sprint-01/tasks.md]
      altera: []
    teste_integracao: Afirma que o 00-BLOQUEIOS da fixture tem um bloqueio com resolvido_em null e uma task com status bloqueada
    teste_funcional: Dado montarProjeto sobre a fixture, o bloqueio devolvido tem aberto igual a true
    criterio_aceite: montarProjeto devolve exatamente um bloqueio com aberto true
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-30
    suite: verde
  - id: T-01.04
    titulo: Schema e tipo do expx-estado
    fase: F-01.2
    status: concluida
    objetivo: Declarar em zod as quinze chaves do contrato expx-estado, que nao tem schema no repositorio
    arquivos:
      cria: [src/watch/fontes/estado-schema.ts, src/watch/fontes/estado-schema.test.ts]
      altera: []
    teste_integracao: Valida o estado.json da fixture com-estado contra o schema e espera sucesso
    teste_funcional: Dado um objeto sem a chave raio, o schema rejeita, porque R6 proibe chave omitida
    criterio_aceite: O schema aceita as quinze chaves do contrato e rejeita objeto com qualquer uma omitida
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: 2026-08-30
    suite: verde
  - id: T-01.05
    titulo: Leitura tolerante do estado.json
    fase: F-01.2
    status: concluida
    objetivo: Ler o arquivo devolvendo o estado tipado ou null, sem nunca lancar
    arquivos:
      cria: [src/watch/fontes/estado.ts, src/watch/fontes/estado.test.ts]
      altera: []
    teste_integracao: Le as fixtures com-estado, estado-invalido e estado-versao-futura e espera estado, null e null
    teste_funcional: Dado um caminho inexistente, devolve null em vez de lancar excecao
    criterio_aceite: Os quatro casos devolvem valor e nenhum lanca excecao
    depende_de: [T-01.04]
    paralelizavel: false
    concluida_em: 2026-08-30
    suite: verde
  - id: T-01.06
    titulo: Leitura do fim do arquivo de rastro
    fase: F-01.3
    status: concluida
    objetivo: Ler apenas os ultimos 64 KB de um jsonl e descartar o fragmento de linha inicial
    arquivos:
      cria: [src/watch/fontes/cauda.ts, src/watch/fontes/cauda.test.ts]
      altera: []
    teste_integracao: Le a cauda de um arquivo maior que 64 KB e afirma que a primeira linha devolvida e completa
    teste_funcional: Dado um arquivo de tres linhas menor que o limite, devolve as tres linhas inteiras
    criterio_aceite: Nenhuma linha devolvida e fragmento e o arquivo nunca e lido inteiro acima do limite
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-30
    suite: verde
  - id: T-01.07
    titulo: Leitor do rastro com ordem inversa e rotacao
    fase: F-01.3
    status: concluida
    objetivo: Devolver as ultimas linhas validas do rastro em ordem inversa, juntando o arquivo rotacionado quando preciso
    arquivos:
      cria: [src/watch/fontes/rastro.ts, src/watch/fontes/rastro.test.ts]
      altera: []
    teste_integracao: Com o jsonl e o 1.jsonl da fixture com-estado, as linhas do rotacionado vem depois das do corrente na ordem inversa
    teste_funcional: Dado rastro com dez linhas, devolve as dez em ordem inversa, a mais recente primeiro
    criterio_aceite: A primeira linha devolvida e a de ts mais recente, o rotacionado entra depois do corrente, e linha invalida e descartada sem lancar
    depende_de: [T-01.01, T-01.06]
    paralelizavel: false
    concluida_em: 2026-08-30
    suite: verde
---

# Tasks — Sprint 01

> Um bloco por task. Todos os campos do contrato preenchidos. Na execução (F6) a linha `status` é atualizada em cada transição.

---

```yaml
id: T-01.01
titulo: Fixtures das duas fontes primárias
objetivo: Criar as fixtures de estado.json e de rastro, cada uma com o plano em disco que os testes do desenho vão ler
arquivos:
  cria: [src/watch/fixtures-fontes.test.ts, fixtures/watch/com-estado/.expx/estado.json, fixtures/watch/com-estado/docs/eventos/exportacao-csv.jsonl, fixtures/watch/com-estado/docs/eventos/exportacao-csv.1.jsonl, fixtures/watch/com-estado/docs/exportacao-csv/ORQUESTRADOR.md, fixtures/watch/com-estado/docs/exportacao-csv/00-BLOQUEIOS.md, fixtures/watch/com-estado/docs/exportacao-csv/sprint-01/sprint.md, fixtures/watch/com-estado/docs/exportacao-csv/sprint-01/fases.md, fixtures/watch/com-estado/docs/exportacao-csv/sprint-01/tasks.md, fixtures/watch/legado-raio-alto/.expx/estado.json, fixtures/watch/legado-raio-alto/docs/OC-2026-0142-frete/ORQUESTRADOR.md, fixtures/watch/legado-raio-alto/docs/OC-2026-0142-frete/sprint-01/sprint.md, fixtures/watch/legado-raio-alto/docs/OC-2026-0142-frete/sprint-01/fases.md, fixtures/watch/legado-raio-alto/docs/OC-2026-0142-frete/sprint-01/tasks.md, fixtures/watch/estado-invalido/.expx/estado.json, fixtures/watch/estado-invalido/docs/exportacao-csv/ORQUESTRADOR.md, fixtures/watch/estado-invalido/docs/exportacao-csv/sprint-01/sprint.md, fixtures/watch/estado-invalido/docs/exportacao-csv/sprint-01/fases.md, fixtures/watch/estado-invalido/docs/exportacao-csv/sprint-01/tasks.md, fixtures/watch/estado-versao-futura/.expx/estado.json]
  altera: []
teste_integracao: Afirma que os quatro estado.json existem com as quinze chaves do contrato e que com-estado, legado-raio-alto e estado-invalido tem plano legivel por montarProjeto
teste_funcional: Dado o estado.json de legado-raio-alto, o campo raio vale alto e orcamento_arquivos vale 2/3
criterio_aceite: Os quatro estado.json existem, tres das fixtures devolvem um trabalho em montarProjeto, e o .1.jsonl tem ts mais antigos que o .jsonl
depende_de: []
paralelizavel: true
status: concluida
concluida_em: 2026-08-30 · suíte: 3 passed, 0 failed
```

---

```yaml
id: T-01.02
titulo: Fixtures dos casos de borda de trabalho
objetivo: Criar as fixtures de trabalho concluído, de nenhum trabalho aberto, de rastro ausente e de vários trabalhos com os quatro status
arquivos:
  cria: [src/watch/fixtures-borda.test.ts, fixtures/watch/concluido/docs/exportacao-csv/ORQUESTRADOR.md, fixtures/watch/concluido/docs/exportacao-csv/sprint-01/sprint.md, fixtures/watch/concluido/docs/exportacao-csv/sprint-01/fases.md, fixtures/watch/concluido/docs/exportacao-csv/sprint-01/tasks.md, fixtures/watch/sem-trabalho/docs/.gitkeep, fixtures/watch/sem-rastro/.expx/estado.json, fixtures/watch/sem-rastro/docs/exportacao-csv/ORQUESTRADOR.md, fixtures/watch/sem-rastro/docs/exportacao-csv/sprint-01/sprint.md, fixtures/watch/sem-rastro/docs/exportacao-csv/sprint-01/fases.md, fixtures/watch/sem-rastro/docs/exportacao-csv/sprint-01/tasks.md, fixtures/watch/varios-trabalhos/docs/nao-iniciado/ORQUESTRADOR.md, fixtures/watch/varios-trabalhos/docs/bloqueado/ORQUESTRADOR.md, fixtures/watch/varios-trabalhos/docs/em-andamento/ORQUESTRADOR.md, fixtures/watch/varios-trabalhos/docs/concluido/ORQUESTRADOR.md]
  altera: []
teste_integracao: Afirma que concluido tem status concluido, sem-trabalho não tem ORQUESTRADOR, sem-rastro tem plano sem docs/eventos, e varios-trabalhos tem um trabalho de cada um dos quatro status
teste_funcional: Dado montarProjeto sobre a fixture concluido, devolve um trabalho com progresso igual a 1
criterio_aceite: O tasks.md de concluido tem tres tasks todas concluida e montarProjeto devolve progresso 1, sobre sem-trabalho devolve trabalhos vazio e rejeicoes vazio, e sobre varios-trabalhos devolve quatro trabalhos com status distintos
depende_de: []
paralelizavel: true
status: pendente
```

---

```yaml
id: T-01.03
titulo: Fixture de bloqueio aberto
objetivo: Garantir uma fixture com bloqueio aberto e task bloqueada, para a seção que sobe ao topo
arquivos:
  cria: [src/watch/fixtures-bloqueio.test.ts, fixtures/watch/com-bloqueio/docs/exportacao-csv/ORQUESTRADOR.md, fixtures/watch/com-bloqueio/docs/exportacao-csv/00-BLOQUEIOS.md, fixtures/watch/com-bloqueio/docs/exportacao-csv/sprint-01/sprint.md, fixtures/watch/com-bloqueio/docs/exportacao-csv/sprint-01/fases.md, fixtures/watch/com-bloqueio/docs/exportacao-csv/sprint-01/tasks.md]
  altera: []
teste_integracao: Afirma que o 00-BLOQUEIOS da fixture tem um bloqueio com resolvido_em null e uma task com status bloqueada
teste_funcional: Dado montarProjeto sobre a fixture, o bloqueio devolvido tem aberto igual a true
criterio_aceite: montarProjeto devolve exatamente um bloqueio com aberto true
depende_de: []
paralelizavel: true
status: concluida
concluida_em: 2026-08-30 · suíte: 2 passed, 0 failed
```

---

```yaml
id: T-01.04
titulo: Schema e tipo do expx-estado
objetivo: Declarar em zod as quinze chaves do contrato expx-estado, que não tem schema no repositório
arquivos:
  cria: [src/watch/fontes/estado-schema.ts, src/watch/fontes/estado-schema.test.ts]
  altera: []
teste_integracao: Valida o estado.json da fixture com-estado contra o schema e espera sucesso
teste_funcional: Dado um objeto sem a chave raio, o schema rejeita, porque R6 proíbe chave omitida
criterio_aceite: O schema aceita as quinze chaves do contrato e rejeita objeto com qualquer uma omitida
depende_de: [T-01.01]
paralelizavel: false
status: concluida
concluida_em: 2026-08-30 · suíte: 3 passed, 0 failed
```

---

```yaml
id: T-01.05
titulo: Leitura tolerante do estado.json
objetivo: Ler o arquivo devolvendo o estado tipado ou null, sem nunca lançar
arquivos:
  cria: [src/watch/fontes/estado.ts, src/watch/fontes/estado.test.ts]
  altera: []
teste_integracao: Lê as fixtures com-estado, estado-invalido e estado-versao-futura e espera estado, null e null
teste_funcional: Dado um caminho inexistente, devolve null em vez de lançar exceção
criterio_aceite: Os quatro casos devolvem valor e nenhum lança exceção
depende_de: [T-01.04]
paralelizavel: false
status: concluida
concluida_em: 2026-08-30 · suíte: 3 passed, 0 failed
```

---

```yaml
id: T-01.06
titulo: Leitura do fim do arquivo de rastro
objetivo: Ler apenas os últimos 64 KB de um jsonl e descartar o fragmento de linha inicial
arquivos:
  cria: [src/watch/fontes/cauda.ts, src/watch/fontes/cauda.test.ts]
  altera: []
teste_integracao: Lê a cauda de um arquivo maior que 64 KB e afirma que a primeira linha devolvida é completa
teste_funcional: Dado um arquivo de três linhas menor que o limite, devolve as três linhas inteiras
criterio_aceite: Nenhuma linha devolvida é fragmento e o arquivo nunca é lido inteiro acima do limite
depende_de: []
paralelizavel: true
status: concluida
concluida_em: 2026-08-30 · suíte: 4 passed, 0 failed
```

---

```yaml
id: T-01.07
titulo: Leitor do rastro com ordem inversa e rotação
objetivo: Devolver as últimas linhas válidas do rastro em ordem inversa, juntando o arquivo rotacionado quando preciso
arquivos:
  cria: [src/watch/fontes/rastro.ts, src/watch/fontes/rastro.test.ts]
  altera: []
teste_integracao: Com o .jsonl e o .1.jsonl da fixture com-estado, as linhas do rotacionado vêm depois das do corrente na ordem inversa
teste_funcional: Dado rastro com dez linhas, devolve as dez em ordem inversa, a mais recente primeiro
criterio_aceite: A primeira linha devolvida é a de ts mais recente, o rotacionado entra depois do corrente, e linha inválida é descartada sem lançar
depende_de: [T-01.01, T-01.06]
paralelizavel: false
status: concluida
concluida_em: 2026-08-30 · suíte: 5 passed, 0 failed
```
