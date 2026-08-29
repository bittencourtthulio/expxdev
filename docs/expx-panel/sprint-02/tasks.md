---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: expx-panel
sprint_id: sprint-02
atualizado_em: 2026-08-29
tasks:
  - id: T-02.01
    titulo: Enums do contrato em zod
    fase: F-02.1
    status: concluida
    objetivo: Declarar os doze enums do contrato como esquemas zod reutilizaveis
    arquivos:
      cria: [src/parser/esquema/enums.ts, src/parser/esquema/enums.test.ts]
      altera: []
    teste_integracao: Importa os enums e espera que todo valor da tabela do contrato seja aceito
    teste_funcional: Dado o valor concluido no enum de status de task, a validacao falha
    criterio_aceite: Status de task e status de trabalho sao enums distintos e nao aceitam o valor do outro
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.02
    titulo: Esquema do cabecalho comum
    fase: F-02.1
    status: concluida
    objetivo: Validar as quatro chaves comuns e tratar relatorios_indice que nao tem trabalho_id
    arquivos:
      cria: [src/parser/esquema/cabecalho.ts, src/parser/esquema/cabecalho.test.ts]
      altera: []
    teste_integracao: Valida o cabecalho de cada fixture boa e espera todas aceitas
    teste_funcional: Dado um frontmatter de relatorios_indice sem trabalho_id, a validacao passa
    criterio_aceite: Falta de trabalho_id so e aceita quando o kind e relatorios_indice
    depende_de: [T-02.01]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.03
    titulo: Esquema dos treze kinds
    fase: F-02.1
    status: concluida
    objetivo: Declarar um esquema zod por kind incluindo decisoes que nao esta no contrato
    arquivos:
      cria: [src/parser/esquema/kinds.ts, src/parser/esquema/kinds.test.ts]
      altera: []
    teste_integracao: Valida cada arquivo de fixtures/projeto-ok contra o esquema do seu kind
    teste_funcional: Dado um campo arquivos em lista plana, o esquema normaliza para cria e altera
    criterio_aceite: Os treze kinds validam e o campo arquivos aceita as duas formas
    depende_de: [T-02.02]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.04
    titulo: Leitura de frontmatter com posicao de linha
    fase: F-02.2
    status: concluida
    objetivo: Ler o frontmatter devolvendo os dados e o mapa de linha de cada campo
    arquivos:
      cria: [src/parser/leitura/frontmatter.ts, src/parser/leitura/frontmatter.test.ts]
      altera: []
    teste_integracao: Le um tasks.md de fixture e espera dados e mapa de linhas preenchidos
    teste_funcional: Dada a segunda task do arquivo, o mapa aponta a linha em que ela comeca
    criterio_aceite: A linha devolvida para uma task conhecida bate com a linha real do arquivo
    depende_de: [T-02.03]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.05
    titulo: Classificacao de rejeicao
    fase: F-02.2
    status: concluida
    objetivo: Converter cada falha de leitura em rejeicao com motivo tipado em vez de excecao
    arquivos:
      cria: [src/parser/leitura/rejeicao.ts, src/parser/leitura/rejeicao.test.ts]
      altera: []
    teste_integracao: Le os quatro arquivos de leitura quebrada e espera quatro rejeicoes sem excecao
    teste_funcional: Dado o arquivo com expx_schema 2, o motivo da rejeicao e versao futura
    criterio_aceite: Os quatro casos devolvem motivos distintos e nenhum lanca excecao
    depende_de: [T-02.04]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.06
    titulo: Leitor de arquivo de estado
    fase: F-02.2
    status: concluida
    objetivo: Unir leitura validacao e rejeicao numa funcao unica por arquivo
    arquivos:
      cria: [src/parser/leitura/arquivo.ts, src/parser/leitura/arquivo.test.ts]
      altera: []
    teste_integracao: Le todo arquivo das duas fixtures e espera sempre aceito ou rejeitado
    teste_funcional: Dado um ORQUESTRADOR valido, devolve aceito com kind orquestrador
    criterio_aceite: Nenhuma leitura das fixtures lanca excecao
    depende_de: [T-02.05]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.07
    titulo: Varredura de pastas candidatas
    fase: F-02.3
    status: concluida
    objetivo: Percorrer a pasta de docs ignorando o que nao e arquivo de estado conhecido
    arquivos:
      cria: [src/parser/descoberta/varredura.ts, src/parser/descoberta/varredura.test.ts]
      altera: []
    teste_integracao: Varre fixtures/projeto-ok e espera so os nomes de arquivo conhecidos do metodo
    teste_funcional: Dado um arquivo leiame.md solto, ele nao aparece na lista de candidatos
    criterio_aceite: Arquivo de base e LACUNAS nao entram na lista de candidatos
    depende_de: [T-02.06]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.08
    titulo: Identificacao de trabalhos
    fase: F-02.3
    status: concluida
    objetivo: Eleger como trabalho toda pasta com ORQUESTRADOR valido
    arquivos:
      cria: [src/parser/descoberta/trabalhos.ts, src/parser/descoberta/trabalhos.test.ts]
      altera: []
    teste_integracao: Varre fixtures/projeto-ok e espera exatamente dois trabalhos
    teste_funcional: Dada a pasta sem ORQUESTRADOR, ela nao vira trabalho nem gera rejeicao
    criterio_aceite: Devolve dois trabalhos e a pasta sem orquestrador e ignorada em silencio
    depende_de: [T-02.07]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.09
    titulo: Montagem de sprints fases e tasks
    fase: F-02.4
    status: concluida
    objetivo: Aninhar sprints fases e tasks sob cada trabalho varrendo as pastas do disco
    arquivos:
      cria: [src/parser/projeto/sprints.ts, src/parser/projeto/sprints.test.ts]
      altera: []
    teste_integracao: Monta o trabalho sprintx da fixture e espera uma sprint com fases e tasks
    teste_funcional: Dada a sprint-01 da fixture, o numero de tasks aninhadas bate com o arquivo
    criterio_aceite: As tasks sao vinculadas a fase pelo campo fase da propria task
    depende_de: [T-02.08]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.10
    titulo: Calculo de progresso
    fase: F-02.4
    status: concluida
    objetivo: Derivar o progresso de cada fase e de cada sprint a partir do status das tasks
    arquivos:
      cria: [src/parser/projeto/progresso.ts, src/parser/projeto/progresso.test.ts]
      altera: []
    teste_integracao: Calcula o progresso da sprint da fixture e espera valor entre zero e um
    teste_funcional: Dadas quatro tasks com uma concluida, o progresso da fase e zero virgula vinte e cinco
    criterio_aceite: Fase sem nenhuma task tem progresso zero e nao divide por zero
    depende_de: [T-02.09]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.11
    titulo: Agregacao de bloqueios e historico
    fase: F-02.4
    status: concluida
    objetivo: Reunir bloqueios de todos os trabalhos e montar o historico varrendo relatorios
    arquivos:
      cria: [src/parser/projeto/bloqueios.ts, src/parser/projeto/historico.ts, src/parser/projeto/agregacao.test.ts]
      altera: []
    teste_integracao: Monta o projeto da fixture e espera bloqueios e historico preenchidos
    teste_funcional: Dado o historico da fixture, a entrada tem relatorio tecnico e de uso
    criterio_aceite: Um bloqueio com resolvido_em null conta como aberto e o resolvido nao conta
    depende_de: [T-02.10]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.12
    titulo: Violacoes de teste da task
    fase: F-02.5
    status: concluida
    objetivo: Detectar task sem teste obrigatorio e bug sem teste de regressao
    arquivos:
      cria: [src/parser/conformidade/testes.ts, src/parser/conformidade/testes.test.ts]
      altera: []
    teste_integracao: Roda as regras sobre projeto-ok e espera nenhuma violacao de teste
    teste_funcional: Dada uma task com teste_integracao so de espacos, a violacao dispara
    criterio_aceite: A regra de teste de regressao so dispara em trabalho runx com tipo bug
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.13
    titulo: Violacoes de coerencia da task
    fase: F-02.5
    status: concluida
    objetivo: Detectar task concluida sem suite verde e paralelizavel com dependencia
    arquivos:
      cria: [src/parser/conformidade/coerencia.ts, src/parser/conformidade/coerencia.test.ts]
      altera: []
    teste_integracao: Roda as regras sobre projeto-ruim e espera as duas violacoes previstas
    teste_funcional: Dada uma task concluida com suite vermelha, a violacao dispara com o id da task
    criterio_aceite: Task paralelizavel com depende_de vazio nao gera violacao
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.14
    titulo: Violacoes de estrutura e prazo
    fase: F-02.5
    status: concluida
    objetivo: Detectar fase ou sprint sem criterio de saida e bloqueio aberto ha muitos dias
    arquivos:
      cria: [src/parser/conformidade/estrutura.ts, src/parser/conformidade/estrutura.test.ts]
      altera: []
    teste_integracao: Roda as regras sobre as duas fixtures e espera violacao so na ruim
    teste_funcional: Dado um bloqueio aberto ha dez dias e o limite de sete, a violacao dispara
    criterio_aceite: A data de hoje entra como parametro e a mesma fixture da o mesmo resultado sempre
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.15
    titulo: Violacoes de referencia cruzada
    fase: F-02.5
    status: concluida
    objetivo: Detectar id inexistente ciclo de dependencia e estagio incoerente com a ferramenta
    arquivos:
      cria: [src/parser/conformidade/referencias.ts, src/parser/conformidade/referencias.test.ts]
      altera: []
    teste_integracao: Roda as regras sobre projeto-ok e espera nenhuma violacao de referencia
    teste_funcional: Dado um depende_de apontando task inexistente, a violacao nomeia o id ausente
    criterio_aceite: Um ciclo de dependencia e detectado e a funcao termina sem estourar a pilha
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
---

