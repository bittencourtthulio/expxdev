---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: expx-panel
sprint_id: sprint-01
atualizado_em: 2026-08-29
tasks:
  - id: T-01.01
    titulo: Andaime do pacote npm
    fase: F-01.1
    status: concluida
    objetivo: Criar o pacote TypeScript ESM strict com os scripts de build e teste
    arquivos:
      cria: [package.json, tsconfig.json, .gitignore, src/index.ts]
      altera: []
    teste_integracao: Compila um arquivo com erro de tipo deliberado e espera o build falhar
    teste_funcional: Dado o tsconfig gravado, tsc rejeita atribuir string a number
    criterio_aceite: npm run build termina com codigo 0 e strict esta true no tsconfig
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-01.02
    titulo: Configuracao do Vitest
    fase: F-01.1
    status: concluida
    objetivo: Deixar a suite de testes executavel por npm test
    arquivos:
      cria: [vitest.config.ts, src/andaime.test.ts]
      altera: [package.json]
    teste_integracao: Roda o vitest sobre um arquivo temporario e espera o resultado reportado
    teste_funcional: Dado um teste trivial que soma 1 mais 1, a suite reporta 1 passed
    criterio_aceite: npm test termina com codigo 0 e reporta pelo menos 1 teste passando
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-01.03
    titulo: Fixture de trabalho sprintx completo
    fase: F-01.2
    status: concluida
    objetivo: Gravar em disco um trabalho sprintx com todos os kinds que a sprintx produz
    arquivos:
      cria: [fixtures/projeto-ok/docs/exportacao-csv/ORQUESTRADOR.md, fixtures/projeto-ok/docs/exportacao-csv/00-BLOQUEIOS.md, fixtures/projeto-ok/docs/exportacao-csv/00-DECISOES.md, fixtures/projeto-ok/docs/exportacao-csv/base/00-INDICE.md, fixtures/projeto-ok/docs/exportacao-csv/base/geracao-csv.md, fixtures/projeto-ok/docs/exportacao-csv/base/00-LACUNAS.md, fixtures/projeto-ok/docs/exportacao-csv/sprint-01/sprint.md, fixtures/projeto-ok/docs/exportacao-csv/sprint-01/fases.md, fixtures/projeto-ok/docs/exportacao-csv/sprint-01/tasks.md]
      altera: []
    teste_integracao: Le os sete arquivos com gray-matter e espera frontmatter valido em todos
    teste_funcional: Dado o ORQUESTRADOR da fixture, o kind lido e orquestrador e o expx_tool e sprintx
    criterio_aceite: Os sete arquivos existem e cada um tem o kind esperado no frontmatter
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
  - id: T-01.04
    titulo: Fixture de trabalho runx completo
    fase: F-01.2
    status: concluida
    objetivo: Gravar em disco um trabalho runx com os kinds exclusivos do ciclo de manutencao
    arquivos:
      cria: [fixtures/projeto-ok/docs/manutencao/OC-2026-0142-frete/ORQUESTRADOR.md, fixtures/projeto-ok/docs/manutencao/OC-2026-0142-frete/00-OCORRENCIA.md, fixtures/projeto-ok/docs/manutencao/OC-2026-0142-frete/01-CAUSA-RAIZ.md, fixtures/projeto-ok/docs/manutencao/OC-2026-0142-frete/QA.md, fixtures/projeto-ok/docs/manutencao/OC-2026-0142-frete/BLOQUEIOS.md, fixtures/projeto-ok/docs/manutencao/OC-2026-0142-frete/sprint-01/sprint.md, fixtures/projeto-ok/docs/manutencao/OC-2026-0142-frete/sprint-01/fases.md, fixtures/projeto-ok/docs/manutencao/OC-2026-0142-frete/sprint-01/tasks.md]
      altera: []
    teste_integracao: Le os seis arquivos com gray-matter e espera frontmatter valido em todos
    teste_funcional: Dada a task de bug da fixture, o campo teste_regressao vem preenchido
    criterio_aceite: Os seis arquivos existem e o ORQUESTRADOR tem tipo_trabalho ocorrencia
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
  - id: T-01.05
    titulo: Fixture de historico de relatorios
    fase: F-01.2
    status: concluida
    objetivo: Gravar em disco o historico com relatorio tecnico, de uso e o indice
    arquivos:
      cria: [fixtures/projeto-ok/docs/relatorios/INDICE.md, fixtures/projeto-ok/docs/relatorios/2026-08-29-OC-2026-0142-frete/tecnico.md, fixtures/projeto-ok/docs/relatorios/2026-08-29-OC-2026-0142-frete/uso.md]
      altera: []
    teste_integracao: Le os tres arquivos e espera os kinds relatorios_indice, relatorio_tecnico e relatorio_uso
    teste_funcional: Dado o relatorio de uso da fixture, o frontmatter nao tem arquivos_alterados
    criterio_aceite: Os tres arquivos existem e o INDICE nao tem a chave trabalho_id
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
  - id: T-01.06
    titulo: Fixtures dos casos de leitura quebrada
    fase: F-01.3
    status: concluida
    objetivo: Gravar os casos que impedem a leitura do arquivo como estado valido
    arquivos:
      cria: [fixtures/projeto-ruim/docs/yaml-invalido/ORQUESTRADOR.md, fixtures/projeto-ruim/docs/kind-desconhecido/ORQUESTRADOR.md, fixtures/projeto-ruim/docs/schema-futuro/ORQUESTRADOR.md, fixtures/projeto-ruim/docs/sem-frontmatter/ORQUESTRADOR.md]
      altera: []
    teste_integracao: Le os quatro arquivos e espera que nenhuma leitura lance excecao
    teste_funcional: Dado o arquivo de yaml invalido, gray-matter lanca e o erro e capturavel
    criterio_aceite: Os quatro arquivos existem e nenhum deles e um estado valido
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
  - id: T-01.07
    titulo: Fixtures dos casos de conteudo defeituoso
    fase: F-01.3
    status: concluida
    objetivo: Gravar os casos que sao legiveis mas violam o metodo
    arquivos:
      cria: [fixtures/projeto-ruim/docs/enum-errado/ORQUESTRADOR.md, fixtures/projeto-ruim/docs/chave-ausente/sprint-01/tasks.md, fixtures/projeto-ruim/docs/violacoes/ORQUESTRADOR.md, fixtures/projeto-ruim/docs/violacoes/sprint-01/tasks.md, fixtures/projeto-ruim/docs/violacoes/sprint-01/fases.md, fixtures/projeto-ruim/docs/violacoes/BLOQUEIOS.md, fixtures/projeto-ruim/docs/pasta-sem-orquestrador/leiame.md]
      altera: []
    teste_integracao: Le os arquivos com gray-matter e espera frontmatter sintaticamente valido em todos
    teste_funcional: Dada a task paralelizavel da fixture de violacoes, depende_de nao esta vazio
    criterio_aceite: Os cinco arquivos existem e todos tem YAML sintaticamente valido
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
---

