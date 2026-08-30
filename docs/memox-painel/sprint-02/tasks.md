---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: memox-painel
sprint_id: sprint-02
atualizado_em: 2026-08-29
tasks:
  - id: T-02.01
    titulo: Ler o indice do disco com falha aberta
    fase: F-02.1
    status: concluida
    objetivo: Ler .expx/memoria/indice.json devolvendo null em vez de lancar
    arquivos:
      cria: [src/parser/memoria/ler.ts, src/parser/memoria/ler.test.ts]
      altera: []
    teste_integracao: Chama lerIndice nas tres fixtures e espera objeto na valida e null na corrompida e na sem indice
    teste_funcional: Dada a fixture corrompida, lerIndice devolve null sem lancar e dada a valida devolve versao 1
    criterio_aceite: lerIndice devolve null para arquivo ausente e para JSON invalido sem lancar, e o indice da fixture valida com versao 1
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.02
    titulo: Projetar o indice na forma enxuta
    fase: F-02.1
    status: concluida
    objetivo: Reduzir o indice a projecao sem por_termo e sem trabalhos, ordenando os arquivos de risco
    arquivos:
      cria: [src/parser/memoria/projetar.ts, src/parser/memoria/projetar.test.ts]
      altera: [src/parser/memoria/tipos.ts]
    teste_integracao: Projeta o indice da fixture e espera que MemoriaSchema aceite e que por_termo e trabalhos nao existam
    teste_funcional: Dado o indice da fixture, o primeiro arquivo de risco e src/frete/calculo.ts e o de tabela.ts vem depois
    criterio_aceite: A projecao passa no MemoriaSchema, nao tem por_termo nem trabalhos, e arquivos_de_risco vem ordenado com src/frete/calculo.ts em primeiro
    depende_de: [T-02.01]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.03
    titulo: Ignorar .expx no observador
    fase: F-02.1
    status: concluida
    objetivo: Impedir que a gravacao do indice dispare recarga do painel sem parar de observar docs
    arquivos:
      cria: []
      altera: [src/servidor/observador.ts, src/servidor/observador.test.ts]
    teste_integracao: Observa uma pasta temporaria e grava nos dois caminhos esperando um unico disparo
    teste_funcional: Gravar .expx/memoria/indice.json nao chama aoMudar e gravar docs/x/tasks.md chama aoMudar uma vez
    criterio_aceite: Gravar em .expx nao dispara aoMudar e gravar em docs dispara exatamente uma vez
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.04
    titulo: Acrescentar a memoria ao estado montado
    fase: F-02.2
    status: concluida
    objetivo: Fazer montarProjeto incluir a chave memoria no Projeto
    arquivos:
      cria: [src/parser/projeto/memoria.test.ts]
      altera: [src/parser/projeto/montar.ts]
    teste_integracao: Monta o projeto das tres fixtures e espera memoria preenchida na valida e null nas outras duas
    teste_funcional: Dada a fixture projeto-memoria, projeto.memoria.totais.regressoes vale 1 e em projeto-ok vale null
    criterio_aceite: montarProjeto devolve a chave memoria em toda montagem, com null quando nao ha indice ou o indice e invalido
    depende_de: [T-02.02]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.05
    titulo: Servir a memoria por rota propria
    fase: F-02.2
    status: concluida
    objetivo: Expor GET /api/memoria no padrao das demais rotas
    arquivos:
      cria: []
      altera: [src/servidor/http.ts, src/servidor/http.test.ts]
    teste_integracao: Faz GET e POST em /api/memoria esperando 200 com JSON no GET e 405 no POST
    teste_funcional: Dada a fixture projeto-memoria, o corpo do GET traz memoria.totais.regressoes igual a 1
    criterio_aceite: GET /api/memoria responde 200 com a chave memoria e POST na mesma rota responde 405
    depende_de: [T-02.04]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.06
    titulo: Icone da secao Memoria
    fase: F-02.3
    status: concluida
    objetivo: Acrescentar o icone Memoria ao conjunto existente
    arquivos:
      cria: []
      altera: [ui/src/icones.tsx]
    teste_integracao: Renderiza Icone.Memoria e espera um svg com nos de traco proprios
    teste_funcional: Dado tamanho 22, o svg tem width 22 e seu conjunto de nos difere do de Icone.Historico
    criterio_aceite: Icone.Memoria renderiza svg com o width recebido e com desenho diferente do de Icone.Historico
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.07
    titulo: Tela de Memoria
    fase: F-02.3
    status: concluida
    objetivo: Renderizar arquivos de risco, regressoes, coincidencias e artefatos contaminados
    arquivos:
      cria: [ui/src/telas/Memoria.tsx]
      altera: [ui/src/telas/telas.test.tsx, ui/src/telas/fixture.ts]
    teste_integracao: Renderiza a tela com estadoMemoriaFixture e espera os quatro cabecalhos de tabela no documento
    teste_funcional: Com estadoMemoriaFixture a tela mostra src/frete/calculo.ts na tabela de risco e o caminho docs/relatorios/2026-08-25-OC-2026-0199-integracao/tecnico.md na de contaminados
    criterio_aceite: A tela mostra as quatro secoes nomeadas e lista o arquivo de risco e o artefato contaminado da fixture
    depende_de: [T-02.06]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.08
    titulo: Estado vazio da tela de Memoria
    fase: F-02.3
    status: concluida
    objetivo: Ensinar a gerar o indice quando ele nao existe
    arquivos:
      cria: []
      altera: [ui/src/telas/Memoria.tsx, ui/src/telas/telas.test.tsx]
    teste_integracao: Renderiza a tela com estado cuja memoria e null e espera o bloco de estado vazio
    teste_funcional: Dado memoria null, a tela mostra o comando memox.py indexar e nao mostra tabela nenhuma
    criterio_aceite: Com memoria null a tela mostra o comando de indexacao e nenhuma tabela e renderizada
    depende_de: [T-02.07]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.09
    titulo: Exportacao da memoria em CSV
    fase: F-02.3
    status: concluida
    objetivo: Exportar os arquivos de risco em CSV pelo mesmo botao das demais telas
    arquivos:
      cria: []
      altera: [ui/src/telas/Memoria.tsx, ui/src/telas/telas.test.tsx]
    teste_integracao: Renderiza a tela com estadoMemoriaFixture e espera o botao de exportar presente
    teste_funcional: Com estadoMemoriaFixture, a funcao de csv devolve cabecalho separado por ponto e virgula e uma linha por arquivo de risco
    criterio_aceite: O csv comeca com o cabecalho separado por ponto e virgula e tem uma linha por arquivo de risco da fixture
    depende_de: [T-02.07]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.10
    titulo: Ligar a secao Memoria na navegacao
    fase: F-02.3
    status: concluida
    objetivo: Acrescentar Memoria a activitybar com contador de regressoes
    arquivos:
      cria: [ui/src/App.test.tsx]
      altera: [ui/src/App.tsx]
    teste_integracao: Renderiza o App com fetch e WebSocket dublados e espera o botao Memoria depois que o estado dublado chega
    teste_funcional: Com estadoMemoriaFixture servida pelo fetch dublado, a activitybar mostra o contador 1 na secao Memoria
    criterio_aceite: A secao Memoria aparece na activitybar e o contador reflete o numero de regressoes, com fetch e WebSocket dublados no teste
    depende_de: [T-02.08, T-02.09]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