# Tasks — Sprint 02

> Um bloco por task. Na execução (F6), a linha `status` é atualizada em cada transição.

---

```yaml
id: T-02.01
titulo: Enums do contrato em zod
objetivo: Declarar os doze enums do contrato como esquemas zod reutilizáveis
arquivos:
  cria: [src/parser/esquema/enums.ts, src/parser/esquema/enums.test.ts]
  altera: []
teste_integracao: Importa os enums e espera que todo valor da tabela do contrato seja aceito
teste_funcional: Dado o valor `concluido` no enum de status de task, a validação falha
criterio_aceite: Status de task e status de trabalho são enums distintos e não aceitam o valor do outro
depende_de: []
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 16 passed (16)
```

---

```yaml
id: T-02.02
titulo: Esquema do cabeçalho comum
objetivo: Validar as quatro chaves comuns e tratar `relatorios_indice`, que não tem `trabalho_id`
arquivos:
  cria: [src/parser/esquema/cabecalho.ts, src/parser/esquema/cabecalho.test.ts]
  altera: []
teste_integracao: Valida o cabeçalho de cada fixture boa e espera todas aceitas
teste_funcional: Dado um frontmatter de `relatorios_indice` sem `trabalho_id`, a validação passa
criterio_aceite: Falta de `trabalho_id` só é aceita quando o kind é `relatorios_indice`
depende_de: [T-02.01]
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 18 passed (18)
```

