# E2 — PLANO

Você está no E2. Seu objetivo é converter a base e a investigação numa árvore de execução — sprints → fases → tasks — e escrever o `ORQUESTRADOR.md`. Neste estágio você não escreve código de implementação.

## Pré-requisitos verificáveis

- `docs/manutencao/<OC-ID>-<slug>/01-CAUSA-RAIZ.md` existe.
- O arquivo **não** contém `STATUS: NÃO COMPROVADO`. Se contiver, PARE: o E2 está bloqueado. Anuncie o que falta para comprovar a causa e volte ao E1.
- **Nenhuma lacuna bloqueante** em `base/00-LACUNAS.md`. Se houver, PARE: liste as bloqueantes, diga o que cada uma trava, e pergunte só o necessário para resolvê-las.
- Se `01-CAUSA-RAIZ.md` não existe, o E1 não aconteceu: diga "Falta o E1 (investigação). Vou executá-lo primeiro." e execute `references/01-investigacao.md`.

Se este é um retorno do E4 (QA reprovado), leia `QA.md` antes de replanejar: cada achado ALTA deve ser endereçado.

## Passo 1 — Dimensionar antes de desenhar

Antes de escrever qualquer arquivo, decida o tamanho pela regra de proporcionalidade do SKILL.md. A estrutura é sempre a mesma; o tamanho é proporcional à ocorrência.

**Quantas sprints?** Uma, por padrão. Crie uma segunda sprint **apenas quando existir um portão real entre blocos entregáveis** — algo que precisa estar em produção, ou irreversivelmente aplicado, antes que o bloco seguinte possa sequer ser testado. Exemplo de portão real: uma migração de banco que precisa subir antes da mudança de tela que lê a coluna nova. "São dois assuntos diferentes" não é portão; isso é duas fases.

**Quantas fases?** Uma fase por bloco de trabalho que compartilha o mesmo critério de saída. Mais fases conforme a ocorrência cresce.

**Quantas tasks?** Pela regra de granularidade: se `teste_integracao` e `teste_funcional` de uma task não cabem em uma frase cada, a task está grande demais — quebre.

### Exemplo A — correção de uma linha

Um operador de comparação errado numa condição, causa comprovada por teste que falha.

```
sprint-01  (única)
  F-01.1   (única)
    T-01.01  teste de regressão que reproduz o problema e hoje falha
    T-01.02  a correção, com teste de integração e teste funcional
```

**1 sprint, 1 fase, 2 tasks** — e as duas tasks trazem TODOS os campos do contrato preenchidos: `id`, `titulo`, `objetivo`, `arquivos`, `teste_integracao`, `teste_funcional`, `criterio_aceite`, `depende_de`, `paralelizavel`, `status` (mais `teste_regressao` na T-01.01). Nenhum campo é omitido por a ocorrência ser pequena. Nenhuma fase é inventada para o plano parecer robusto.

### Exemplo B — ocorrência grande

Regra de cálculo alterada, com coluna nova no banco, recálculo de histórico e ajuste em duas telas e um relatório.

```
sprint-01  aplicar a mudança de dados e da regra
  F-01.1   fixar o comportamento: teste de regressão + testes da regra atual
  F-01.2   migração da coluna nova            (depende de F-01.1)
  F-01.3   nova regra de cálculo              (depende de F-01.2)
sprint-02  consumir a regra nova na interface   (portão: a migração precisa estar aplicada)
  F-02.1   tela A          ∥  F-02.2  tela B    (paralelas: arquivos disjuntos)
  F-02.3   relatório                            (depende de F-02.1 e F-02.2)
```

Cresceu em **fases**; a segunda sprint existe porque há um portão real de migração, não porque o assunto é grande. Se a migração não existisse, isso seria uma sprint só com cinco fases.

## Passo 2 — Regras estruturais obrigatórias

- **A primeira task da primeira fase é sempre o teste** que reproduz o problema (bug) ou que fixa o comportamento esperado (demais tipos). Ela vem **antes de qualquer implementação** e carrega o campo `teste_regressao`.
- **Todo número que aparecer no plano vem da base.** Se não existir lá, marque `LACUNA` no plano e avise o usuário — não invente o número.
- **Nenhuma task pode depender de decisão humana em execução.** Se ao planejar aparecer uma, ela vira decisão registrada em `01-CAUSA-RAIZ.md` como nova linha `D-NN` e a skill **pergunta na hora**, antes de seguir o plano. Esta é a única pergunta permitida neste estágio.
- **O plano declara explicitamente o que está FORA de escopo** — em `sprint.md`, uma lista nominal do que foi percebido e não será tocado. Escopo travado é a regra 8 do SKILL.md.
- **Paralelismo declarado:** para CADA task, declare `paralelizavel` e `depende_de`; para CADA fase, declare com qual outra fase pode rodar em paralelo (ou "nenhuma"). A execução nunca decidirá isso — se você não declarar, é sequencial.

## Passo 3 — Escolher o formato do plano

Dimensionado o tamanho, escolha em qual formato gravá-lo. **A escolha é mecânica, não é juízo:**