# Tasks — Sprint 01

> Um bloco por task. Na execução (F6), a linha `status` é atualizada em cada transição.

---

```yaml
id: T-01.01
titulo: Andaime do pacote npm
objetivo: Criar o pacote TypeScript ESM strict com os scripts de build e teste
arquivos:
  cria: [package.json, tsconfig.json, .gitignore, src/index.ts]
  altera: []
teste_integracao: Compila um arquivo com erro de tipo deliberado e espera o build falhar
teste_funcional: Dado o tsconfig gravado, `tsc` rejeita atribuir string a number
criterio_aceite: `npm run build` termina com código 0 e `strict` está true no tsconfig
depende_de: []
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 14 passed, 0 failed
```

---

```yaml
id: T-01.02
titulo: Configuração do Vitest
objetivo: Deixar a suíte de testes executável por `npm test`
arquivos:
  cria: [vitest.config.ts, src/andaime.test.ts]
  altera: [package.json]
teste_integracao: Roda o vitest sobre um arquivo temporário e espera o resultado reportado
teste_funcional: Dado um teste trivial que soma 1 mais 1, a suíte reporta 1 passed
criterio_aceite: `npm test` termina com código 0 e reporta pelo menos 1 teste passando
depende_de: [T-01.01]
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 14 passed, 0 failed
```

