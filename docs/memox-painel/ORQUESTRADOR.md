---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: memox-painel
titulo: Integracao do memox ao painel e ao CLI do Expx
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-08-29
atualizado_em: 2026-08-29
concluido_em: 2026-08-29
sprints: [sprint-01, sprint-02, sprint-03]
caminho_critico: [T-01.01, T-01.03, T-01.04, T-02.01, T-02.02, T-02.04, T-02.05, T-02.06, T-02.07, T-02.09, T-02.10]
---

# Orquestrador — memox-painel

> Porta de entrada da execução. Escrito para quem abriu o repositório agora e não sabe nada. Só caminhos relativos; nunca o valor de um segredo.

## 1. Objetivo

O memox é a camada de memória do ecossistema Expx: ele varre os artefatos do método e grava um índice em `.expx/memoria/indice.json`. Hoje esse índice só é consultado por skills, dentro de uma sessão de IA.

Esta feature faz o índice aparecer para pessoas: o painel passa a lê-lo e a mostrar, numa seção Memória, quais arquivos já regrediram, quais foram reprovados em QA e quais artefatos contêm segredo. E o CLI passa a instalar o memox por completo — skill, hooks e registro no harness — via `npx expxdev init`.

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — as 27 decisões que governam o plano (D-21 a D-27 vieram da auditoria)
3. `base/00-INDICE.md` — e os seis arquivos da base que ele lista
4. `sprint-01/sprint.md` → `fases.md` → `tasks.md`
5. `sprint-02/sprint.md` → `fases.md` → `tasks.md`
6. `sprint-03/sprint.md` → `fases.md` → `tasks.md`
7. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
8. `00-AUDITORIA.md` — achados MÉDIA/BAIXA que permanecem válidos

## 3. Rota de execução

- **Sprint 01:** F-01.1 → F-01.2 (sequencial: o tipo é validado contra a fixture)
  - F-01.1: T-01.01 → T-01.02 (sem dependência entre si, mas a fase é sequencial)
  - F-01.2: T-01.03 → T-01.04
- **Sprint 02:** F-02.1 → F-02.2 → F-02.3 (nenhuma paralela)
  - F-02.1: T-02.01 → T-02.02; T-02.03 é independente e pode entrar em qualquer ponto da fase
  - F-02.2: T-02.04 → T-02.05
  - F-02.3: T-02.06 → T-02.07 → (T-02.08, T-02.09) → T-02.10
- **Sprint 03:** F-03.1 → F-03.2 → F-03.3 (nenhuma paralela)
  - F-03.1: T-03.01 e T-03.02 são independentes entre si; T-03.03 depende de T-03.02; T-03.04 depende de T-03.03
  - F-03.2: T-03.05 → T-03.06
  - F-03.3: T-03.07 (depende de T-03.04) e T-03.08 (depende de T-03.01)

**Caminho crítico:** T-01.01 → T-01.03 → T-01.04 → T-02.01 → T-02.02 → T-02.04 → T-02.05 → T-02.06 → T-02.07 → T-02.09 → T-02.10

T-02.08 e T-02.09 são irmãs (ambas dependem de T-02.07 e ambas travam T-02.10); a cadeia lista T-02.09 por convenção, mas as duas precisam fechar antes de T-02.10.

**Nenhuma task desta feature é `paralelizavel: true`.** As fases são sequenciais por dependência real, e declarar concorrência que a fase não permite só confundiria a execução.

A sprint 03 não está no caminho crítico: ela depende do catálogo e do harness, não da tela.

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão. O painel não fala com rede: lê disco e serve em `127.0.0.1`.
- **Testes:** `npm test` (vitest, três projetos: `servidor`, `cli`, `ui`)
- **Lint:** NÃO EXISTE NO PROJETO
- **Typecheck:** `npm run typecheck`
- **Build:** `npm run build`
- **Segredos:** nenhum segredo é usado por esta feature. O painel **exibe quais artefatos o memox marcou como contaminados** (`artefatos_contaminados`), mas nunca o valor redigido — o próprio memox já o substitui por `[redigido pelo memox]` antes de gravar o índice.
- **Runtime externo:** o motor do memox exige `python3`, mas o painel **não** o invoca (D-01). Nenhuma dependência Python entra no `package.json`.

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

### Regra específica desta feature

O painel é **somente leitura** e o bind em `127.0.0.1` é inegociável (`base/02-painel-estado-e-api.md`). Nenhuma task pode acrescentar rota que escreva, nem alterar o host de escuta.

## 7. Definição de pronto global

- [ ] `npm test` termina com 0 failed nos três projetos do vitest.
- [ ] `estado.memoria` só passa a ser produzido pelo parser em T-02.04; até lá o tipo aceita `null`.
- [ ] `npm run typecheck` termina sem erro nos dois tsconfig.
- [ ] `GET /api/memoria` responde `200` com `{ memoria }`, `POST` na mesma rota responde `405`, e `GET /api/projeto` traz a chave `memoria`.
- [ ] Na fixture com índice, a seção Memória lista arquivos de risco, regressões, coincidências e artefatos contaminados.
- [ ] Na fixture sem índice, a seção Memória mostra o estado vazio com o comando que gera o índice.
- [ ] Gravar em `.expx/` não dispara recarga do painel.
- [ ] `CATALOGO` tem seis skills, com `memox` marcada como camada e apontando para `https://github.com/bittencourtthulio/MemoX`.
- [ ] Após `init` com memox: o hook existe com bit de execução, o motor existe no caminho que o hook resolve, e `settings.json` tem uma única entrada por evento mesmo após duas execuções.
- [ ] O `doctor` acusa `memox-sem-motor` quando o hook existe sem o motor.
- [ ] A memória é exportável em CSV, e a tela mostra os artefatos contaminados da fixture.
- [ ] `settings.json` continua com exatamente duas chaves quando não há hooks a registrar.
- [ ] Nenhuma ocorrência de "cinco skills" no README nem no comentário do catálogo.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
