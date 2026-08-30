---
name: runx
description: "Use para manutenção e sustentação de sistema que já existe — corrigir bug, investigar defeito ou erro, apurar cálculo divergente, melhorar tela, layout ou interface, ajustar fluxo e usabilidade, alterar regra de negócio, adicionar campo, criar relatório em estrutura existente, tratar chamado ou ocorrência de suporte. Use MESMO QUE o usuário só descreva o sintoma, sem dizer que é bug e sem pedir correção: algo que não funciona como deveria, não segue o padrão esperado, está estranho, comportamento errado na interface, parou de funcionar, trava, some, duplica ou volta valor errado. Vale para relato de interação — arrastar, clicar, rolar, digitar, salvar, filtrar, botão que não responde — e para \"deveria fazer X e faz Y\". Use sem as palavras runx, chamado ou ocorrência. Cobre investigação, causa raiz ou análise de impacto, plano com TDD, execução autônoma, QA e relatórios. Fronteira: runx é para o que já existe e se comporta mal; feature nova do zero é a sprintx; decidir SE um pedido vira trabalho é a prodx."
---

# runx

runx é a metade **Run** do método da Expx (Exponencial): a sustentação do dia a dia. A metade **Build** é a `sprintx`, que planeja features novas do zero. As duas compartilham a mesma disciplina de engenharia — base antes do plano, hierarquia sprint → fase → task, TDD obrigatório, critério de aceite verificável, paralelismo declarado, execução guiada por orquestrador. Muda o gatilho e o tamanho, nunca o rigor.

## Princípio central

Não se corrige o que não se entendeu, e não se planeja o que não se mapeou. Primeiro a base do que será tocado, depois a causa, depois o plano, depois o código. O escopo fica travado no que a investigação provou: o que não está lá não é tocado.

## Fronteira de escopo

runx **começa** quando o chamado já chegou na mão do desenvolvedor. O que vem antes — cliente reclama, suporte atende e cadastra a ocorrência — acontece fora daqui e chega pronto.

runx **termina** quando os relatórios estão gravados e a ocorrência está encerrada. O deploy em si é externo: runx registra que foi liberado, não executa o deploy.

## Tipos de ocorrência

| Tipo | Significado |
|---|---|
| `bug` | defeito em comportamento existente |
| `melhoria-ui` | mudança visual, layout, componente |
| `melhoria-ux` | mudança de fluxo, navegação, usabilidade |
| `novo-relatorio` | relatório novo dentro de estrutura existente |
| `regra-de-calculo` | alteração de fórmula ou regra de negócio |
| `campo-novo` | novo campo em tela, formulário ou entidade |
| `outro` | qualquer coisa que não caiba acima |

O tipo é determinado no início e governa o comportamento do estágio E1: `bug` exige causa raiz comprovada; os demais tipos entram em análise de impacto.

## Contratos

### Contrato da Task — toda task declara, obrigatoriamente

| Campo | Conteúdo |
|---|---|
| `id` | T-NN.MM |
| `titulo` | título curto |
| `objetivo` | uma frase |
| `arquivos` | criados e alterados |
| `teste_regressao` | apenas na primeira task da primeira fase: o teste que reproduz o problema e hoje falha. Obrigatório quando `tipo: bug` |
| `teste_integracao` | o que valida, contra o quê |
| `teste_funcional` | o que valida, com qual entrada e saída |
| `criterio_aceite` | verificável, binário, sem adjetivo |
| `depende_de` | [ids] ou [] |
| `paralelizavel` | true \| false |
| `status` | pendente \| em_andamento \| concluida \| bloqueada |

`teste_regressao` é o único campo condicional: existe apenas na primeira task da primeira fase. Todos os demais são obrigatórios em toda task, qualquer que seja o tamanho da ocorrência.

### Contrato da Fase

Objetivo, tasks que a compõem, critério de saída, com qual outra fase pode rodar em paralelo.

### Contrato da Sprint

Objetivo, fases, critério de saída, riscos conhecidos.

## Regra de proporcionalidade

A estrutura é sempre a mesma; o tamanho é proporcional à ocorrência.

- Uma correção de uma linha gera **1 sprint, 1 fase e 2 tasks**, e ainda assim com todos os campos do contrato preenchidos.
- Uma ocorrência grande gera **mais fases**, e **mais de uma sprint apenas quando existe um portão real entre blocos entregáveis** — por exemplo, uma migração que precisa subir antes da mudança de tela.

Proibido inflar o plano para parecer robusto. Proibido enxugar campos para parecer ágil. A skill nunca omite um campo do contrato alegando que a ocorrência é pequena.