---

```yaml
id: T-02.03
titulo: Esquema dos treze kinds
objetivo: Declarar um esquema zod por kind, incluindo `decisoes`, que não está no contrato
arquivos:
  cria: [src/parser/esquema/kinds.ts, src/parser/esquema/kinds.test.ts]
  altera: []
teste_integracao: Valida cada arquivo de `fixtures/projeto-ok` contra o esquema do seu kind
teste_funcional: Dado um campo `arquivos` em lista plana, o esquema normaliza para `{cria, altera}`
criterio_aceite: Os treze kinds validam e o campo `arquivos` aceita as duas formas
depende_de: [T-02.02]
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 20 passed (20)
```

---

```yaml
id: T-02.04
titulo: Leitura de frontmatter com posição de linha
objetivo: Ler o frontmatter devolvendo os dados e o mapa de linha de cada campo
arquivos:
  cria: [src/parser/leitura/frontmatter.ts, src/parser/leitura/frontmatter.test.ts]
  altera: []
teste_integracao: Lê um `tasks.md` de fixture e espera dados e mapa de linhas preenchidos
teste_funcional: Dada a segunda task do arquivo, o mapa aponta a linha em que ela começa
criterio_aceite: A linha devolvida para uma task conhecida bate com a linha real do arquivo
depende_de: [T-02.03]
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 24 passed (24)
```