| Situação | Formato | Arquivos gravados |
|---|---|---|
| **1 sprint e 1 fase** | **condensado** | `sprint-01/tasks.md` (um arquivo, `kind: plano`) |
| mais de uma sprint, ou mais de uma fase | três arquivos | `sprint-NN/sprint.md`, `fases.md`, `tasks.md` |

O condensado existe porque o andaime — três cabeçalhos de frontmatter, três títulos, três
arquivos a abrir — custa quase o mesmo numa ocorrência de duas tasks e numa de nove, e a
ocorrência de duas tasks é a maioria. Ele **não remove nenhum campo**: todos os contratos
continuam inteiros, e a regra de proporcionalidade continua valendo — proibido enxugar
campo para parecer ágil.

Três pontos que não mudam, e que são a razão de o arquivo condensado se chamar `tasks.md`:

- **O nome do arquivo é `sprint-NN/tasks.md`, sempre.** Os hooks de método procuram esse
  caminho literal. Um nome novo os desligaria — e como hook de método falha aberto, nada
  avisaria; o portão simplesmente deixaria de existir.
- **Um único bloco YAML.** Os leitores de frontmatter param no primeiro `---` de
  fechamento. Um segundo bloco no mesmo arquivo seria invisível para eles.
- **`tasks:` é uma das chaves desse bloco**, com exatamente o mesmo formato do `kind: tasks`.

O formato de três arquivos **continua válido e não é descontinuado**. Plano já escrito nele
permanece como está — a regra 12 proíbe apagar ou mover o que já existe. Se uma ocorrência
crescer de uma fase para duas durante o E2, grave-a nos três arquivos.

## Passo 4 — Escrever os arquivos do plano

**Frontmatter:** os três arquivos são gravados com `kind: sprint`, `kind: fases` e `kind: tasks`, no formato de `references/00-schema.md` — leia-o antes de gravar. No `kind: tasks`, os campos da lista `tasks:` são exatamente os do Contrato da Task do SKILL.md, mais `fase`, `concluida_em` e `suite`; `arquivos` mantém a forma `cria`/`altera`. Toda task nasce com `status: pendente`, `concluida_em: null` e `suite: nao_executada`, e já com `teste_integracao` e `teste_funcional` preenchidos e não vazios.

**No formato condensado** (1 sprint e 1 fase), crie um arquivo só:
`docs/manutencao/<OC-ID>-<slug>/sprint-01/tasks.md`, de `assets/TEMPLATE-plano-condensado.md`,
com `kind: plano`. Ele carrega o objetivo e o critério de saída da sprint, o **fora de
escopo**, a fase com seu critério de saída e paralelismo, e todas as tasks com todos os
campos do contrato — o mesmo conteúdo dos três arquivos, sem os cabeçalhos repetidos.

**No formato de três arquivos** (mais de uma sprint ou mais de uma fase), para cada sprint N
crie `docs/manutencao/<OC-ID>-<slug>/sprint-NN/` com três arquivos, usando os templates
(caminhos relativos à raiz da skill):

- `sprint.md` — de `assets/TEMPLATE-sprint.md`: objetivo, fases, critério de saída, riscos conhecidos, **fora de escopo**.
- `fases.md` — de `assets/TEMPLATE-fases.md`: por fase, objetivo, tasks que a compõem, critério de saída, com qual outra fase pode rodar em paralelo.
- `tasks.md` — de `assets/TEMPLATE-tasks.md`: um bloco por task com TODOS os campos do contrato.

Convenções:

- `id` no formato `T-NN.MM` (NN = sprint, MM = sequencial dentro da sprint).
- `status` inicial de toda task: `pendente`.
- `criterio_aceite` é verificável, binário e sem adjetivo. "Pedido de 60kg retorna frete 87,40" serve; "cálculo funciona corretamente" não serve.
- Para `melhoria-ui` e `melhoria-ux`, o `criterio_aceite` vem do critério visual/de fluxo definido no `01-CAUSA-RAIZ.md`, expresso como condição observável e binária, com a condição de observação declarada (viewport, estado, papel de usuário). "Botão Salvar visível sem rolagem em viewport 375x667 com o formulário preenchido" serve; "botão bem posicionado" não serve.
- `arquivos` lista caminhos relativos à raiz do repositório, separados em `cria:` e `altera:`, e **não pode conter arquivo fora da lista de impactados do `01-CAUSA-RAIZ.md`**.
- Nada no plano pode contradizer a base sem uma decisão `D-NN` que justifique.

### O grafo de tasks dentro de `fases.md`

Com as tasks escritas, gere o **bloco Mermaid do grafo de tasks**: no formato de três arquivos, dentro de `sprint-NN/fases.md`; no formato condensado, dentro do próprio `sprint-NN/tasks.md`, na seção da fase. Nos dois casos, abaixo do frontmatter e antes da prosa das tasks. As regras de geração, o formato exato e os exemplos correto e incorreto estão em `references/07-diagrama.md` — leia-o antes de escrever o bloco.

O plano já declara paralelismo e dependência em `depende_de` e `paralelizavel`, mas os declara em texto. O bloco converte esse texto em imagem, que VS Code e GitHub renderizam sozinhos — e é assim que quem revisa o pull request e quem faz o QA, que não participaram do planejamento, enxergam em segundos o que muda e em que ordem.

