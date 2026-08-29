---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: expx-panel
sprint_id: sprint-03
atualizado_em: 2026-08-29
tasks:
  - id: T-03.01
    titulo: Servidor HTTP em loopback
    fase: F-03.1
    status: concluida
    objetivo: Subir um servidor HTTP que escuta exclusivamente em 127.0.0.1
    arquivos:
      cria: [src/servidor/http.ts, src/servidor/http.test.ts]
      altera: []
    teste_integracao: Sobe o servidor e espera que o endereco de escuta seja 127.0.0.1
    teste_funcional: Dado o servidor no ar, GET numa rota inexistente devolve 404
    criterio_aceite: O endereco de escuta e 127.0.0.1 e nao existe opcao de mudar para 0.0.0.0
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-03.02
    titulo: Rotas de leitura do projeto
    fase: F-03.1
    status: concluida
    objetivo: Servir o objeto do projeto e suas listas derivadas em JSON
    arquivos:
      cria: [src/servidor/api.ts, src/servidor/api.test.ts]
      altera: [src/servidor/http.ts]
    teste_integracao: Sobe o servidor sobre a fixture e espera 200 em GET /api/projeto
    teste_funcional: Dado GET /api/projeto sobre projeto-ok, o corpo traz dois trabalhos
    criterio_aceite: As rotas de projeto conformidade rejeicoes e historico devolvem 200 com JSON
    depende_de: [T-03.01]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-03.03
    titulo: Observador de arquivos com debounce
    fase: F-03.2
    status: concluida
    objetivo: Observar a pasta de docs e disparar uma releitura agrupada por debounce
    arquivos:
      cria: [src/servidor/observador.ts, src/servidor/observador.test.ts]
      altera: []
    teste_integracao: Altera um arquivo da fixture e espera exatamente uma releitura disparada
    teste_funcional: Dadas tres alteracoes em cem milissegundos, o observador dispara uma unica vez
    criterio_aceite: O debounce agrupa alteracoes proximas em um unico disparo
    depende_de: [T-03.02]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-03.04
    titulo: Difusao do estado por websocket
    fase: F-03.2
    status: concluida
    objetivo: Empurrar o estado novo a todos os clientes conectados a cada releitura
    arquivos:
      cria: [src/servidor/websocket.ts, src/servidor/websocket.test.ts]
      altera: [src/servidor/http.ts]
    teste_integracao: Conecta um cliente altera um arquivo e espera receber o estado novo
    teste_funcional: Dado um cliente conectado, a mensagem recebida contem o projeto inteiro
    criterio_aceite: O cliente recebe o estado novo em menos de dois segundos apos a alteracao
    depende_de: [T-03.03]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-03.05
    titulo: Contrato de linha de comando
    fase: F-03.3
    status: concluida
    objetivo: Interpretar as flags de porta diretorio e abertura do navegador
    arquivos:
      cria: [src/cli/argumentos.ts, src/cli/argumentos.test.ts]
      altera: []
    teste_integracao: Interpreta uma linha de comando completa e espera os tres valores corretos
    teste_funcional: Dada uma linha sem flags, a porta e 4000 e o diretorio e ./docs
    criterio_aceite: As flags porta dir e no-open sao lidas e os padroes valem quando ausentes
    depende_de: [T-03.04]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-03.06
    titulo: Binario do painel
    fase: F-03.3
    status: concluida
    objetivo: Ligar a linha de comando ao servidor e abrir o navegador quando pedido
    arquivos:
      cria: [src/cli/principal.ts, src/cli/principal.test.ts]
      altera: [package.json]
    teste_integracao: Executa o binario com no-open sobre a fixture e espera o servidor no ar
    teste_funcional: Dada a flag no-open, nenhuma tentativa de abrir navegador acontece
    criterio_aceite: O binario expx-painel sobe o servidor e respeita a flag no-open
    depende_de: [T-03.05]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
---

# Tasks — Sprint 03

---

```yaml
id: T-03.01
titulo: Servidor HTTP em loopback
objetivo: Subir um servidor HTTP que escuta exclusivamente em 127.0.0.1
arquivos:
  cria: [src/servidor/http.ts, src/servidor/http.test.ts]
  altera: []
teste_integracao: Sobe o servidor e espera que o endereço de escuta seja 127.0.0.1
teste_funcional: Dado o servidor no ar, GET numa rota inexistente devolve 404
criterio_aceite: O endereço de escuta é 127.0.0.1 e não existe opção de mudar para 0.0.0.0
depende_de: []
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 63 passed (63)
```

---

```yaml
id: T-03.02
titulo: Rotas de leitura do projeto
objetivo: Servir o objeto do projeto e suas listas derivadas em JSON
arquivos:
  cria: [src/servidor/api.ts, src/servidor/api.test.ts]
  altera: [src/servidor/http.ts]
teste_integracao: Sobe o servidor sobre a fixture e espera 200 em `GET /api/projeto`
teste_funcional: Dado `GET /api/projeto` sobre `projeto-ok`, o corpo traz dois trabalhos
criterio_aceite: As rotas de projeto, conformidade, rejeições e histórico devolvem 200 com JSON
depende_de: [T-03.01]
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 63 passed (63)
```

---

```yaml
id: T-03.03
titulo: Observador de arquivos com debounce
objetivo: Observar a pasta de docs e disparar uma releitura agrupada por debounce
arquivos:
  cria: [src/servidor/observador.ts, src/servidor/observador.test.ts]
  altera: []
teste_integracao: Altera um arquivo da fixture e espera exatamente uma releitura disparada
teste_funcional: Dadas três alterações em 100ms, o observador dispara uma única vez
criterio_aceite: O debounce agrupa alterações próximas em um único disparo
depende_de: [T-03.02]
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 67 passed (67)
```

---

```yaml
id: T-03.04
titulo: Difusão do estado por websocket
objetivo: Empurrar o estado novo a todos os clientes conectados a cada releitura
arquivos:
  cria: [src/servidor/websocket.ts, src/servidor/websocket.test.ts]
  altera: [src/servidor/http.ts]
teste_integracao: Conecta um cliente, altera um arquivo e espera receber o estado novo
teste_funcional: Dado um cliente conectado, a mensagem recebida contém o projeto inteiro
criterio_aceite: O cliente recebe o estado novo em menos de dois segundos após a alteração
depende_de: [T-03.03]
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 67 passed (67)
```

---

```yaml
id: T-03.05
titulo: Contrato de linha de comando
objetivo: Interpretar as flags de porta, diretório e abertura do navegador
arquivos:
  cria: [src/cli/argumentos.ts, src/cli/argumentos.test.ts]
  altera: []
teste_integracao: Interpreta uma linha de comando completa e espera os três valores corretos
teste_funcional: Dada uma linha sem flags, a porta é 4000 e o diretório é `./docs`
criterio_aceite: As flags `--porta`, `--dir` e `--no-open` são lidas e os padrões valem quando ausentes
depende_de: [T-03.04]
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 71 passed (71)
```

---

```yaml
id: T-03.06
titulo: Binário do painel
objetivo: Ligar a linha de comando ao servidor e abrir o navegador quando pedido
arquivos:
  cria: [src/cli/principal.ts, src/cli/principal.test.ts]
  altera: [package.json]
teste_integracao: Executa o binário com `--no-open` sobre a fixture e espera o servidor no ar
teste_funcional: Dada a flag `--no-open`, nenhuma tentativa de abrir navegador acontece
criterio_aceite: O binário `expx-painel` sobe o servidor e respeita a flag `--no-open`
depende_de: [T-03.05]
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 75 passed (75)
```