## Máquina de estados

Os cinco estágios são estritamente sequenciais e a skill nunca pula estágio:

E1 INVESTIGAÇÃO → E2 PLANO → E3 FIX → E4 QA → E5 RELATÓRIO

Antes de agir, descubra em que estágio está inspecionando o disco em `docs/manutencao/<OC-ID>-<slug>/`:

| Estado do disco | Estágio atual |
|---|---|
| a pasta não existe | E1 |
| `base/` existe, `01-CAUSA-RAIZ.md` não | E1.b |
| `01-CAUSA-RAIZ.md` existe, `sprint-01/` não | E2 |
| `sprint-01/` existe, `ORQUESTRADOR.md` não | E2 (concluir) |
| `ORQUESTRADOR.md` existe, há task pendente em aberto | E3 |
| todas as tasks concluídas, `QA.md` não existe | E4 |
| `QA.md` existe e contém `VEREDITO: APROVADO` | E5 |
| `QA.md` existe e contém `VEREDITO: REPROVADO` | E3 |

Há um único retorno que o disco não revela sozinho: se durante o E3 o teste de regressão passar **antes** do fix, a causa raiz ou o teste está errado — a execução para e volta ao E1, mesmo que o disco continue indicando E3. O E3 registra isso em `01-CAUSA-RAIZ.md` ao voltar.

**Toda transição de estágio atualiza o `.expx/estado.json`**, o arquivo que a barra de status do terminal lê — inclusive a volta do E4 para o E3 quando o QA reprova. É gravação derivada e somente de exibição: nenhuma decisão desta skill lê esse arquivo, e a sua ausência não quebra nada. O procedimento está em `references/06-estado.md`.

Se o usuário pedir um estágio adiantado, explique o que falta e execute o estágio pendente em vez de obedecer fora de ordem. Se houver mais de uma ocorrência aberta e o usuário não disser qual, liste as abertas com o estágio de cada uma e peça que escolha.

Ao entrar em um estágio, leia o arquivo dele em `references/` (tabela abaixo) antes de qualquer ação — e somente o do estágio atual.

## Contrato de entrada da ocorrência

A ocorrência chega pronta de fora. A skill aceita **texto colado, identificador de ticket ou caminho de arquivo**, e extrai para `00-OCORRENCIA.md`:

| Campo | Regra |
|---|---|
| identificador | o do ticket; se não houver, gere `OC-<AAAA>-<NNNN>` sequencial olhando `docs/manutencao/` e `docs/relatorios/` |
| titulo | título curto da ocorrência |
| tipo | classifique pela lista de tipos; se ambíguo, escolha o mais provável, registre a escolha e siga |
| relato original | o texto do cliente, preservado **literalmente**, sem reescrever |
| passos de reprodução | como reproduzir, ou `NÃO DETERMINADO` |
| ambiente, versão e dados | quando houver |

**Exceção única à autonomia:** se o tipo for `bug` e NÃO houver passos de reprodução nem evidência suficiente para investigar, a skill pergunta isso, e apenas isso, antes de começar. Investigar bug sem reprodução é chute. Para os demais tipos, siga com o que houver.

## Estrutura em disco

Duas árvores, propósitos diferentes.

**Trabalho em andamento.** Permanece no repositório após o fechamento; a limpeza é decisão do usuário — a skill nunca apaga nem move nada:

```
docs/manutencao/
  <OC-ID>-<slug>/
    ORQUESTRADOR.md
    00-OCORRENCIA.md      o chamado como chegou, preservado
    01-CAUSA-RAIZ.md      ou análise de impacto, mesmo arquivo
    BLOQUEIOS.md          criado vazio, preenchido durante E3
    QA.md
    base/
      00-INDICE.md
      00-LACUNAS.md
      <uma área impactada>.md
    sprint-01/
      sprint.md
      fases.md
      tasks.md
    sprint-02/ ...
```

**Histórico permanente do sistema:**

```
docs/relatorios/
  INDICE.md
  <AAAA-MM-DD>-<OC-ID>-<slug>/
    tecnico.md
    uso.md
```

A data no nome da pasta de relatório é a **data de fechamento**, para que uma listagem simples devolva a linha do tempo do sistema.

### Regra de nomeação e slug

O `<slug>` é derivado do título: minúsculas, sem acento (ç → c, ã → a, é → e, ...), espaços e separadores viram hífen, remova qualquer caractere fora de `a-z`, `0-9` e `-`, colapse hifens repetidos, **no máximo 6 palavras**. O mesmo slug é usado nas duas árvores.