---

# Tasks — Sprint 02

> Um bloco por task. Na execução (F6), a linha `status` é atualizada em cada transição.

> **Nota das rodadas 2 a 4 (pós-auditoria).** Na rodada 4: T-02.07 passou a criar `estadoMemoriaFixture()` — sem ela nenhuma tela tinha estado com memória para testar — e T-02.09/T-02.10 a nomeiam; T-02.10 declarou que a asserção é assíncrona. Na rodada 3: T-02.02 passou a declarar que altera `tipos.ts` (é ela quem fixa o formato da projeção), T-02.07 cita o caminho literal do artefato contaminado, e T-02.10 ganhou `ui/src/App.test.tsx` com os dublês de `fetch` e `WebSocket` que `usarEstado` exige em jsdom. Na rodada 2, quatro correções: o teste de T-02.03 passou a cobrir as duas metades (`.expx` não dispara, `docs` dispara); T-02.05 passou a afirmar o `405` que seu critério exigia; T-02.04 aponta para um arquivo de teste novo em vez de `montar.test.ts`, que não existe; e a antiga T-02.07 foi quebrada em três (tela, estado vazio, CSV), porque as decisões D-12 e D-20 não tinham teste que as cobrisse.

---

```yaml
id: T-02.01
titulo: Ler o índice do disco com falha aberta
objetivo: Ler .expx/memoria/indice.json devolvendo null em vez de lançar
arquivos:
  cria: [src/parser/memoria/ler.ts, src/parser/memoria/ler.test.ts]
  altera: []
teste_integracao: Chama lerIndice nas três fixtures e espera objeto na válida e null na corrompida e na sem índice
teste_funcional: Dada a fixture corrompida, lerIndice devolve null sem lançar; dada a válida, devolve versao 1
criterio_aceite: lerIndice devolve null para arquivo ausente e para JSON inválido sem lançar, e o índice da fixture válida com versao 1
depende_de: []
paralelizavel: false
status: concluida  # 2026-08-29 · suite: 271 passed, 0 failed
```

