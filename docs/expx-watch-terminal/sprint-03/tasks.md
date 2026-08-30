---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: expx-watch-terminal
sprint_id: sprint-03
atualizado_em: 2026-08-30
tasks:
  - id: T-03.01
    titulo: Descoberta da raiz do projeto
    fase: F-03.1
    status: concluida
    objetivo: Subir diretorios ate achar .git e devolver as duas raizes que o watch observa
    arquivos:
      cria: [src/watch/fontes/raiz.ts, src/watch/fontes/raiz.test.ts]
      altera: []
    teste_integracao: A partir de subpasta de pasta temporaria criada com mkdirSync de .git, devolve a raiz e nao a subpasta
    teste_funcional: Dado um caminho sem nenhum .git em nenhum ancestral, devolve o proprio diretorio
    criterio_aceite: Com .git devolve a raiz do repositorio e sem .git devolve o diretorio recebido
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-30
    suite: verde
  - id: T-03.02
    titulo: Observador das duas raizes com debounce
    fase: F-03.1
    status: concluida
    objetivo: Observar docs e .expx/estado.json com gatilhos separados e debounce de 150 ms
    arquivos:
      cria: [src/watch/fontes/observar.ts, src/watch/fontes/observar.test.ts]
      altera: []
    teste_integracao: Alterar um tasks.md dispara o gatilho de plano e gravar o estado.json por arquivo temporario mais renameSync dispara o de estado
    teste_funcional: Dadas tres alteracoes em 50 ms, o callback e chamado uma unica vez
    criterio_aceite: Os dois gatilhos disparam separados inclusive por rename, o debounce agrupa, e parar resolve sem vazar handle
    depende_de: [T-03.01]
    paralelizavel: false
    concluida_em: 2026-08-30
    suite: verde
  - id: T-03.03
    titulo: Redesenho incremental sem piscar
    fase: F-03.2
    status: concluida
    objetivo: Reescrever apenas as linhas que mudaram, reposicionando o cursor
    arquivos:
      cria: [src/watch/terminal/tela.ts, src/watch/terminal/tela.test.ts]
      altera: []
    teste_integracao: Redesenhar duas visoes que diferem em uma linha emite escrita de uma unica linha
    teste_funcional: Dada a mesma visao duas vezes, o segundo redesenho nao emite nenhuma escrita
    criterio_aceite: Redesenho de visao identica emite zero escrita e nenhum caminho emite limpeza de tela inteira
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-30
    suite: verde
  - id: T-03.04
    titulo: Restauracao do terminal na saida
    fase: F-03.2
    status: concluida
    objetivo: Devolver cursor e modo do terminal ao estado anterior em qualquer caminho de saida
    arquivos:
      cria: [src/watch/terminal/restaurar.ts, src/watch/terminal/restaurar.test.ts]
      altera: []
    teste_integracao: Registrar e disparar cada um dos quatro caminhos de saida executa a restauracao uma vez
    teste_funcional: Dada restauracao ja executada, disparar outro caminho nao a executa de novo
    criterio_aceite: Os quatro caminhos restauram e a restauracao e idempotente
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-30
    suite: verde
  - id: T-03.05
    titulo: Interpretacao das opcoes do watch
    fase: F-03.2
    status: concluida
    objetivo: Interpretar trabalho_id posicional, --todos e --ajuda
    arquivos:
      cria: [src/watch/opcoes.ts, src/watch/opcoes.test.ts]
      altera: []
    teste_integracao: Interpreta as tres formas da especificacao e devolve ok para cada uma
    teste_funcional: Dado --opcao-que-nao-existe, devolve erro nomeando a opcao desconhecida
    criterio_aceite: As tres formas devolvem ok e opcao desconhecida devolve erro sem lancar
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-30
    suite: verde
  - id: T-03.06
    titulo: Loop do watch ligando fontes e desenho
    fase: F-03.3
    status: concluida
    objetivo: Ler, desenhar, observar e redesenhar, relendo o plano so quando o plano muda
    arquivos:
      cria: [src/watch/watch.ts, src/watch/watch.test.ts]
      altera: []
    teste_integracao: Sobre a fixture com-estado, alterar o tasks.md faz a tela mudar e alterar so o rastro nao rele o plano
    teste_funcional: Dado expx watch com um trabalho_id sobre a fixture varios-trabalhos, o cabecalho desenhado e o do trabalho nomeado
    criterio_aceite: Mudanca no plano redesenha, mudanca so no rastro nao rele o plano, o id posicional seleciona o trabalho, e sem .expx sai limpo com codigo zero
    depende_de: [T-03.02, T-03.03, T-03.04, T-03.05]
    paralelizavel: false
    concluida_em: 2026-08-30
    suite: verde
  - id: T-03.07
    titulo: Registro do subcomando no CLI
    fase: F-03.3
    status: concluida
    objetivo: Acrescentar watch ao roteador, a ajuda e a tabela de executores
    arquivos:
      cria: []
      altera: [src/cli/subcomandos.ts, src/cli/subcomandos.test.ts, src/cli/expx.ts]
    teste_integracao: interpretarSubcomando com watch devolve ok, o executor existe na tabela, e a lista exata de subcomandos passa a ter sete nomes
    teste_funcional: Dado expx watch --ajuda, escreve o texto de ajuda do watch e devolve codigo zero
    criterio_aceite: watch consta de SUBCOMANDOS, da ajuda geral e de EXECUTORES, a assercao de lista exata em subcomandos.test.ts passa a incluir watch, e a suite do CLI fica verde
    depende_de: [T-03.06]
    paralelizavel: false
    concluida_em: 2026-08-30
    suite: verde
  - id: T-03.08
    titulo: Prova de somente leitura
    fase: F-03.3
    status: concluida
    objetivo: Provar por teste que nenhum caminho de codigo do watch escreve em disco
    arquivos:
      cria: [src/watch/somente-leitura.test.ts]
      altera: []
    teste_integracao: Espiona writeFileSync appendFileSync createWriteStream mkdirSync renameSync unlinkSync e rmSync em node:fs e node:fs/promises e afirma zero chamadas apos um ciclo completo do loop
    teste_funcional: Roda o watch sobre copia de fixture e afirma que nenhum arquivo teve mtime alterado
    criterio_aceite: As sete funcoes de escrita dos dois modulos somam zero chamadas e nenhum mtime muda apos o loop
    depende_de: [T-03.06, T-03.09]
    paralelizavel: false
    concluida_em: 2026-08-30
    suite: verde
  - id: T-03.09
    titulo: Listagem de trabalhos e modo todos
    fase: F-03.3
    status: concluida
    objetivo: Implementar a lista de trabalhos abertos e o comportamento quando nao ha trabalho aberto
    arquivos:
      cria: [src/watch/desenho/lista.ts, src/watch/desenho/lista.test.ts]
      altera: [src/watch/watch.ts, src/watch/watch.test.ts]
    teste_integracao: Sobre a fixture sem-trabalho, o watch desenha a lista de trabalhos recentes e o loop continua ativo em vez de encerrar
    teste_funcional: Sobre a fixture varios-trabalhos com --todos, a lista traz nao_iniciado, bloqueado e em_andamento, e omite o concluido
    criterio_aceite: Com --todos a lista traz um trabalho por linha sem arvore e exclui os concluidos, e sobre sem-trabalho o loop segue observando
    depende_de: [T-03.06]
    paralelizavel: false
    concluida_em: 2026-08-30
    suite: verde
