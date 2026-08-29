---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: expx-panel
titulo: Painel de operacao do metodo Expx
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-08-29
atualizado_em: 2026-08-29
concluido_em: 2026-08-29
sprints: [sprint-01, sprint-02, sprint-03, sprint-04]
caminho_critico: [F-01.1, F-02.1, F-02.2, F-02.3, F-02.4, F-02.5, F-03.1, F-03.2, F-03.3, F-04.1, F-04.4]
---

# Orquestrador — expx-panel

> Porta de entrada da execução. Escrito para quem abriu o repositório agora e não sabe nada. Só caminhos relativos; nunca o valor de um segredo.

## 1. Objetivo

Entregar `@expx/painel`, um pacote npm que o time roda com `npx expx-painel` dentro de um projeto e que abre no navegador uma visão de operação do trabalho de engenharia. O painel lê a pasta `docs/` do projeto, descobre os trabalhos gravados pelas skills `sprintx` e `runx`, e mostra o que foi planejado, o que está em execução, o que travou e o histórico do que já foi entregue. É **somente leitura**: nunca escreve nos arquivos do projeto e nunca executa comando algum.

## 2. Mapa e ordem de leitura

1. Este arquivo (`ORQUESTRADOR.md`)
2. `00-DECISOES.md` — as 32 decisões que governam o plano; **leitura obrigatória**, várias resolvem divergências entre o contrato e as skills
3. `base/00-INDICE.md` — e os 12 arquivos da base que ele lista
4. `base/00-LACUNAS.md` — as 26 lacunas da F1 e como cada uma foi fechada
5. `sprint-01/sprint.md` → `fases.md` → `tasks.md`
6. `sprint-02/`, `sprint-03/`, `sprint-04/`, na mesma ordem interna
7. `00-BLOQUEIOS.md` — bloqueios registrados durante a execução
8. `00-AUDITORIA.md` — achados MÉDIA/BAIXA que permanecem válidos

O contrato que o painel lê está em `docs/contrato/CONTRATO-expx-schema-v1.md`. Ele é a referência do formato dos arquivos, mas **não é a palavra final**: as decisões D-01 e D-02 seguem as skills contra o contrato, porque são as skills que gravam o que o painel vai ler.

## 3. Rota de execução

As quatro sprints são sequenciais entre si: cada uma depende do que a anterior entregou.

- **Sprint 01** — F-01.1 → (F-01.2 ∥ F-01.3)
  O andaime precede as fixtures; as duas fases de fixture rodam em paralelo.
- **Sprint 02** — F-02.1 → F-02.2 → F-02.3 → F-02.4 → F-02.5
  As fases são sequenciais: cada uma consome o que a anterior produziu. Dentro da F-02.5, as quatro tasks de regra de conformidade rodam em paralelo entre si, sobre o objeto do projeto já pronto pela F-02.4.
- **Sprint 03** — F-03.1 → F-03.2 → F-03.3
  Sequencial.
- **Sprint 04** — F-04.1 → (F-04.2 ∥ F-04.3) → F-04.4
  O andaime da UI precede as telas; visão global e detalhe rodam em paralelo.

**Caminho crítico:** F-01.1 → F-02.1 → F-02.2 → F-02.3 → F-02.4 → F-02.5 → F-03.1 → F-03.2 → F-03.3 → F-04.1 → F-04.4

A cadeia mais longa por `depende_de` é T-02.01 → … → T-02.11, uma corrente de 11 tasks que atravessa da declaração dos esquemas até a agregação do projeto: é o trecho mais longo do trabalho e define a duração total. As folgas do plano são F-01.2 ∥ F-01.3, as quatro tasks paralelas da F-02.5, e F-04.2 ∥ F-04.3.

## 4. Ferramentas

- **MCPs / SDKs:** nenhum além do padrão. O painel não fala com serviço externo.
- **Testes:** `npm test`
- **Lint:** NÃO EXISTE NO PROJETO
- **Typecheck:** após T-01.01, `npm run build` (tsc em modo strict). Antes disso o script não existe no projeto.
- **Segredos:** nenhum. O painel não autentica, não acessa rede externa e não lê variável de ambiente sensível. Se alguma vier a ser necessária, é sinal de que o escopo foi violado.

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

## 7. Definição de pronto global

A feature está entregue quando **todas** estas forem verdade:

1. `npm test` termina com 0 failed e `npm run build` termina sem erro de tipo.
2. `npx expx-painel --dir <projeto>` sobe o servidor em `127.0.0.1:4000` e abre o navegador; `--no-open` suprime a abertura; `--porta` e `--dir` mudam porta e pasta.
3. Rodando sobre um projeto com trabalhos de sprintx e de runx misturados, as **duas árvores** aparecem no navegador.
4. Alterar um arquivo de `docs/` com o painel aberto atualiza a tela em segundos, sem recarregar.
5. A tela de conformidade mostra **nenhuma violação falsa** sobre um projeto correto — nem `teste_regressao` cobrado de trabalho sprintx, nem arquivo de base listado como fora do schema, nem `00-DECISOES.md` rejeitado como kind desconhecido.
6. YAML inválido, enum errado, kind desconhecido ou `expx_schema` futuro vão para a tela de "fora do schema" com o motivo, e o servidor continua no ar.
7. O servidor nunca escuta em `0.0.0.0` e nenhum arquivo do projeto observado é escrito.

## 8. Como retomar uma sessão interrompida

1. Leia este arquivo inteiro.
2. Leia o `status` de cada task em cada `sprint-NN/tasks.md`.
3. Leia `00-BLOQUEIOS.md`.
4. Continue da primeira task `pendente` ou `em_andamento` cujas dependências (`depende_de`) estão todas `concluida`. Ignore as `bloqueada` até que o bloqueio registrado seja resolvido.