---

```yaml
id: T-02.02
titulo: Projetar o índice na forma enxuta
objetivo: Reduzir o índice à projeção sem por_termo e sem trabalhos, ordenando os arquivos de risco
arquivos:
  cria: [src/parser/memoria/projetar.ts, src/parser/memoria/projetar.test.ts]
  altera: [src/parser/memoria/tipos.ts]
teste_integracao: Projeta o índice da fixture e espera que MemoriaSchema aceite e que por_termo e trabalhos não existam
teste_funcional: Dado o índice da fixture, o primeiro arquivo de risco é src/frete/calculo.ts e o de tabela.ts vem depois
criterio_aceite: A projeção passa no MemoriaSchema, não tem por_termo nem trabalhos, e arquivos_de_risco vem ordenado com src/frete/calculo.ts em primeiro
depende_de: [T-02.01]
paralelizavel: false
status: concluida  # 2026-08-29 · suite: 271 passed, 0 failed
```

Ordenação por regressões, depois reprovações de QA, depois número de trabalhos (D-10).

`tipos.ts` entra no `altera` porque esta task define o formato real da projeção: se ele divergir do schema escrito em T-01.03, o schema acompanha aqui.

---

```yaml
id: T-02.03
titulo: Ignorar .expx no observador
objetivo: Impedir que a gravação do índice dispare recarga do painel sem parar de observar docs
arquivos:
  cria: []
  altera: [src/servidor/observador.ts, src/servidor/observador.test.ts]
teste_integracao: Observa uma pasta temporária e grava nos dois caminhos esperando um único disparo
teste_funcional: Gravar .expx/memoria/indice.json não chama aoMudar; gravar docs/x/tasks.md chama aoMudar uma vez
criterio_aceite: Gravar em .expx não dispara aoMudar e gravar em docs dispara exatamente uma vez
depende_de: []
paralelizavel: false
status: concluida  # 2026-08-29 · suite: 271 passed, 0 failed
```

As duas metades são obrigatórias: um regex quebrado que ignorasse tudo passaria num teste que só cobrisse `.expx`.

---

```yaml
id: T-02.04
titulo: Acrescentar a memória ao estado montado
objetivo: Fazer montarProjeto incluir a chave memoria no Projeto
arquivos:
  cria: [src/parser/projeto/memoria.test.ts]
  altera: [src/parser/projeto/montar.ts]
teste_integracao: Monta o projeto das três fixtures e espera memoria preenchida na válida e null nas outras duas
teste_funcional: Dada a fixture projeto-memoria, projeto.memoria.totais.regressoes vale 1; em projeto-ok vale null
criterio_aceite: montarProjeto devolve a chave memoria em toda montagem, com null quando não há índice ou o índice é inválido
depende_de: [T-02.02]
paralelizavel: false
status: concluida  # 2026-08-29 · suite: 271 passed, 0 failed
```

---

```yaml
id: T-02.05
titulo: Servir a memória por rota própria
objetivo: Expor GET /api/memoria no padrão das demais rotas
arquivos:
  cria: []
  altera: [src/servidor/http.ts, src/servidor/http.test.ts]
teste_integracao: Faz GET e POST em /api/memoria esperando 200 com JSON no GET e 405 no POST
teste_funcional: Dada a fixture projeto-memoria, o corpo do GET traz memoria.totais.regressoes igual a 1
criterio_aceite: GET /api/memoria responde 200 com a chave memoria e POST na mesma rota responde 405
depende_de: [T-02.04]
paralelizavel: false
status: concluida  # 2026-08-29 · suite: 271 passed, 0 failed
```

---

```yaml
id: T-02.06
titulo: Ícone da seção Memória
objetivo: Acrescentar o ícone Memoria ao conjunto existente
arquivos:
  cria: []
  altera: [ui/src/icones.tsx]
teste_integracao: Renderiza Icone.Memoria e espera um svg com nós de traço próprios
teste_funcional: Dado tamanho 22, o svg tem width 22 e seu conjunto de nós difere do de Icone.Historico
criterio_aceite: Icone.Memoria renderiza svg com o width recebido e com desenho diferente do de Icone.Historico
depende_de: []
paralelizavel: false
status: concluida  # 2026-08-29 · suite: 280 passed, 0 failed
```

