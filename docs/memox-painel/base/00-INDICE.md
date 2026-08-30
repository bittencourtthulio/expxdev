---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: memox-painel
atualizado_em: 2026-08-29
areas:
  - arquivo: 01-indice-memox.md
    titulo: Indice do memox
    lacunas: 7
  - arquivo: 02-painel-estado-e-api.md
    titulo: Painel estado e API
    lacunas: 1
  - arquivo: 03-ui-telas-e-convencoes.md
    titulo: UI telas e convencoes
    lacunas: 1
  - arquivo: 04-cli-catalogo-e-instalacao.md
    titulo: CLI catalogo e instalacao
    lacunas: 2
  - arquivo: 05-hooks-do-memox.md
    titulo: Hooks do memox
    lacunas: 1
  - arquivo: 06-stack-testes-e-fixtures.md
    titulo: Stack testes e fixtures
    lacunas: 0
---

# Índice da base — memox-painel

> Base construída na F1. Modo INTERNO: as duas pontas (MemoX e painel Expx) estão em disco e foram lidas de verdade.

| Arquivo | Área | Resumo |
|---|---|---|
| `01-indice-memox.md` | Índice do memox | O artefato `.expx/memoria/indice.json`: chaves, sinais, regressões, e o fato de ele normalmente não existir (é gitignorado) |
| `02-painel-estado-e-api.md` | Painel: estado e API | Como `EstadoPainel` é montado e servido, as rotas `/api/*`, e a difusão do estado inteiro por websocket |
| `03-ui-telas-e-convencoes.md` | UI: telas e convenções | Como uma seção nova é acrescentada, os componentes compartilhados e a regra de que a UI não recalcula nada |
| `04-cli-catalogo-e-instalacao.md` | CLI: catálogo e instalação | O `CATALOGO` como fonte única, a detecção de layout, a montagem do plugin, e onde o número "cinco" está escrito |
| `05-hooks-do-memox.md` | Hooks do memox | Os dois hooks, o contrato de falha aberta, e o caminho relativo que amarra onde a skill precisa ser instalada |
| `06-stack-testes-e-fixtures.md` | Stack, testes e fixtures | Os três projetos do vitest, a nomenclatura integração/funcional, e as fixtures que vêm do parser real |