Em uma linha: cada task vira um nó com id e título curto, cada `depende_de` vira uma aresta, cada fase vira um `subgraph`, o caminho crítico vai na classe `critico`, o status vai por cor, e **a task do teste de regressão é marcada de forma distinta** — ela é a primeira e é a que prova que o problema foi entendido. Paralelismo é ausência de aresta: `paralelizavel` não desenha traço nenhum.

Três pontos de atenção deste estágio:

- **Contradição entre campos não gera diagrama, gera erro de plano reportado.** Uma task com `paralelizavel: true` e `depende_de` não vazio, uma seta para id inexistente, um ciclo de dependência: nesses casos o bloco não é escrito, a contradição é anunciada ao usuário, e **você corrige o plano aqui mesmo** — o E2 é o lugar de mexer no plano — e então regera. Essa detecção é a mesma coisa que a checklist do Passo 6 já verifica; o diagrama apenas a torna visível.
- **Limite de tamanho, regra dura:** acima de 25 tasks na sprint, uma visão geral das fases mais um diagrama por fase. Nunca um diagrama que não caiba numa tela.
- **O diagrama é derivado e nunca bloqueia.** Ele não entra no critério de saída deste estágio; falha ao gerá-lo é registrada no rastro e ignorada.

## Passo 5 — Escrever o ORQUESTRADOR.md

Crie `docs/manutencao/<OC-ID>-<slug>/ORQUESTRADOR.md` de `assets/TEMPLATE-ORQUESTRADOR.md`, com o frontmatter `kind: orquestrador` de `references/00-schema.md`. Ao criá-lo no E2, `estagio: e2`, `status: em_andamento` e `concluido_em: null`; `sprints:` e `caminho_critico:` espelham a rota da seção 3. É o arquivo-mapa desta ocorrência, escrito **para quem abriu o repositório agora e não sabe nada**. Seções obrigatórias:

1. **Objetivo** em no máximo 5 linhas.
2. **Mapa dos arquivos e ordem de leitura.**
3. **Rota de execução** com paralelismo e caminho crítico, derivada de `fases.md` e dos `depende_de`.
4. **Ferramentas:** comando de teste, comando de lint, comando de type check — os comandos exatos do projeto, tirados da base; `NÃO EXISTE NO PROJETO` quando não houver.
5. **Regras de autonomia.**
6. **Definição de pronto da ocorrência.**
7. **Como retomar uma sessão interrompida.**

Nunca escreva o valor de um segredo; declare o nome da variável e onde ela vive.

## Passo 6 — Verificação própria antes de encerrar

- [ ] Toda task tem todos os campos do contrato preenchidos.
- [ ] A primeira task da primeira fase é o teste que reproduz/fixa o comportamento.
- [ ] Nenhum `depende_de` aponta para id inexistente; não há ciclo de dependência.
- [ ] Toda task com `paralelizavel: true` não escreve nos mesmos arquivos de outra task paralela da mesma janela.
- [ ] Nenhum arquivo em `arquivos` está fora da lista de impactados do `01-CAUSA-RAIZ.md`.
- [ ] Nenhuma task depende de decisão humana em execução.
- [ ] Cada teste de cada task cabe em uma frase.
- [ ] Todo número do plano tem origem na base.
- [ ] O plano não foi inflado (sprint ou fase sem portão/bloco real) nem enxugado (campo omitido).
- [ ] `sprint.md` declara o que está fora de escopo.

## Critério de saída do estágio

- [ ] `sprint-01/` (e demais sprints) existem: no formato condensado, `sprint-01/tasks.md` com `kind: plano`; no de três arquivos, `sprint.md`, `fases.md` e `tasks.md` completos.
- [ ] `ORQUESTRADOR.md` existe com as 7 seções.
- [ ] Os arquivos do plano e o `ORQUESTRADOR.md` gravados com o frontmatter de `references/00-schema.md`, validado pela checklist daquele arquivo.
- [ ] Checklist do Passo 5 toda atendida.

## Quando o critério não é atendido

Corrija o plano você mesmo, neste estágio, antes de encerrar — o E2 é o lugar de mexer no plano. Não deixe para o E4 achar o que você já sabe que está errado.

## Passo 7 — Gravar o estado da barra

Com o plano no disco, atualize `.expx/estado.json` pelo procedimento de `references/06-estado.md`: `tasks_total` com o número total de tasks do plano, somando todas as sprints. Sem `.expx/` no projeto, siga sem gravar, sem erro e sem aviso; se a gravação falhar, registre no rastro e siga.

## Ao terminar

Anuncie: "E2 concluído. Plano em `docs/manutencao/<OC-ID>-<slug>/sprint-*/` (N sprints, M fases, K tasks) e `ORQUESTRADOR.md` escrito. Próximo estágio: E3 FIX." Siga para o E3 lendo `references/03-fix.md`.

Ao fazer a transição, grave `fase: e3` em `.expx/estado.json` — toda transição de estágio atualiza a barra.
