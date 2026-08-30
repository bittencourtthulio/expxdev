---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: expx-watch-terminal
titulo: expx watch - painel de acompanhamento no terminal
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-08-30
atualizado_em: 2026-08-30
concluido_em: 2026-08-30
sprints: [sprint-01, sprint-02, sprint-03]
caminho_critico: [T-01.01, T-01.04, T-01.05, T-02.03, T-02.04, T-02.05, T-02.09, T-03.06, T-03.07]
---

# Orquestrador — expx-watch-terminal

> Porta de entrada da execução. Escrito para quem abriu o repositório agora e não sabe nada. Só caminhos relativos; nunca o valor de um segredo.

## 1. Objetivo

Acrescentar `expx watch` ao CLI: um painel de acompanhamento em texto, ao vivo, para quem executa o Claude Code num painel do terminal e quer ver o progresso no outro, sem trocar de janela. Mostra cabeçalho, bloqueios, árvore do trabalho, eventos recentes e rodapé, redesenhando quando os arquivos mudam. É somente leitura, sem exceção, e não faz rede.

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — as 21 decisões que governam o plano. **Leia antes de tudo:** D-05 a D-21 foram tomadas pela skill sob autorização explícita do usuário, não são respostas de entrevista.
3. `base/00-INDICE.md` — e os oito arquivos da base que ele lista
4. `sprint-01/sprint.md` → `fases.md` → `tasks.md`
5. `sprint-02/` e `sprint-03/`, na mesma ordem interna
6. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
7. `00-AUDITORIA.md` — o histórico das rodadas de auditoria e os achados MÉDIA/BAIXA que permanecem válidos

Leitura mínima antes da primeira linha de código: este arquivo, `00-DECISOES.md`, e `base/parser-de-artefatos.md` (que prova que o parser é reaproveitável inteiro e não deve ser reescrito).

## 3. Rota de execução

- **Sprint 01** — F-01.1 → (F-01.2 ∥ F-01.3)
  F-01.1 vem sozinha primeiro: as duas fases seguintes consomem as fixtures que ela cria.
- **Sprint 02** — (F-02.1 ∥ F-02.2) → F-02.3
  F-02.3 consome as duas anteriores.
- **Sprint 03** — (F-03.1 ∥ F-03.2) → F-03.3
  F-03.3 consome as duas anteriores.

Dentro das fases, são paralelizáveis: T-01.01/02/03; T-01.06; T-02.01/02/03; T-02.05/06/07/08; T-03.01; T-03.03/04/05; T-03.08/09.

**Caminho crítico:** T-01.01 → T-01.04 → T-01.05 → T-02.03 → T-02.04 → T-02.05 → T-02.09 → T-03.06 → T-03.07

A cadeia mais longa por `depende_de` puro tem sete tasks: `T-01.01 → T-01.04 → T-01.05 → T-02.03 → T-02.04 → T-02.05 → T-02.09`. Ela agora atravessa a fronteira da sprint-01 para a sprint-02, o que não acontecia na rodada 1 da auditoria (achado MÉDIA): T-02.03 passou a declarar `depende_de: [T-01.01, T-01.05]` e T-02.04 a declarar `T-01.07`, então o procedimento de retomada do §8, que é `depende_de`-driven, não pode mais iniciar a sprint-02 com a fundação incompleta.

Os dois últimos elos — `T-02.09 → T-03.06 → T-03.07` — **não são dependências declaradas**, e sim o portão de sprint da regra 7: T-03.06 não pode fechar sem o desenho pronto, mas nenhuma linha de `depende_de` o afirma, porque T-03.06 depende de F-03.1 e F-03.2, não de T-02.09. Estão no caminho porque o critério de saída da sprint-02 precede a sprint-03. T-03.08 e T-03.09 ficam fora: são paralelizáveis com T-03.07.

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão. A feature não faz rede (especificação) e não usa modelo.
- **Testes:** `npm test`
- **Lint:** NÃO EXISTE NO PROJETO — não há script de lint em `package.json`.
- **Typecheck:** `npm run typecheck`
- **Build:** `npm run build`
- **Segredos:** nenhum. O watch não lê variável de ambiente além de `NO_COLOR` (D-10), que não é segredo.

