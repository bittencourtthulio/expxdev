---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: expx-watch-terminal
sprint_id: sprint-02
atualizado_em: 2026-08-30
tasks:
  - id: T-02.01
    titulo: Medicao e corte por largura
    fase: F-02.1
    status: concluida
    objetivo: Cortar texto na largura pedida contando colunas e nao code points
    arquivos:
      cria: [src/watch/desenho/largura.ts, src/watch/desenho/largura.test.ts]
      altera: []
    teste_integracao: Corta os titulos das nove fixtures em 60 colunas e afirma que nenhuma linha excede 60
    teste_funcional: Dado um titulo com c cedilha em NFD e largura 10, devolve dez colunas e nao dez code points
    criterio_aceite: Nenhuma saida de cortar excede a largura pedida, em NFC e em NFD
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-30
    suite: verde
  - id: T-02.02
    titulo: Emissao de cor com desligamento
    fase: F-02.1
    status: concluida
    objetivo: Emitir codigo ANSI so quando a cor esta ligada, decidida por isTTY e NO_COLOR
    arquivos:
      cria: [src/watch/desenho/cor.ts, src/watch/desenho/cor.test.ts]
      altera: []
    teste_integracao: Com cor desligada, pintar devolve o texto identico a entrada para os seis papeis de cor
    teste_funcional: Dado NO_COLOR definido e stdout TTY, corAtiva devolve false
    criterio_aceite: Com cor desligada nenhuma saida contem escape ANSI e com cor ligada o texto e delimitado por reset
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-30
    suite: verde
  - id: T-02.03
    titulo: Escolha do trabalho atual
    fase: F-02.2
    status: concluida
    objetivo: Decidir qual trabalho seguir a partir do estado.json e, na falta dele, do plano
    arquivos:
      cria: [src/watch/visao/escolher.ts, src/watch/visao/escolher.test.ts]
      altera: []
    teste_integracao: Com a fixture com-estado devolve o trabalho do campo trabalho e com estado-invalido devolve o unico em_andamento
    teste_funcional: Dados dois trabalhos em_andamento e nenhum estado.json, devolve o de atualizado_em mais recente
    criterio_aceite: Os tres casos da decisao D-05 devolvem o trabalho esperado e sem trabalho devolve null
    depende_de: [T-01.01, T-01.05]
    paralelizavel: true
    concluida_em: 2026-08-30
    suite: verde
  - id: T-02.04
    titulo: Projecao da visao do watch
    fase: F-02.2
    status: concluida
    objetivo: Reunir estado, projeto e rastro numa estrutura unica que o desenho consome
    arquivos:
      cria: [src/watch/visao/projetar.ts, src/watch/visao/projetar.test.ts]
      altera: []
    teste_integracao: Projeta as nove fixtures e afirma que nenhuma lanca e que degradado e true tambem quando o estado.json existe mas e invalido ou de versao futura
    teste_funcional: Dada a fixture legado-raio-alto, a visao traz raio alto e orcamento_arquivos 2/3
    criterio_aceite: degradado e true em estado-invalido estado-versao-futura sem-trabalho concluido com-bloqueio e varios-trabalhos, e false em com-estado legado-raio-alto e sem-rastro
    depende_de: [T-01.07, T-02.03]
    paralelizavel: false
    concluida_em: 2026-08-30
    suite: verde
  - id: T-02.05
    titulo: Secao de cabecalho
    fase: F-02.3
    status: concluida
    objetivo: Desenhar trabalho, ferramenta, titulo, fase, progresso, raio, orcamento, branch e PR
    arquivos:
      cria: [src/watch/desenho/cabecalho.ts, src/watch/desenho/cabecalho.test.ts]
      altera: []
    teste_integracao: Desenha o cabecalho das nove fixtures em 80 colunas sem exceder a largura
    teste_funcional: Dada a visao degradada, a linha de raio e orcamento nao e emitida por falta de fonte
    criterio_aceite: O cabecalho traz os nove campos quando existem, omite a linha de legado no modo degradado, deriva o par concluidas sobre total das tasks do plano nesse modo, e devolve a linha nenhum trabalho aberto quando nao ha trabalho nem estado
    depende_de: [T-02.01, T-02.02, T-02.04]
    paralelizavel: true
    concluida_em: 2026-08-30
    suite: verde
  - id: T-02.06
    titulo: Secao de bloqueios no topo
    fase: F-02.3
    status: concluida
    objetivo: Listar bloqueios abertos com task afetada e ha quantos dias, acima de tudo
    arquivos:
      cria: [src/watch/desenho/bloqueios.ts, src/watch/desenho/bloqueios.test.ts]
      altera: []
    teste_integracao: Com a fixture com-bloqueio, desenharBloqueios devolve uma linha por bloqueio aberto com o id da task afetada
    teste_funcional: Dado um bloqueio aberto hoje, a linha diz hoje em vez de ha 0 dias
    criterio_aceite: Com bloqueio aberto devolve uma linha por bloqueio e sem bloqueio aberto devolve lista vazia
    depende_de: [T-02.01, T-02.02, T-02.04]
    paralelizavel: true
    concluida_em: 2026-08-30
    suite: verde
  - id: T-02.07
    titulo: Secao da arvore do trabalho
    fase: F-02.3
    status: concluida
    objetivo: Desenhar sprints, fases e tasks indentadas, com status, destaque e dependencias compactas
    arquivos:
      cria: [src/watch/desenho/arvore.ts, src/watch/desenho/arvore.test.ts]
      altera: []
    teste_integracao: Desenha a arvore da fixture com-estado e afirma uma linha por sprint, fase e task
    teste_funcional: Uma sprint concluido e uma task concluida recebem cada uma o marcador do seu nivel, e a task em_andamento e a unica destacada
    criterio_aceite: Cada task vira uma linha com marcador de status e a task em_andamento e a unica destacada
    depende_de: [T-02.01, T-02.02, T-02.04]
    paralelizavel: true
    concluida_em: 2026-08-30
    suite: verde
  - id: T-02.08
    titulo: Secao de eventos recentes
    fase: F-02.3
    status: concluida
    objetivo: Mostrar as ultimas linhas do rastro em ordem inversa, com agente
    arquivos:
      cria: [src/watch/desenho/eventos.ts, src/watch/desenho/eventos.test.ts]
      altera: []
    teste_integracao: Com a fixture sem-rastro, desenharEventos devolve lista vazia e com a fixture com-estado devolve uma linha por evento
    teste_funcional: Dado rastro com dez linhas, devolve dez linhas com a mais recente no topo e o agente em cada uma
    criterio_aceite: Sem rastro devolve lista vazia e com rastro a primeira linha e a de ts mais recente
    depende_de: [T-02.01, T-02.02, T-02.04]
    paralelizavel: true
    concluida_em: 2026-08-30
    suite: verde
  - id: T-02.09
    titulo: Rodape e composicao das secoes
    fase: F-02.3
    status: concluida
    objetivo: Desenhar tempo desde o ultimo evento e violacoes em aviso, e compor as cinco secoes
    arquivos:
      cria: [src/watch/desenho/desenhar.ts, src/watch/desenho/desenhar.test.ts]
      altera: []
    teste_integracao: Desenha as nove fixtures em 80 e em 60 colunas, afirma que nenhuma linha excede a largura e que com bloqueio aberto a secao de bloqueios vem antes da arvore
    teste_funcional: Dados dois eventos regra_violada, um com ts anterior a subida do watch e outro posterior, o rodape conta uma violacao
    criterio_aceite: As nove fixtures desenham nas duas larguras sem lancar, bloqueio aberto sobe acima da arvore, e o rodape conta so os eventos posteriores a subida
    depende_de: [T-02.05, T-02.06, T-02.07, T-02.08]
    paralelizavel: false
    concluida_em: 2026-08-30
    suite: verde
