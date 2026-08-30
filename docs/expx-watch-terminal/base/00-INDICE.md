---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: expx-watch-terminal
atualizado_em: 2026-08-30
areas:
  - arquivo: parser-de-artefatos.md
    titulo: Parser de artefatos do painel web
    lacunas: 1
  - arquivo: observador-de-arquivos.md
    titulo: Observador de arquivos
    lacunas: 2
  - arquivo: cli-e-subcomandos.md
    titulo: CLI e roteamento de subcomandos
    lacunas: 2
  - arquivo: estado-json.md
    titulo: Contrato expx-estado e o arquivo estado.json
    lacunas: 3
  - arquivo: rastro-de-eventos.md
    titulo: Contrato expx-eventos e o rastro
    lacunas: 2
  - arquivo: schema-v1-e-kinds.md
    titulo: Contrato expx-schema v1 e os kinds
    lacunas: 1
  - arquivo: bibliotecas-de-terminal.md
    titulo: Bibliotecas de interface de terminal
    lacunas: 2
  - arquivo: fixtures-e-testes.md
    titulo: Fixtures e convencoes de teste
    lacunas: 1
---

# Índice da base — expx-watch-terminal

Modo de ingestão: **INTERNO**. A feature é do próprio sistema; a base é o código existente do CLI e do painel, mais os três contratos do método.

| Arquivo | Área | Resumo |
|---|---|---|
| `parser-de-artefatos.md` | Parser de artefatos do painel web | `montarProjeto` e `lerEstado` são funções puras de sistema de arquivos, sem nenhum acoplamento a HTTP ou websocket: reaproveitáveis integralmente, sem refatoração |
| `observador-de-arquivos.md` | Observador de arquivos | `observar()` sobre chokidar, com debounce de 300 ms — mas ignora `.expx/`, justamente onde mora a fonte primária do watch |
| `cli-e-subcomandos.md` | CLI e roteamento de subcomandos | Acrescentar `watch` são três pontos: o array `SUBCOMANDOS`, o texto da ajuda e a tabela `EXECUTORES`; saída injetável é o padrão obrigatório para testabilidade |
| `estado-json.md` | Contrato `expx-estado` e o `estado.json` | Fonte única de todo o cabeçalho pedido, inclusive raio, orçamento, branch e PR — e **não existe leitor dele no repositório** |
| `rastro-de-eventos.md` | Contrato `expx-eventos` e o rastro | Schema zod e enums prontos em `evento.ts`; `validarRastro` valida mas **não devolve as linhas parseadas** — o leitor de eventos não existe |
| `schema-v1-e-kinds.md` | Contrato `expx-schema` v1 e os kinds | Todos os campos que a árvore pede já existem: `status`, `depende_de`, `paralelizavel`, `fase`, `paralela_com` |
| `bibliotecas-de-terminal.md` | Bibliotecas de interface de terminal | **Nenhuma disponível em runtime**; os três pacotes ANSI em `node_modules` são transitivos de devDependencies. Toda a camada de desenho é construção nova |
| `fixtures-e-testes.md` | Fixtures e convenções de teste | Três projetos vitest com timeouts distintos; cinco das dez fixtures pedidas não existem, e nenhuma fixture tem `estado.json` ou rastro |