---

# Tasks — Sprint 03

---

```yaml
id: T-03.01
titulo: Descoberta da raiz do projeto
objetivo: Subir diretórios até achar .git e devolver as duas raízes que o watch observa
arquivos:
  cria: [src/watch/fontes/raiz.ts, src/watch/fontes/raiz.test.ts]
  altera: []
teste_integracao: A partir de subpasta de pasta temporária criada com mkdirSync de .git, devolve a raiz e não a subpasta
teste_funcional: Dado um caminho sem nenhum .git em nenhum ancestral, devolve o próprio diretório
criterio_aceite: Com .git devolve a raiz do repositório e sem .git devolve o diretório recebido
depende_de: []
paralelizavel: true
status: concluida
concluida_em: 2026-08-30 · suíte: verde
```

---

```yaml
id: T-03.02
titulo: Observador das duas raízes com debounce
objetivo: Observar docs e .expx/estado.json com gatilhos separados e debounce de 150 ms
arquivos:
  cria: [src/watch/fontes/observar.ts, src/watch/fontes/observar.test.ts]
  altera: []
teste_integracao: Alterar um tasks.md dispara o gatilho de plano e gravar o estado.json por arquivo temporário mais renameSync dispara o de estado
teste_funcional: Dadas três alterações em 50 ms, o callback é chamado uma única vez
criterio_aceite: Os dois gatilhos disparam separados inclusive por rename, o debounce agrupa, e parar resolve sem vazar handle
depende_de: [T-03.01]
paralelizavel: false
status: concluida
concluida_em: 2026-08-30 · suíte: verde
```

---

```yaml
id: T-03.03
titulo: Redesenho incremental sem piscar
objetivo: Reescrever apenas as linhas que mudaram, reposicionando o cursor
arquivos:
  cria: [src/watch/terminal/tela.ts, src/watch/terminal/tela.test.ts]
  altera: []
teste_integracao: Redesenhar duas visões que diferem em uma linha emite escrita de uma única linha
teste_funcional: Dada a mesma visão duas vezes, o segundo redesenho não emite nenhuma escrita
criterio_aceite: Redesenho de visão idêntica emite zero escrita e nenhum caminho emite limpeza de tela inteira
depende_de: []
paralelizavel: true
status: concluida
concluida_em: 2026-08-30 · suíte: verde
```

---