---

# Tasks — Sprint 02

---

```yaml
id: T-02.01
titulo: Medição e corte por largura
objetivo: Cortar texto na largura pedida contando colunas e não code points
arquivos:
  cria: [src/watch/desenho/largura.ts, src/watch/desenho/largura.test.ts]
  altera: []
teste_integracao: Corta os títulos das nove fixtures em 60 colunas e afirma que nenhuma linha excede 60
teste_funcional: Dado um título com "ç" em NFD e largura 10, devolve dez colunas e não dez code points
criterio_aceite: Nenhuma saída de cortar excede a largura pedida, em NFC e em NFD
depende_de: []
paralelizavel: true
status: concluida
concluida_em: 2026-08-30 · suíte: verde
```

---

```yaml
id: T-02.02
titulo: Emissão de cor com desligamento
objetivo: Emitir código ANSI só quando a cor está ligada, decidida por isTTY e NO_COLOR
arquivos:
  cria: [src/watch/desenho/cor.ts, src/watch/desenho/cor.test.ts]
  altera: []
teste_integracao: Com cor desligada, pintar devolve o texto idêntico à entrada para os seis papéis de cor
teste_funcional: Dado NO_COLOR definido e stdout TTY, corAtiva devolve false
criterio_aceite: Com cor desligada nenhuma saída contém escape ANSI e com cor ligada o texto é delimitado por reset
depende_de: []
paralelizavel: true
status: concluida
concluida_em: 2026-08-30 · suíte: 3 passed, 0 failed
```

