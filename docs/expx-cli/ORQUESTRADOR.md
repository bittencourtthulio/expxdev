---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: expx-cli
titulo: CLI do Expx - instalacao atualizacao e operacao do ecossistema
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-08-29
atualizado_em: 2026-08-29
concluido_em: 2026-08-29
sprints: [sprint-01, sprint-02, sprint-03, sprint-04, sprint-05]
caminho_critico: [T-01.04, T-01.05, T-01.07, T-02.01, T-02.02, T-02.03, T-03.01, T-03.02, T-03.03, T-04.01, T-04.02, T-04.03, T-04.04, T-04.05, T-04.06, T-04.07, T-05.01, T-05.02, T-05.03, T-05.04]
---

# Orquestrador — expx-cli

> Porta de entrada da execução. Escrito para quem abriu o repositório agora e não sabe nada. Só caminhos relativos; nunca o valor de um segredo.

## 1. Objetivo

Transformar este projeto — hoje o painel `@expx/painel` — no pacote `@expx/cli`, com o binário `expx`, que instala, atualiza e diagnostica o ecossistema de skills do método Expx (`sprintx`, `runx`, `legadox`, `stackx`, `mergex`) por projeto. As skills escolhidas são empacotadas como um plugin local chamado `expx`, o que dá namespace aos comandos no Claude Code (`/expx:sprintx-sprints`), e materializadas nos diretórios que o OpenCode lê. A instalação é travada por um lock commitado; a atualização é um ato explícito que reescreve esse lock e nunca sobrescreve trabalho local.

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — as 17 decisões que governam o plano
3. `base/00-INDICE.md` — e os nove arquivos da base que ele lista. **Leia obrigatoriamente `base/09-validacao-marketplace-local.md`**: ele contém o experimento que derruba duas premissas do pedido original.
4. `sprint-01/sprint.md` → `fases.md` → `tasks.md`
5. `sprint-02/`, `sprint-03/`, `sprint-04/`, `sprint-05/`, na ordem
6. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
7. `00-AUDITORIA.md` — achados MÉDIA/BAIXA que permanecem válidos

## 3. Rota de execução

As cinco sprints são **sequenciais** entre si: cada uma consome o que a anterior entregou.

- **Sprint 01** — F-01.1 ∥ F-01.2 (paralelas) → F-01.3
- **Sprint 02** — F-02.1 → F-02.2 ∥ F-02.3 (paralelas)
- **Sprint 03** — F-03.1 → F-03.2 ∥ F-03.3 (paralelas)
- **Sprint 04** — F-04.1 → F-04.2 → F-04.3 (nenhuma paralela)
- **Sprint 05** — F-05.1 → F-05.2 ∥ F-05.3 (paralelas)

Tasks paralelizáveis dentro de cada fase estão marcadas `paralelizavel: true` em `tasks.md`. Nenhuma task paralela escreve nos mesmos arquivos de outra da mesma janela — isso foi verificado na F3.

**Caminho crítico:** T-01.04 → T-01.05 → T-01.07 → T-02.01 → T-02.02 → T-02.03 → T-03.01 → T-03.02 → T-03.03 → T-04.01 → T-04.02 → T-04.03 → T-04.04 → T-04.05 → T-04.06 → T-04.07 → T-05.01 → T-05.02 → T-05.03 → T-05.04

A sprint-04 é a mais longa e inteiramente sequencial: é ela que define a duração total.

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão. O CLI usa o `git` do sistema (D-06) e o binário `claude` para instalar o plugin (D-03).
- **Testes:** `npm test`
- **Lint:** NÃO EXISTE NO PROJETO
- **Typecheck:** `npm run typecheck`
- **Build:** `npm run build`
- **Segredos:** nenhum. O CLI **nunca pede nem armazena credencial** — repositório privado usa a credencial de git já configurada na máquina (`base/07-especificacao-pedida.md`). Não existe variável de ambiente com segredo neste projeto.

## 5. Agentes

- **Implementador** — escreve primeiro os dois testes da task, vê ambos falharem, implementa até passarem.
- **Revisor de testes** — antes de aceitar o verde, responde: este teste falharia com uma implementação errada? Se não, o teste volta.
- **Auditor de aceite** — verifica de fato o `criterio_aceite` da task antes de permitir `status: concluida`.

**Agente único:** assume os três papéis em sequência dentro de cada task, nesta ordem, tratando cada papel como um portão — não avança ao papel seguinte sem fechar o anterior.

## 6. Regras de autonomia

1. Não pergunte nada; não peça autorização para nada.
2. O teste vem antes do código, sempre.
3. Task só é `concluida` com teste de integração E funcional passando e `criterio_aceite` verificado. Não existe "concluído com ressalva".
4. Dúvida nova ou pré-requisito faltando: registrar em `00-BLOQUEIOS.md` (`B-NN | task | bloqueio | o que destravaria`), marcar a task `bloqueada`, pular para a próxima paralelizável. Nunca parar e esperar.
5. Só rode em paralelo o que o plano declarou paralelizável; a execução nunca decide paralelismo.
6. Atualize `status` em `tasks.md` a cada transição; ao concluir, acrescente data e resultado da suíte.
7. Critério de saída de fase/sprint não atendido = não avança.
8. **Nunca escreva fora da raiz do projeto** e **nunca escreva uma skill** — o CLI busca e empacota, jamais edita conteúdo de skill (D-14).

## 7. Definição de pronto global

A feature está entregue quando **todas** as afirmações abaixo forem verdadeiras:

1. `expx init` num projeto limpo, com três skills e os dois harnesses, produz comandos funcionando **com** namespace no Claude Code (`/expx:...`) e **sem** namespace no OpenCode.
2. `expx update` traz versão nova de uma skill, mostrando o resumo do que mudou e pedindo confirmação antes de aplicar.
3. `expx update` detecta modificação local e **não sobrescreve**, listando os arquivos alterados.
4. `expx doctor` diagnostica corretamente um projeto propositalmente quebrado, com correção sugerida por achado.
5. `expx panel` sobe o painel num projeto **sem nada instalado**.
6. `npm test` termina com 0 failed e `npm run typecheck` passa.
7. Toda saída do `update` que aplica alguma coisa informa que o rollback é feito pelo versionador (D-10 — obrigação explícita).
8. O pacote empacota como `@expx/cli` com o binário `expx`, e o binário `expx-painel` continua funcionando.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