Exemplo: "Cálculo do frete divergente acima de 50kg" → `calculo-frete-divergente-acima-50kg`.

`INDICE.md` é **append-only**, uma linha por ocorrência, mais recente no topo, com as colunas: `data | OC-ID | tipo | módulo afetado | resumo em uma linha | link`.

### Migração de pastas que já existem

Ao abrir uma pasta de ocorrência que já existe e cujos arquivos não têm frontmatter, a skill acrescenta o frontmatter **na próxima vez que gravar aquele arquivo**, inferindo os valores da prosa existente. A skill **nunca reescreve em massa** nem sai migrando pastas ou arquivos que não vai tocar, e continua nunca apagando nem movendo nada em `docs/manutencao/` (regra 12). Valor que não puder ser inferido com segurança vai como `null` (ou `[]`), nunca inventado. Detalhe em `references/00-schema.md`.

### Onde ficam `docs/manutencao/` e `docs/relatorios/`

Ambos são sempre ancorados na raiz do repositório Git mais próxima do diretório de trabalho atual (o diretório que contém `.git/`). Em um monorepo sem `.git` visível no diretório de trabalho, suba diretórios até encontrar a raiz do repositório; se não houver `.git` em nenhum ancestral, use a raiz do diretório de trabalho atual. Nunca crie essas pastas dentro de um pacote/workspace individual sem antes checar se já existe um `docs/` na raiz do repositório — se existir, use-o.

## Regras invioláveis

1. Nenhum plano nasce sem `base/` preenchida. Mapear antes de planejar.
2. Bug não avança de E1 sem causa raiz comprovada.
3. O plano segue sempre a hierarquia sprint → fase → task, com todos os campos do contrato, qualquer que seja o tamanho da ocorrência.
4. Toda task tem teste de integração e teste funcional. Sem exceção.
5. O teste de regressão é escrito antes do fix e tem que falhar antes.
6. Toda transição tem critério de aceite verificável, e nada avança sem ele atendido.
7. O paralelismo é declarado no plano, nunca decidido em execução.
8. Escopo travado: o que não está em `01-CAUSA-RAIZ.md` e em `tasks.md` não é tocado — nada de refactor de brinde, nada de "já que estou aqui"; melhoria avulsa percebida vira sugestão de nova ocorrência no relatório técnico e não é implementada.
9. A suíte inteira roda antes de qualquer task ser dada como concluída.
10. Quem implementa não aprova: E4 é papel distinto de E3, e E4 não corrige nada.
11. A ocorrência não fecha sem os dois relatórios gravados e o `INDICE.md` atualizado.
12. A skill nunca apaga nem move nada em `docs/manutencao/`.
13. Durante E3 a skill não pergunta nada. Dúvida nova vira registro em `BLOQUEIOS.md` e a task é pulada.
14. Todo arquivo de estado é gravado com o frontmatter do contrato expx-schema v1, descrito em `references/00-schema.md`. Arquivo de estado sem frontmatter válido é considerado não entregue.
15. Coincidência de arquivo não é regressão. O campo `regressao_de` só é preenchido com evidência de vínculo causal.

Regra transversal: use sempre caminhos relativos; nunca escreva caminhos absolutos em nenhum artefato.

## Hooks e agentes

Toda regra inviolável acima é, sozinha, uma instrução que o modelo pode esquecer numa execução longa. Hook é script determinístico: roda sempre, porque quem executa é o harness, não o modelo. Agente é contexto separado com ferramentas restritas: é o que torna "quem implementa não aprova" estrutural, e não uma promessa que o mesmo modelo faz a si mesmo.

Ambos são **opcionais**: sem eles a skill funciona igual, apenas sem a rede de proteção. Nenhuma regra do método muda por causa deles.

### Os agentes

| Agente | Estágio | Ferramentas | Papel |
|---|---|---|---|
| `investigador` | E1 | leitura e busca | Monta a base e prova a causa raiz |
| `revisor-testes` | E3 | leitura + rodar teste | Responde: esse teste passaria com a implementação errada? |
| `qa` | E4 | leitura + rodar suíte | Valida contra o plano e o escopo; não corrige |

**Os três têm acesso somente de leitura.** É isso que transforma "aponta, não corrige" de instrução em impossibilidade técnica. Nenhum deles grava arquivo: cada um devolve o conteúdo, e quem grava é a sessão principal, com o frontmatter do `references/00-schema.md`.

O `qa` ainda é o mesmo modelo lendo o mesmo repositório — o que muda é que ele não viu a justificativa que o implementador deu a si mesmo, e isso já pega uma classe real de erro. Independência de verdade pediria rodá-lo em modelo diferente; vale testar depois que o básico estiver rodando, e medir se pega coisa a mais. Antes disso, é opinião.