---

```yaml
id: T-02.03
titulo: Escolha do trabalho atual
objetivo: Decidir qual trabalho seguir a partir do estado.json e, na falta dele, do plano
arquivos:
  cria: [src/watch/visao/escolher.ts, src/watch/visao/escolher.test.ts]
  altera: []
teste_integracao: Com a fixture com-estado devolve o trabalho do campo trabalho e com estado-invalido devolve o único em_andamento
teste_funcional: Dados dois trabalhos em_andamento e nenhum estado.json, devolve o de atualizado_em mais recente
criterio_aceite: Os três casos da decisão D-05 devolvem o trabalho esperado e sem trabalho devolve null
depende_de: [T-01.01, T-01.05]
paralelizavel: true
status: concluida
concluida_em: 2026-08-30 · suíte: 5 passed, 0 failed
```

---

```yaml
id: T-02.04
titulo: Projeção da visão do watch
objetivo: Reunir estado, projeto e rastro numa estrutura única que o desenho consome
arquivos:
  cria: [src/watch/visao/projetar.ts, src/watch/visao/projetar.test.ts]
  altera: []
teste_integracao: Projeta as nove fixtures e afirma que nenhuma lança e que degradado é true também quando o estado.json existe mas é inválido ou de versão futura
teste_funcional: Dada a fixture legado-raio-alto, a visão traz raio alto e orcamento_arquivos 2/3
criterio_aceite: degradado é true em estado-invalido, estado-versao-futura, sem-trabalho, concluido, com-bloqueio e varios-trabalhos, e false em com-estado, legado-raio-alto e sem-rastro
depende_de: [T-01.07, T-02.03]
paralelizavel: false
status: concluida
concluida_em: 2026-08-30 · suíte: 7 passed, 0 failed
```

---

```yaml
id: T-02.05
titulo: Seção de cabeçalho
objetivo: Desenhar trabalho, ferramenta, título, fase, progresso, raio, orçamento, branch e PR
arquivos:
  cria: [src/watch/desenho/cabecalho.ts, src/watch/desenho/cabecalho.test.ts]
  altera: []
teste_integracao: Desenha o cabeçalho das nove fixtures em 80 colunas sem exceder a largura
teste_funcional: Dada a visão degradada, a linha de raio e orçamento não é emitida por falta de fonte
criterio_aceite: O cabeçalho traz os nove campos quando existem, omite a linha de legado no modo degradado, deriva o par concluídas sobre total das tasks do plano nesse modo, e devolve a linha nenhum trabalho aberto quando não há trabalho nem estado
depende_de: [T-02.01, T-02.02, T-02.04]
paralelizavel: true
status: concluida
concluida_em: 2026-08-30 · suíte: verde
```