---

```yaml
id: T-02.05
titulo: Classificação de rejeição
objetivo: Converter cada falha de leitura em rejeição com motivo tipado, em vez de exceção
arquivos:
  cria: [src/parser/leitura/rejeicao.ts, src/parser/leitura/rejeicao.test.ts]
  altera: []
teste_integracao: Lê os quatro arquivos de leitura quebrada e espera quatro rejeições sem exceção
teste_funcional: Dado o arquivo com `expx_schema: 2`, o motivo da rejeição é "versão futura"
criterio_aceite: Os quatro casos devolvem motivos distintos e nenhum lança exceção
depende_de: [T-02.04]
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 27 passed (27)
```

---

```yaml
id: T-02.06
titulo: Leitor de arquivo de estado
objetivo: Unir leitura, validação e rejeição numa função única por arquivo
arquivos:
  cria: [src/parser/leitura/arquivo.ts, src/parser/leitura/arquivo.test.ts]
  altera: []
teste_integracao: Lê todo arquivo das duas fixtures e espera sempre aceito ou rejeitado
teste_funcional: Dado um ORQUESTRADOR válido, devolve aceito com kind `orquestrador`
criterio_aceite: Nenhuma leitura das fixtures lança exceção
depende_de: [T-02.05]
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 31 passed (31)
```

---

```yaml
id: T-02.07
titulo: Varredura de pastas candidatas
objetivo: Percorrer a pasta de docs ignorando o que não é arquivo de estado conhecido
arquivos:
  cria: [src/parser/descoberta/varredura.ts, src/parser/descoberta/varredura.test.ts]
  altera: []
teste_integracao: Varre `fixtures/projeto-ok` e espera só os nomes de arquivo conhecidos do método
teste_funcional: Dado um arquivo `leiame.md` solto, ele não aparece na lista de candidatos
criterio_aceite: Arquivo de base e `00-LACUNAS.md` não entram na lista de candidatos
depende_de: [T-02.06]
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 34 passed (34)
```

---

```yaml
id: T-02.08
titulo: Identificação de trabalhos
objetivo: Eleger como trabalho toda pasta com `ORQUESTRADOR.md` válido
arquivos:
  cria: [src/parser/descoberta/trabalhos.ts, src/parser/descoberta/trabalhos.test.ts]
  altera: []
teste_integracao: Varre `fixtures/projeto-ok` e espera exatamente dois trabalhos
teste_funcional: Dada a pasta sem ORQUESTRADOR, ela não vira trabalho nem gera rejeição
criterio_aceite: Devolve dois trabalhos e a pasta sem orquestrador é ignorada em silêncio
depende_de: [T-02.07]
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 37 passed (37)
```

---

```yaml
id: T-02.09
titulo: Montagem de sprints, fases e tasks
objetivo: Aninhar sprints, fases e tasks sob cada trabalho, varrendo as pastas do disco
arquivos:
  cria: [src/parser/projeto/sprints.ts, src/parser/projeto/sprints.test.ts]
  altera: []
teste_integracao: Monta o trabalho sprintx da fixture e espera uma sprint com fases e tasks
teste_funcional: Dada a `sprint-01` da fixture, o número de tasks aninhadas bate com o arquivo
criterio_aceite: As tasks são vinculadas à fase pelo campo `fase` da própria task
depende_de: [T-02.08]
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 44 passed (44)
```

---