---

```yaml
id: T-02.07
titulo: Tela de Memória
objetivo: Renderizar arquivos de risco, regressões, coincidências e artefatos contaminados
arquivos:
  cria: [ui/src/telas/Memoria.tsx]
  altera: [ui/src/telas/telas.test.tsx, ui/src/telas/fixture.ts]
teste_integracao: Renderiza a tela com estadoMemoriaFixture e espera os quatro cabeçalhos de tabela no documento
teste_funcional: Com estadoMemoriaFixture a tela mostra src/frete/calculo.ts na tabela de risco e o caminho docs/relatorios/2026-08-25-OC-2026-0199-integracao/tecnico.md na de contaminados
criterio_aceite: A tela mostra as quatro seções nomeadas e lista o arquivo de risco e o artefato contaminado da fixture
depende_de: [T-02.06]
paralelizavel: false
status: concluida  # 2026-08-29 · suite: 280 passed, 0 failed
```

As quatro seções: arquivos de risco, regressões, coincidências de arquivo, artefatos contaminados (D-11, D-12).

Esta task cria `estadoMemoriaFixture()` em `ui/src/telas/fixture.ts`, no mesmo formato das duas existentes:
`lerEstado({ raiz: "fixtures/projeto-memoria", diasBloqueio: 7 }, new Date("2026-08-29T12:00:00Z"))`.
Sem ela não há estado com memória no projeto `ui` do vitest — `estadoFixture()` lê `projeto-ok`, que por D-19 não tem índice. T-02.09 e T-02.10 usam a mesma fixture.

---

```yaml
id: T-02.08
titulo: Estado vazio da tela de Memória
objetivo: Ensinar a gerar o índice quando ele não existe
arquivos:
  cria: []
  altera: [ui/src/telas/Memoria.tsx, ui/src/telas/telas.test.tsx]
teste_integracao: Renderiza a tela com estado cuja memoria é null e espera o bloco de estado vazio
teste_funcional: Dado memoria null, a tela mostra o comando memox.py indexar e não mostra tabela nenhuma
criterio_aceite: Com memoria null a tela mostra o comando de indexação e nenhuma tabela é renderizada
depende_de: [T-02.07]
paralelizavel: false
status: concluida  # 2026-08-29 · suite: 280 passed, 0 failed
```

Índice ausente é o caso mais comum num clone, porque é gitignorado (D-02).

---

```yaml
id: T-02.09
titulo: Exportação da memória em CSV
objetivo: Exportar os arquivos de risco em CSV pelo mesmo botão das demais telas
arquivos:
  cria: []
  altera: [ui/src/telas/Memoria.tsx, ui/src/telas/telas.test.tsx]
teste_integracao: Renderiza a tela com estadoMemoriaFixture e espera o botão de exportar presente
teste_funcional: Com estadoMemoriaFixture, a função de csv devolve cabeçalho separado por ponto e vírgula e uma linha por arquivo de risco
criterio_aceite: O csv começa com o cabeçalho separado por ponto e vírgula e tem uma linha por arquivo de risco da fixture
depende_de: [T-02.07]
paralelizavel: false
status: concluida  # 2026-08-29 · suite: 280 passed, 0 failed
```

Mesmo `BotaoBaixar` e mesmo escape de `Conformidade.tsx` (D-20).

---

```yaml
id: T-02.10
titulo: Ligar a seção Memória na navegação
objetivo: Acrescentar Memória à activitybar com contador de regressões
arquivos:
  cria: [ui/src/App.test.tsx]
  altera: [ui/src/App.tsx]
teste_integracao: Renderiza o App com fetch e WebSocket dublados e espera o botão Memória depois que o estado dublado chega
teste_funcional: Com estadoMemoriaFixture servida pelo fetch dublado, a activitybar mostra o contador 1 na seção Memória
criterio_aceite: A seção Memória aparece na activitybar e o contador reflete o número de regressões, com fetch e WebSocket dublados no teste
depende_de: [T-02.08, T-02.09]
paralelizavel: false
status: concluida  # 2026-08-29 · suite: 280 passed, 0 failed
```

Nenhum teste do repositório renderiza o `App` hoje: `usarEstado` faz `fetch("/api/projeto")` e abre um `WebSocket` (`ui/src/estado/cliente.ts`), então os dois precisam de dublê em jsdom. A asserção é **assíncrona**: até o `fetch` dublado resolver, o `App` renderiza "carregando…" e nenhum botão de seção existe.