---

```yaml
id: T-01.03
titulo: Fixture de trabalho sprintx completo
objetivo: Gravar em disco um trabalho sprintx com todos os kinds que a sprintx produz
arquivos:
  cria: [fixtures/projeto-ok/docs/exportacao-csv/**]
  altera: []
teste_integracao: Lê os sete arquivos com gray-matter e espera frontmatter válido em todos
teste_funcional: Dado o ORQUESTRADOR da fixture, o kind lido é `orquestrador` e o `expx_tool` é `sprintx`
criterio_aceite: Os sete arquivos existem e cada um tem o kind esperado no frontmatter
depende_de: []
paralelizavel: true
status: concluida  # 2026-08-29 · suíte: 14 passed, 0 failed
```

---

```yaml
id: T-01.04
titulo: Fixture de trabalho runx completo
objetivo: Gravar em disco um trabalho runx com os kinds exclusivos do ciclo de manutenção
arquivos:
  cria: [fixtures/projeto-ok/docs/manutencao/OC-2026-0142-frete/**]
  altera: []
teste_integracao: Lê os seis arquivos com gray-matter e espera frontmatter válido em todos
teste_funcional: Dada a task de bug da fixture, o campo `teste_regressao` vem preenchido
criterio_aceite: Os seis arquivos existem e o ORQUESTRADOR tem `tipo_trabalho: ocorrencia`
depende_de: []
paralelizavel: true
status: concluida  # 2026-08-29 · suíte: 14 passed, 0 failed
```

---

```yaml
id: T-01.05
titulo: Fixture de histórico de relatórios
objetivo: Gravar em disco o histórico com relatório técnico, de uso e o índice
arquivos:
  cria: [fixtures/projeto-ok/docs/relatorios/**]
  altera: []
teste_integracao: Lê os três arquivos e espera os kinds `relatorios_indice`, `relatorio_tecnico` e `relatorio_uso`
teste_funcional: Dado o relatório de uso da fixture, o frontmatter não tem `arquivos_alterados`
criterio_aceite: Os três arquivos existem e o INDICE não tem a chave `trabalho_id`
depende_de: []
paralelizavel: true
status: concluida  # 2026-08-29 · suíte: 14 passed, 0 failed
```

---

```yaml
id: T-01.06
titulo: Fixtures dos casos de leitura quebrada
objetivo: Gravar os casos que impedem a leitura do arquivo como estado válido
arquivos:
  cria: [fixtures/projeto-ruim/docs/{yaml-invalido,kind-desconhecido,schema-futuro,sem-frontmatter}/ORQUESTRADOR.md]
  altera: []
teste_integracao: Lê os quatro arquivos e espera que nenhuma leitura lance exceção não tratada
teste_funcional: Dado o arquivo de YAML inválido, gray-matter lança e o erro é capturável
criterio_aceite: Os quatro arquivos existem e nenhum deles é um estado válido
depende_de: []
paralelizavel: true
status: concluida  # 2026-08-29 · suíte: 14 passed, 0 failed
```

---

```yaml
id: T-01.07
titulo: Fixtures dos casos de conteúdo defeituoso
objetivo: Gravar os casos que são legíveis mas violam o método
arquivos:
  cria: [fixtures/projeto-ruim/docs/{enum-errado,chave-ausente,violacoes,pasta-sem-orquestrador}/**]
  altera: []
teste_integracao: Lê os arquivos com gray-matter e espera frontmatter sintaticamente válido em todos
teste_funcional: Dada a task paralelizável da fixture de violações, `depende_de` não está vazio
criterio_aceite: Os cinco arquivos existem e todos têm YAML sintaticamente válido
depende_de: []
paralelizavel: true
status: concluida  # 2026-08-29 · suíte: 14 passed, 0 failed
```