---

```yaml
id: T-02.06
titulo: Seção de bloqueios no topo
objetivo: Listar bloqueios abertos com task afetada e há quantos dias, acima de tudo
arquivos:
  cria: [src/watch/desenho/bloqueios.ts, src/watch/desenho/bloqueios.test.ts]
  altera: []
teste_integracao: Com a fixture com-bloqueio, desenharBloqueios devolve uma linha por bloqueio aberto com o id da task afetada
teste_funcional: Dado um bloqueio aberto hoje, a linha diz "hoje" em vez de "há 0 dias"
criterio_aceite: Com bloqueio aberto devolve uma linha por bloqueio e sem bloqueio aberto devolve lista vazia
depende_de: [T-02.01, T-02.02, T-02.04]
paralelizavel: true
status: concluida
concluida_em: 2026-08-30 · suíte: verde
```

---

```yaml
id: T-02.07
titulo: Seção da árvore do trabalho
objetivo: Desenhar sprints, fases e tasks indentadas, com status, destaque e dependências compactas
arquivos:
  cria: [src/watch/desenho/arvore.ts, src/watch/desenho/arvore.test.ts]
  altera: []
teste_integracao: Desenha a árvore da fixture com-estado e afirma uma linha por sprint, fase e task
teste_funcional: Uma sprint concluido e uma task concluida recebem cada uma o marcador do seu nível, e a task em_andamento é a única destacada
criterio_aceite: Cada task vira uma linha com marcador de status e a task em_andamento é a única destacada
depende_de: [T-02.01, T-02.02, T-02.04]
paralelizavel: true
status: concluida
concluida_em: 2026-08-30 · suíte: verde
```

---

```yaml
id: T-02.08
titulo: Seção de eventos recentes
objetivo: Mostrar as últimas linhas do rastro em ordem inversa, com agente
arquivos:
  cria: [src/watch/desenho/eventos.ts, src/watch/desenho/eventos.test.ts]
  altera: []
teste_integracao: Com a fixture sem-rastro, desenharEventos devolve lista vazia e com a fixture com-estado devolve uma linha por evento
teste_funcional: Dado rastro com dez linhas, devolve dez linhas com a mais recente no topo e o agente em cada uma
criterio_aceite: Sem rastro devolve lista vazia e com rastro a primeira linha é a de ts mais recente
depende_de: [T-02.01, T-02.02, T-02.04]
paralelizavel: true
status: concluida
concluida_em: 2026-08-30 · suíte: verde
```

---

```yaml
id: T-02.09
titulo: Rodapé e composição das seções
objetivo: Desenhar tempo desde o último evento e violações em aviso, e compor as cinco seções
arquivos:
  cria: [src/watch/desenho/desenhar.ts, src/watch/desenho/desenhar.test.ts]
  altera: []
teste_integracao: Desenha as nove fixtures em 80 e em 60 colunas, afirma que nenhuma linha excede a largura e que com bloqueio aberto a seção de bloqueios vem antes da árvore
teste_funcional: Dados dois eventos regra_violada, um com ts anterior à subida do watch e outro posterior, o rodapé conta uma violação
criterio_aceite: As nove fixtures desenham nas duas larguras sem lançar, bloqueio aberto sobe acima da árvore, e o rodapé conta só os eventos posteriores à subida
depende_de: [T-02.05, T-02.06, T-02.07, T-02.08]
paralelizavel: false
status: concluida
concluida_em: 2026-08-30 · suíte: 6 passed, 0 failed
```
