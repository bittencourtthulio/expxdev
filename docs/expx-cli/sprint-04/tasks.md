---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: expx-cli
sprint_id: sprint-04
atualizado_em: 2026-08-29
tasks:
  - id: T-04.01
    titulo: Roteador de subcomando
    fase: F-04.1
    status: concluida
    objetivo: Interpretar o primeiro argumento como subcomando e delegar o resto
    arquivos:
      cria: [src/cli/subcomandos.ts, src/cli/subcomandos.test.ts]
      altera: []
    teste_integracao: Roteia os seis subcomandos e confirma que cada um chama o executor correspondente
    teste_funcional: Dado expx quack, devolve erro nomeando o subcomando desconhecido e codigo 1
    criterio_aceite: Os seis subcomandos sao reconhecidos e um sétimo devolve codigo 1
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-04.02
    titulo: Deteccao do projeto e da raiz
    fase: F-04.1
    status: concluida
    objetivo: Descobrir a raiz do projeto, o versionador e se ja existe .expx
    arquivos:
      cria: [src/cli/projeto.ts, src/cli/projeto.test.ts]
      altera: []
    teste_integracao: Detecta as fixtures projeto-limpo e projeto-com-expx e distingue as duas
    teste_funcional: Dado projeto-com-expx, devolve existe true e o caminho do lock
    criterio_aceite: projeto-limpo devolve existe false e projeto-com-expx devolve existe true
    depende_de: [T-04.01]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-04.03
    titulo: Regras de selecao de skills
    fase: F-04.2
    status: concluida
    objetivo: Avisar sobre camada sem base e sobre mergex sem sprintx ou runx, sem impedir
    arquivos:
      cria: [src/cli/selecao.ts, src/cli/selecao.test.ts]
      altera: []
    teste_integracao: Avalia as combinacoes de selecao e confirma quais geram aviso
    teste_funcional: Dado legadox sozinho, devolve aviso de camada sem base e permitido true
    criterio_aceite: Camada sem sprintx nem runx gera aviso e nunca bloqueia a selecao
    depende_de: [T-04.02]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-04.04
    titulo: Fluxo do init de ponta a ponta
    fase: F-04.2
    status: concluida
    objetivo: Encadear deteccao, busca, montagem, harness e lock em um comando
    arquivos:
      cria: [src/cli/init.ts, src/cli/init.test.ts]
      altera: []
    teste_integracao: Roda o init sobre projeto-limpo com duas skills de fixture e confirma a arvore criada
    teste_funcional: Dado init com sprintx e runx, o lock lista as duas e o plugin tem as duas skills
    criterio_aceite: Apos o init existem .expx com lock, marketplace e plugin com exatamente as skills pedidas
    depende_de: [T-04.03]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-04.05
    titulo: Modo nao interativo e reconfiguracao
    fase: F-04.2
    status: concluida
    objetivo: Ter equivalente por flag para toda pergunta e nunca apagar sem confirmar
    arquivos:
      cria: [src/cli/init-flags.ts, src/cli/init-flags.test.ts]
      altera: []
    teste_integracao: Roda o init sem TTY sobre projeto-com-expx e confirma que nada foi apagado
    teste_funcional: Dado --skills sprintx --harness claude --yes, o init completa sem perguntar nada
    criterio_aceite: Sem TTY e sem --yes o init nao escreve nada e explica o que faria
    depende_de: [T-04.04]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-04.06
    titulo: Subcomandos add e remove
    fase: F-04.3
    status: concluida
    objetivo: Alterar a selecao de skills remontando o plugin e reescrevendo o lock
    arquivos:
      cria: [src/cli/selecionar.ts, src/cli/selecionar.test.ts]
      altera: []
    teste_integracao: Adiciona e remove uma skill e confirma o plugin e o lock apos cada operacao
    teste_funcional: Dado add mergex num projeto com sprintx, o lock passa a listar as duas
    criterio_aceite: Apos add a skill esta no lock e no plugin e apos remove nao esta em nenhum dos dois
    depende_de: [T-04.05]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-04.07
    titulo: Subcomando panel sobre o painel existente
    fase: F-04.3
    status: concluida
    objetivo: Expor o painel atual como subcomando sem exigir instalacao
    arquivos:
      cria: [src/cli/panel.ts, src/cli/panel.test.ts]
      altera: [src/cli/principal.ts, package.json]
    teste_integracao: Roda expx panel sobre projeto-limpo e confirma que o servidor sobe e responde
    teste_funcional: Dado um projeto sem .expx, o painel sobe e a resposta HTTP tem status 200
    criterio_aceite: expx panel sobe o painel em projeto sem .expx e o bin expx-painel continua funcionando
    depende_de: [T-04.06]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