```yaml
id: T-03.04
titulo: Restauração do terminal na saída
objetivo: Devolver cursor e modo do terminal ao estado anterior em qualquer caminho de saída
arquivos:
  cria: [src/watch/terminal/restaurar.ts, src/watch/terminal/restaurar.test.ts]
  altera: []
teste_integracao: Registrar e disparar cada um dos quatro caminhos de saída executa a restauração uma vez
teste_funcional: Dada restauração já executada, disparar outro caminho não a executa de novo
criterio_aceite: Os quatro caminhos restauram e a restauração é idempotente
depende_de: []
paralelizavel: true
status: concluida
concluida_em: 2026-08-30 · suíte: verde
```

---

```yaml
id: T-03.05
titulo: Interpretação das opções do watch
objetivo: Interpretar trabalho_id posicional, --todos e --ajuda
arquivos:
  cria: [src/watch/opcoes.ts, src/watch/opcoes.test.ts]
  altera: []
teste_integracao: Interpreta as três formas da especificação e devolve ok para cada uma
teste_funcional: Dado --opcao-que-nao-existe, devolve erro nomeando a opção desconhecida
criterio_aceite: As três formas devolvem ok e opção desconhecida devolve erro sem lançar
depende_de: []
paralelizavel: true
status: concluida
concluida_em: 2026-08-30 · suíte: verde
```

---

```yaml
id: T-03.06
titulo: Loop do watch ligando fontes e desenho
objetivo: Ler, desenhar, observar e redesenhar, relendo o plano só quando o plano muda
arquivos:
  cria: [src/watch/watch.ts, src/watch/watch.test.ts]
  altera: []
teste_integracao: Sobre a fixture com-estado, alterar o tasks.md faz a tela mudar e alterar só o rastro não relê o plano
teste_funcional: Dado expx watch com um trabalho_id sobre a fixture varios-trabalhos, o cabeçalho desenhado é o do trabalho nomeado
criterio_aceite: Mudança no plano redesenha, mudança só no rastro não relê o plano, o id posicional seleciona o trabalho, e sem .expx sai limpo com código zero
depende_de: [T-03.02, T-03.03, T-03.04, T-03.05]
paralelizavel: false
status: concluida
concluida_em: 2026-08-30 · suíte: 5 passed, 0 failed
```

---

```yaml
id: T-03.07
titulo: Registro do subcomando no CLI
objetivo: Acrescentar watch ao roteador, à ajuda e à tabela de executores
arquivos:
  cria: []
  altera: [src/cli/subcomandos.ts, src/cli/subcomandos.test.ts, src/cli/expx.ts]
teste_integracao: interpretarSubcomando com watch devolve ok, o executor existe na tabela, e a lista exata de subcomandos passa a ter sete nomes
teste_funcional: Dado expx watch --ajuda, escreve o texto de ajuda do watch e devolve código zero
criterio_aceite: watch consta de SUBCOMANDOS, da ajuda geral e de EXECUTORES, a asserção de lista exata em subcomandos.test.ts passa a incluir watch, e a suíte do CLI fica verde
depende_de: [T-03.06]
paralelizavel: false
status: concluida
concluida_em: 2026-08-30 · suíte: verde
```

---

```yaml
id: T-03.08
titulo: Prova de somente leitura
objetivo: Provar por teste que nenhum caminho de código do watch escreve em disco
arquivos:
  cria: [src/watch/somente-leitura.test.ts]
  altera: []
teste_integracao: Espiona writeFileSync appendFileSync createWriteStream mkdirSync renameSync unlinkSync e rmSync em node:fs e node:fs/promises e afirma zero chamadas após um ciclo completo do loop
teste_funcional: Roda o watch sobre cópia de fixture e afirma que nenhum arquivo teve mtime alterado
criterio_aceite: As sete funções de escrita dos dois módulos somam zero chamadas e nenhum mtime muda após o loop
depende_de: [T-03.06, T-03.09]
paralelizavel: false
status: concluida
concluida_em: 2026-08-30 · suíte: verde
```

---

```yaml
id: T-03.09
titulo: Listagem de trabalhos e modo --todos
objetivo: Implementar a lista de trabalhos abertos e o comportamento quando não há trabalho aberto
arquivos:
  cria: [src/watch/desenho/lista.ts, src/watch/desenho/lista.test.ts]
  altera: [src/watch/watch.ts, src/watch/watch.test.ts]
teste_integracao: Sobre a fixture sem-trabalho, o watch desenha a lista de trabalhos recentes e o loop continua ativo em vez de encerrar
teste_funcional: Sobre a fixture varios-trabalhos com --todos, a lista traz nao_iniciado, bloqueado e em_andamento, e omite o concluido
criterio_aceite: Com --todos a lista traz um trabalho por linha sem árvore e exclui os concluídos, e sobre sem-trabalho o loop segue observando
depende_de: [T-03.06]
paralelizavel: false
status: concluida
concluida_em: 2026-08-30 · suíte: verde
```