### Os hooks

Hook de método **nasce em modo aviso**: registra no rastro e deixa passar. Hook de segurança nasce em bloqueio, porque segredo commitado não tem volta e o falso positivo ali é raro.

| Hook | Evento | Modo inicial | O que faz |
|---|---|---|---|
| `segredo-no-commit` | `PreToolUse` escrita | **bloqueio** | Barra credencial indo para arquivo versionado |
| `causa-antes-do-plano` | `PreToolUse` em `sprint-*/` | aviso | Barra plano sem `01-CAUSA-RAIZ.md`, ou com `comprovada: false` em `bug` (regras 1 e 2) |
| `regressao-antes-do-fix` | `PreToolUse` escrita | aviso | Avisa ao tocar código de produção antes do `teste_regressao` existir (regra 5) |
| `task-so-fecha-verde` | `PreToolUse` em `tasks.md` | aviso | Barra `status: concluida` sem `suite: verde` e sem os dois testes (regras 4 e 9) |
| `escopo-da-ocorrencia` | `PreToolUse` escrita | aviso | Avisa ao escrever fora de `arquivos_impactados` e do `arquivos` das tasks (regra 8) |
| `sem-jargao-no-uso` | `PostToolUse` em `uso.md` | aviso | Aponta caminho de arquivo, nome de função, tabela, stack trace e termo técnico no relatório do cliente |

O modo de cada hook vive em `.expx/hooks.json`, e `doctor` mostra em que modo cada um está:

```bash
python3 .claude/runx-hooks/comum/doctor.py
```

Promova a bloqueio só com evidência: o hook que rodou semanas em aviso sem falso positivo. **Hook que dá falso positivo é desinstalado, e junto com ele vão os que funcionavam** — por isso a promoção é guiada pela coluna de violações do `doctor`, nunca por otimismo.

Um hook de método que quebra nunca trava o trabalho: registra o erro e sai com 0. O de segurança falha fechada.

### O rastro

Os hooks e a skill gravam eventos em `docs/eventos/<trabalho_id>.jsonl`, uma linha JSON por evento, no formato do contrato `expx-eventos` v1. Ninguém edita à mão; o painel lê. É de lá que sai a linha do tempo da ocorrência, o que cada agente tocou, e **quantas voltas ao E3 o QA causou** — a contagem que revela qualidade de plano, porque plano ruim gera volta.

Nas transições de estágio e ao receber veredito de agente, grave com:

```bash
python3 .claude/runx-hooks/comum/rastro.py --evento <evento> --agente <agente> --fase <e1..e5> [--task T-NN.MM] --resultado <r> --detalhe "<uma linha>"
```

O rastro é ignorado pelo versionador por padrão: é local da máquina de quem executou e cresce rápido.

## Estágios → arquivos da skill

| Estágio | Roteiro operacional | Templates usados |
|---|---|---|
| **todos** | **`references/00-schema.md`** — contrato do frontmatter; **leitura obrigatória em qualquer estágio que grave arquivo** | — |
| **todos** | `references/06-estado.md` — contrato do `.expx/estado.json` lido pela barra de status; leia no estágio que for gravá-lo | — |
| **todos** | `references/07-diagrama.md` — regras dos diagramas Mermaid derivados (grafo de tasks e cadeia da causa); leia no estágio que for gerá-los ou atualizá-los (E1.b, E2, E3) | — |
| E1 INVESTIGAÇÃO | `references/01-investigacao.md` | `assets/TEMPLATE-ocorrencia.md`, `assets/TEMPLATE-base-area.md`, `assets/TEMPLATE-causa-raiz.md`, `assets/TEMPLATE-analise-impacto.md` |
| E2 PLANO | `references/02-plano.md` | `assets/TEMPLATE-sprint.md`, `assets/TEMPLATE-fases.md`, `assets/TEMPLATE-tasks.md`, `assets/TEMPLATE-ORQUESTRADOR.md` |
| E3 FIX | `references/03-fix.md` | — |
| E4 QA | `references/04-qa.md` | `assets/TEMPLATE-qa.md` |
| E5 RELATÓRIO | `references/05-relatorio.md` | `assets/TEMPLATE-relatorio-tecnico.md`, `assets/TEMPLATE-relatorio-uso.md`, `assets/TEMPLATE-INDICE.md` |

Os caminhos acima são relativos à raiz desta skill. O detalhe operacional de cada estágio mora exclusivamente no reference correspondente; leia-o apenas quando o estágio chegar.