```yaml
id: T-02.10
titulo: Cálculo de progresso
objetivo: Derivar o progresso de cada fase e de cada sprint a partir do status das tasks
arquivos:
  cria: [src/parser/projeto/progresso.ts, src/parser/projeto/progresso.test.ts]
  altera: []
teste_integracao: Calcula o progresso da sprint da fixture e espera valor entre 0 e 1
teste_funcional: Dadas quatro tasks com uma concluída, o progresso da fase é 0.25
criterio_aceite: Fase sem nenhuma task tem progresso 0 e não divide por zero
depende_de: [T-02.09]
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 44 passed (44)
```

---

```yaml
id: T-02.11
titulo: Agregação de bloqueios e histórico
objetivo: Reunir bloqueios de todos os trabalhos e montar o histórico varrendo `docs/relatorios/`
arquivos:
  cria: [src/parser/projeto/bloqueios.ts, src/parser/projeto/historico.ts, src/parser/projeto/agregacao.test.ts]
  altera: []
teste_integracao: Monta o projeto da fixture e espera bloqueios e histórico preenchidos
teste_funcional: Dado o histórico da fixture, a entrada tem relatório técnico e de uso
criterio_aceite: Um bloqueio com `resolvido_em: null` conta como aberto e o resolvido não conta
depende_de: [T-02.10]
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 44 passed (44)
```

---

```yaml
id: T-02.12
titulo: Violações de teste da task
objetivo: Detectar task sem teste obrigatório e bug sem teste de regressão
arquivos:
  cria: [src/parser/conformidade/testes.ts, src/parser/conformidade/testes.test.ts]
  altera: []
teste_integracao: Roda as regras sobre `projeto-ok` e espera nenhuma violação de teste
teste_funcional: Dada uma task com `teste_integracao` só de espaços, a violação dispara
criterio_aceite: A regra de teste de regressão só dispara em trabalho runx com tipo `bug`
depende_de: []
paralelizavel: true
status: concluida  # 2026-08-29 · suíte: 58 passed (58)
```

---

```yaml
id: T-02.13
titulo: Violações de coerência da task
objetivo: Detectar task concluída sem suíte verde e paralelizável com dependência
arquivos:
  cria: [src/parser/conformidade/coerencia.ts, src/parser/conformidade/coerencia.test.ts]
  altera: []
teste_integracao: Roda as regras sobre `projeto-ruim` e espera as duas violações previstas
teste_funcional: Dada uma task concluída com suíte vermelha, a violação dispara com o id da task
criterio_aceite: Task paralelizável com `depende_de` vazio não gera violação
depende_de: []
paralelizavel: true
status: concluida  # 2026-08-29 · suíte: 58 passed (58)
```

---

```yaml
id: T-02.14
titulo: Violações de estrutura e prazo
objetivo: Detectar fase ou sprint sem critério de saída e bloqueio aberto há muitos dias
arquivos:
  cria: [src/parser/conformidade/estrutura.ts, src/parser/conformidade/estrutura.test.ts]
  altera: []
teste_integracao: Roda as regras sobre as duas fixtures e espera violação só na ruim
teste_funcional: Dado um bloqueio aberto há dez dias e o limite de sete, a violação dispara
criterio_aceite: A data de hoje entra como parâmetro e a mesma fixture dá o mesmo resultado sempre
depende_de: []
paralelizavel: true
status: concluida  # 2026-08-29 · suíte: 58 passed (58)
```

---

```yaml
id: T-02.15
titulo: Violações de referência cruzada
objetivo: Detectar id inexistente, ciclo de dependência e estágio incoerente com a ferramenta
arquivos:
  cria: [src/parser/conformidade/referencias.ts, src/parser/conformidade/referencias.test.ts]
  altera: []
teste_integracao: Roda as regras sobre `projeto-ok` e espera nenhuma violação de referência
teste_funcional: Dado um `depende_de` apontando task inexistente, a violação nomeia o id ausente
criterio_aceite: Um ciclo de dependência é detectado e a função termina sem estourar a pilha
depende_de: []
paralelizavel: true
status: concluida  # 2026-08-29 · suíte: 58 passed (58)
```