Onde os testes novos caem: `src/watch/**/*.test.ts` roda no projeto vitest `servidor` (timeout 20 s); os testes que alteram `src/cli/**` rodam no projeto `cli` (timeout 120 s). Ver `vitest.config.ts` e `base/fixtures-e-testes.md`.

## 5. Agentes

- **Implementador** — escreve primeiro os dois testes da task, vê ambos falharem, implementa até passarem.
- **Revisor de testes** — antes de aceitar o verde, responde: este teste falharia com uma implementação errada? Se não, o teste volta.
- **Auditor de aceite** — verifica de fato o `criterio_aceite` da task antes de permitir `status: concluida`.

**Agente único:** assume os três papéis em sequência dentro de cada task, nesta ordem, tratando cada papel como um portão — não avança ao papel seguinte sem fechar o anterior.

Atenção específica desta feature: em T-03.08 (prova de somente leitura) o papel de revisor de testes é o que mais importa. Um teste que só compare mtime passa com implementação errada se o watch escrever e reescrever o mesmo conteúdo; o teste precisa também interceptar as funções de escrita.

## 6. Regras de autonomia

1. Não pergunte nada; não peça autorização para nada.
2. O teste vem antes do código, sempre.
3. Task só é `concluida` com teste de integração E funcional passando e `criterio_aceite` verificado. Não existe "concluído com ressalva".
4. Dúvida nova ou pré-requisito faltando: registrar em `00-BLOQUEIOS.md` (`B-NN | task | bloqueio | o que destravaria`), marcar a task `bloqueada`, pular para a próxima paralelizável. Nunca parar e esperar.
5. Só rode em paralelo o que o plano declarou paralelizável; a execução nunca decide paralelismo.
6. Atualize `status` em `tasks.md` a cada transição; ao concluir, acrescente data e resultado da suíte.
7. Critério de saída de fase/sprint não atendido = não avança.
8. **Específica desta feature:** nenhum arquivo de `src/parser/` e `src/servidor/` é reescrito. D-02 reaproveita `montarProjeto` e `lerEstado` como estão; D-06 proíbe mexer no observador do painel. As únicas alterações fora de `src/watch/` e `fixtures/` são as três de T-03.07: `src/cli/subcomandos.ts`, `src/cli/subcomandos.test.ts` e `src/cli/expx.ts`.

   O teste é alterado de propósito e a auditoria (rodada 1, achado ALTA) exigiu que constasse aqui: `src/cli/subcomandos.test.ts:6` afirma a lista exata de subcomandos (`expect([...SUBCOMANDOS]).toEqual([...seis nomes])`). Acrescentar `watch` reprova essa asserção. Atualizá-la para os sete nomes é parte da task, não uma violação da regra — o que a regra proíbe é reescrever o parser e o observador.

## 7. Definição de pronto global

A feature está entregue quando todas forem verdade:

1. `npm test` termina com 0 failed e `npm run typecheck` passa.
2. Rodar o watch num painel e o Claude Code no outro, executando um trabalho real, mostra as tasks mudando de status ao vivo.
3. Abrir um bloqueio faz a seção de bloqueios subir para o topo.
4. Rodar num projeto sem `.expx/` dá mensagem clara e saída limpa, com código zero.
5. Corromper o `estado.json` mantém o watch funcionando pela leitura direta do plano.
6. Sair com a tecla de interrupção devolve o terminal ao estado anterior.
7. O teste de somente leitura (T-03.08) passa: nenhum caminho de código do watch escreve em disco.
8. As nove fixtures de disco existem em `fixtures/watch/` conforme a tabela nominal de `sprint-01/sprint.md`; a oitava é reaproveitada de `fixtures/projeto-ruim/` e as duas restantes são modos de teste (largura 60 e cor desligada), não diretórios.
9. Nenhuma linha desenhada excede a largura pedida, em 80 e em 60 colunas.
10. Com a saída redirecionada para arquivo, nenhum escape ANSI aparece no arquivo.

Os itens 2, 3, 4, 5 e 6 são a definição de pronto do usuário, registrada na abertura da feature. Os itens 2 e 6 são verificação manual: `base/fixtures-e-testes.md` (risco 4) registra que o projeto não tem convenção para automatizá-los, e D-11 mitiga isolando o desenho numa função pura testável sem TTY.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