---

# Tasks — Sprint 04

---

```yaml
id: T-04.01
titulo: Roteador de subcomando
objetivo: Interpretar o primeiro argumento como subcomando e delegar o resto
arquivos:
  cria: [src/cli/subcomandos.ts, src/cli/subcomandos.test.ts]
  altera: []
teste_integracao: Roteia os seis subcomandos e confirma que cada um chama o executor correspondente
teste_funcional: Dado expx quack, devolve erro nomeando o subcomando desconhecido e código 1
criterio_aceite: Os seis subcomandos são reconhecidos e um sétimo devolve código 1
depende_de: []
paralelizavel: false
status: concluida
```

---

```yaml
id: T-04.02
titulo: Detecção do projeto e da raiz
objetivo: Descobrir a raiz do projeto, o versionador e se já existe .expx
arquivos:
  cria: [src/cli/projeto.ts, src/cli/projeto.test.ts]
  altera: []
teste_integracao: Detecta as fixtures projeto-limpo e projeto-com-expx e distingue as duas
teste_funcional: Dado projeto-com-expx, devolve existe true e o caminho do lock
criterio_aceite: projeto-limpo devolve existe false e projeto-com-expx devolve existe true
depende_de: [T-04.01]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-04.03
titulo: Regras de seleção de skills
objetivo: Avisar sobre camada sem base e sobre mergex sem sprintx ou runx, sem impedir
arquivos:
  cria: [src/cli/selecao.ts, src/cli/selecao.test.ts]
  altera: []
teste_integracao: Avalia as combinações de seleção e confirma quais geram aviso
teste_funcional: Dado legadox sozinho, devolve aviso de camada sem base e permitido true
criterio_aceite: Camada sem sprintx nem runx gera aviso e nunca bloqueia a seleção
depende_de: [T-04.02]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-04.04
titulo: Fluxo do init de ponta a ponta
objetivo: Encadear detecção, busca, montagem, harness e lock em um comando
arquivos:
  cria: [src/cli/init.ts, src/cli/init.test.ts]
  altera: []
teste_integracao: Roda o init sobre projeto-limpo com duas skills de fixture e confirma a árvore criada
teste_funcional: Dado init com sprintx e runx, o lock lista as duas e o plugin tem as duas skills
criterio_aceite: Após o init existem .expx com lock, marketplace e plugin com exatamente as skills pedidas
depende_de: [T-04.03]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-04.05
titulo: Modo não interativo e reconfiguração
objetivo: Ter equivalente por flag para toda pergunta e nunca apagar sem confirmar
arquivos:
  cria: [src/cli/init-flags.ts, src/cli/init-flags.test.ts]
  altera: []
teste_integracao: Roda o init sem TTY sobre projeto-com-expx e confirma que nada foi apagado
teste_funcional: Dado --skills sprintx --harness claude --yes, o init completa sem perguntar nada
criterio_aceite: Sem TTY e sem --yes o init não escreve nada e explica o que faria
depende_de: [T-04.04]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-04.06
titulo: Subcomandos add e remove
objetivo: Alterar a seleção de skills remontando o plugin e reescrevendo o lock
arquivos:
  cria: [src/cli/selecionar.ts, src/cli/selecionar.test.ts]
  altera: []
teste_integracao: Adiciona e remove uma skill e confirma o plugin e o lock após cada operação
teste_funcional: Dado add mergex num projeto com sprintx, o lock passa a listar as duas
criterio_aceite: Após add a skill está no lock e no plugin e após remove não está em nenhum dos dois
depende_de: [T-04.05]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-04.07
titulo: Subcomando panel sobre o painel existente
objetivo: Expor o painel atual como subcomando sem exigir instalação
arquivos:
  cria: [src/cli/panel.ts, src/cli/panel.test.ts]
  altera: [src/cli/principal.ts, package.json]
teste_integracao: Roda expx panel sobre projeto-limpo e confirma que o servidor sobe e responde
teste_funcional: Dado um projeto sem .expx, o painel sobe e a resposta HTTP tem status 200
criterio_aceite: expx panel sobe o painel em projeto sem .expx e o bin expx-painel continua funcionando
depende_de: [T-04.06]
paralelizavel: false
status: concluida
```
