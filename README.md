<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/banner-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/banner-light.svg">
  <img alt="expx — o CLI do metodo Expx" src="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/banner-light.svg" width="100%">
</picture>

<p>
  <a href="https://www.npmjs.com/package/expxdev"><img alt="npm: expxdev" src="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/badge-npm.svg"></a>
  <img alt="harness: Claude Code" src="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/badge-claude.svg">
  <img alt="harness: OpenCode" src="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/badge-opencode.svg">
  <img alt="testes: 231 passed" src="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/badge-testes.svg">
  <img alt="schema expx v1" src="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/badge-schema.svg">
  <img alt="node >=20.19" src="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/badge-node.svg">
  <img alt="licenca MIT" src="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/badge-license.svg">
</p>

<strong>O CLI do método Expx</strong> — instala, atualiza e diagnostica o ecossistema<br>
de skills para <a href="https://claude.com/claude-code">Claude Code</a> e <a href="https://opencode.ai">OpenCode</a>, e sobe o painel de operação.

</div>

```bash
npx expxdev init
```

O `init` busca as skills que você escolher nos repositórios oficiais, empacota apenas as
selecionadas como um plugin local chamado `expx` e configura o harness. Os comandos ficam
com namespace no Claude Code (`/expx:sprintx-sprints`) e sem namespace no OpenCode
(`/sprintx-sprints`).

> **A instalação é travada por lock; a atualização é um ato explícito.**
> Quem clona o projeto recebe exatamente as mesmas skills que o time está usando, sem rede e
> sem rodar nada. Quem atualiza decide quando, vendo antes o que muda.

---

## Índice

| | |
|---|---|
| **[O problema que o método resolve](#o-problema-que-o-método-resolve)** | por que existe um método, e não só um prompt melhor |
| **[O ecossistema](#o-ecossistema)** | as seis skills, o que cada uma faz e quando usar |
| **[Como as peças se encaixam](#como-as-peças-se-encaixam)** | o fluxo de ponta a ponta, com o diagrama |
| **[As três camadas de garantia](#as-três-camadas-de-garantia)** | skill, hook e agente — da mais fraca à mais forte |
| **[Os dois contratos](#os-dois-contratos-compartilhados)** | `expx-schema` e `expx-eventos`, o que faz tudo se encaixar |
| **[O que fica no seu projeto](#o-que-fica-no-seu-projeto)** | cada pasta, quem escreve e quem lê |
| **[Subcomandos](#subcomandos)** · **[Lock e atualização](#versão-lock-e-atualização)** · **[Doctor](#o-que-o-doctor-verifica)** · **[Painel](#o-painel)** | a referência do CLI |
| **[Anatomia do `init`](#anatomia-do-init-passo-a-passo)** | o que roda, em que ordem, e por quê |
| **[A memória do projeto](#a-memória-do-projeto)** | o que já se sabe sobre este arquivo, antes de mexer nele |
| **[Segurança](#segurança-e-limites)** · **[Desenvolvimento](#desenvolvimento)** | limites e arquitetura interna |

---

## O problema que o método resolve

Pedir a um agente de IA para construir uma feature funciona — até a segunda hora. O plano era
vago o bastante para o agente ter que decidir sozinho no meio da implementação, então ele
decide: escolhe um padrão que não é o do projeto, escreve o teste na pasta que o runner não
olha, refatora três arquivos que ninguém pediu, e entrega um diff de 600 linhas em que as
quatro que importam estão perdidas. Nada disso exige um modelo ruim — exige um modelo
prestativo trabalhando sem as restrições que um desenvolvedor experiente aplicaria por
instinto.

O método Expx é o conjunto dessas restrições, escrito. Ele parte de quatro apostas:

1. **Todo o esforço vai para o planejamento.** Uma pergunta feita durante a execução é sempre
   uma falha da fase de planejamento. Se a ambiguidade foi eliminada antes, a execução pode
   ser autônoma sem virar aposta.
2. **Nada avança sem critério verificável.** Task, fase e sprint têm portão de aceite binário,
   sem adjetivo. TDD não é sugestão: o teste vem antes, e a task só fecha com a suíte inteira
   verde.
3. **O escopo é travado no que a investigação provou.** O que não está no plano não é tocado.
   Melhoria avulsa vira registro de dívida, nunca um brinde no diff.
4. **Quem implementa não aprova.** O QA e a auditoria são papéis distintos, e os agentes que
   os executam têm acesso somente de leitura — o que transforma "aponta, não corrige" de
   promessa em impossibilidade técnica.

Este repositório é o **centro** do ecossistema: o CLI que instala e mantém as skills, e o
painel que lê o que elas gravam.

---

## O ecossistema

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/ecossistema-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/ecossistema-light.svg">
  <img alt="O CLI busca as seis skills, empacota como plugin e configura os dois harnesses" src="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/ecossistema-light.svg" width="100%">
</picture>

| Skill | O que faz | Quando usar |
|---|---|---|
| **[sprintx](https://github.com/bittencourtthulio/sprintx)** | Planeja e executa **features novas** em seis fases: ingestão → descoberta → plano → orquestrador → auditoria → execução. Todo o esforço vai para o planejamento, e a execução é autônoma porque a ambiguidade já foi eliminada. | Construir algo que não existe |
| **[runx](https://github.com/bittencourtthulio/runx)** | A metade **Run**: ocorrências de manutenção em produção, em cinco estágios — investigação com causa raiz comprovada, plano, fix sob TDD, QA independente e relatórios de fechamento. | Corrigir, ajustar ou investigar o que já está no ar |
| **[legadox](https://github.com/bittencourtthulio/legadox)** | **Camada** que endurece o trabalho em projetos legados. Não acrescenta fase: muda o *rigor* de cada uma, proporcional ao raio de impacto da mudança. | Mexer em código sem testes ou sem dono |
| **[stackx](https://github.com/bittencourtthulio/stackx)** | **Camada** que descobre o dialeto técnico do repositório — convenções, padrões e aderência — para o código novo parecer com o que já existe. | Entrar em base desconhecida |
| **[mergex](https://github.com/bittencourtthulio/mergex)** | Versionamento, entrega e revisão: branch, um commit por task, portão de prontidão, descrição de PR, pacote de QA e abertura do pull request. | Levar o trabalho pronto até o merge |
| **[memox](https://github.com/bittencourtthulio/MemoX)** | **Camada** de memória: indexa os artefatos já fechados — relatórios, causas raiz, decisões, QA, entregas — e responde o que já se sabe sobre um arquivo antes de alguém mexer nele. | Saber se este arquivo já quebrou antes |

**Camadas** (`legadox`, `stackx`, `memox`) sozinhas não fazem nada — elas modificam o
comportamento de `sprintx` e `runx`. O CLI avisa se você selecionar uma camada sem base, mas
nunca impede.

### Build e Run são a mesma disciplina

`sprintx` e `runx` não são dois métodos: são o mesmo método com gatilhos diferentes.

| | **sprintx** (Build) | **runx** (Run) |
|---|---|---|
| **Gatilho** | feature nova, planejada do zero | ocorrência num sistema em produção |
| **Entrada** | uma ideia, um requisito | um chamado, ticket ou relato de cliente |
| **Estágios** | F1…F6 (ingestão → execução) | E1…E5 (investigação → relatório) |
| **Saída** | a feature entregue | a ocorrência encerrada, com dois relatórios |

As duas compartilham **exatamente** os mesmos contratos: base de conhecimento antes de
qualquer plano, hierarquia sprint → fase → task, TDD obrigatório com no mínimo dois testes por
task, critério de aceite verificável em toda transição, paralelismo declarado no plano e
execução autônoma guiada por um arquivo orquestrador.

**Muda o gatilho e o tamanho. Nunca o rigor.**

---

## Como as peças se encaixam

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/metodo-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/metodo-light.svg">
  <img alt="O metodo Expx de ponta a ponta: o gatilho escolhe entre sprintx e runx, as camadas stackx e legadox modificam as duas, a mergex entrega e o painel le tudo" src="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/metodo-light.svg" width="100%">
</picture>

Em uma frase: **`stackx` diz como este projeto escreve código, `legadox` diz o quanto ter
medo, `sprintx` e `runx` fazem o trabalho, `mergex` entrega, e o `expxdev` instala todos e
mostra o andamento.**

A composição concreta, skill a skill:

| Quando a camada existe | O que muda na `sprintx` | O que muda na `runx` |
|---|---|---|
| **`docs/stack/CONVENCOES.md`** *(stackx)* | a ingestão lê as convenções; a descoberta transforma cada PROPOSTA em pergunta; o plano define caminho do teste, camada e padrão de erro **por task**, em vez de deixar para o executor; a auditoria roda a verificação de aderência | a investigação consulta o cartucho conforme o sintoma; o fix obedece o padrão de teste e o isolamento de banco |
| **`docs/legado/PERFIL.md`** *(legadox)* | cada fase ganha rigor proporcional ao raio: caracterização antes de alterar, orçamento de diff por task, plano de reversão, aprovação humana em raio ALTO | idem, sobre os cinco estágios |
| **`mergex` instalada** | abre a branch no início da F6, commita cada task, e entrega ao fim | abre a branch no início do E3, e entrega entre o E4 e o E5 |

> **A ausência nunca quebra.** Sem `CONVENCOES.md`, sem `PERFIL.md` ou sem a `mergex`, as
> outras skills se comportam exatamente como se comportariam sem elas. Insumo que não existe
> vira aviso do que falta — nunca invenção, e nunca um erro que trava o trabalho.

### Uma regra de precedência que evita o pior colateral

`stackx` descreve **o que deve ser seguido daqui pra frente**. `legadox` descreve **o que
existe hoje**, incluindo os dialetos conflitantes. Em projeto novo, só o `stackx` governa. **Em
projeto legado, na área tocada manda o padrão local descrito no `PERFIL.md`; o `stackx` governa
apenas código novo, em arquivo novo.**

Sem essa regra, a IA "moderniza" arquivo antigo achando que está obedecendo convenção — o
colateral mais perigoso que existe, porque vem com a justificativa de estar seguindo uma regra.

---

## As três camadas de garantia

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/camadas-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/camadas-light.svg">
  <img alt="As tres camadas que garantem o metodo: a skill instrui, o hook barra de forma deterministica, e o agente julga em contexto proprio" src="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/camadas-light.svg" width="100%">
</picture>

Uma regra escrita na skill é uma instrução — e instrução é coisa que o modelo pode esquecer na
task 14 de uma execução longa, justamente quando o trabalho é grande e o risco é maior. Por
isso o método tem três camadas, e cada uma cobre o que a anterior não garante:

- **A skill instrui.** É o método escrito: fases, contratos, regras invioláveis, templates.
- **O hook barra.** Script determinístico, executado pelo harness e não pelo modelo. Roda
  sempre, porque não depende de ninguém lembrar.
- **O agente julga.** Roda em contexto próprio, com ferramentas restritas — não vê o raciocínio
  de quem produziu o trabalho, e não tem como corrigir o que encontra.

### Todo hook de método nasce em modo aviso

| Modo | Comportamento | Quando promover |
|---|---|---|
| `aviso` | registra no rastro, não bloqueia | estado inicial de todo hook de método |
| `bloqueio` | barra a ação e devolve o motivo ao modelo | só depois de rodar semanas sem falso positivo |

A razão é prática: **hook que dá falso positivo é desinstalado, e junto com ele vão os que
funcionavam.** A exceção são os hooks de segurança, que nascem em `bloqueio` e falham fechados
— segredo commitado não tem volta, e o falso positivo ali é raro.

A promoção é decisão humana, tomada olhando as violações que o rastro acumulou. O modo de cada
hook vive em `.expx/hooks.json`, e cada skill traz um `doctor` que mostra o estado atual.

### Os agentes do ecossistema

| Agente | Usado por | Ferramentas | Papel |
|---|---|---|---|
| `auditor-plano` | sprintx F5 | **leitura apenas** | Fura o plano antes de ele virar código |
| `revisor-testes` | sprintx, runx | **leitura apenas** | Responde: esse teste passaria com a implementação errada? |
| `qa` | runx E4 | leitura + rodar suíte | Valida contra os critérios; não corrige |
| `investigador` | runx E1, legadox | leitura + busca | Monta a base e prova a causa raiz |
| `cartografo` | stackx, legadox | leitura + histórico | Varre o repositório e extrai convenção ou perfil |

> Os agentes de veredito — `auditor-plano`, `revisor-testes`, `qa` — têm acesso **somente de
> leitura**. Um agente sem restrição declarada **herda todas as ferramentas** no Claude Code,
> o que destruiria exatamente a garantia que justifica o agente existir.

**Hooks e agentes vivem hoje nos repositórios das skills**, instalados a partir de cada um. O
`init` monta o plugin com as skills e os comandos; a camada determinística de cada skill segue
o contrato `expx-eventos`, documentado abaixo.

---

## Os dois contratos compartilhados

As seis skills não se conhecem por código: elas se encontram em dois contratos escritos. É
isso que permite instalar três delas e não as outras duas, atualizar uma sem tocar nas demais,
ou escrever uma sexta amanhã.

| Contrato | O que padroniza | Quem escreve | Quem lê hoje |
|---|---|---|---|
| **[`expx-schema` v1](docs/contrato/CONTRATO-expx-schema-v1.md)** | o frontmatter YAML de todo arquivo de estado — plano, tasks, bloqueios, QA, relatórios | as skills | **o painel** |
| **[`expx-eventos` v1](docs/contrato/CONTRATO-expx-eventos.md)** | o rastro append-only `docs/eventos/<trabalho_id>.jsonl`, e o comportamento de hooks e agentes | as skills e os hooks | as próprias skills e o `doctor` de cada uma |

> O painel desta versão lê **apenas o `expx-schema`** — o estado. A leitura do rastro de
> eventos está especificada no contrato e ainda não implementada no painel.

**O estado responde "onde está"; o rastro responde "o que aconteceu e quando".**

```yaml
---
expx_schema: 1
expx_tool: runx          # sprintx | runx — quem escreveu
kind: tasks
trabalho_id: OC-2026-0142
atualizado_em: 2026-08-29
tasks:
  - id: T-01.01
    status: concluida
    criterio_aceite: O teste falha antes do fix e passa depois
    suite: verde
---
```

```json
{"ts":"2026-08-29T14:32:10Z","expx_eventos":1,"trabalho_id":"OC-2026-0142",
 "ferramenta":"runx","origem":"hook","evento":"task_concluida","fase":"e3",
 "task":"T-01.02","agente":"principal","resultado":"ok","detalhe":"suite verde, 14 testes"}
```

Os kinds compartilhados entre `sprintx` e `runx` — `orquestrador`, `sprint`, `fases`, `tasks`,
`bloqueios`, `base_indice` — são **idênticos campo por campo**; o campo `expx_tool` diz qual
das duas escreveu. A máquina lê o YAML e o JSONL; a pessoa lê a prosa abaixo deles.

Uma consequência que não estava prevista: o rastro dá o **esforço real por task sem ninguém
anotar nada**, e é isso que calibra a estimativa da `sprintx` nas features seguintes.

---

## O que fica no seu projeto

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/disco-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/disco-light.svg">
  <img alt="O que cada skill grava no seu projeto e quem le o que: as skills escrevem, os hooks acrescentam o rastro, e o painel apenas le" src="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/disco-light.svg" width="100%">
</picture>

`<trabalho_id>` é o mesmo identificador em todas as skills: o `<slug-da-feature>` da `sprintx`
ou o `<OC-ID>-<slug>` da `runx`. **Um trabalho, um nome, do plano até a entrega** — é o que
permite ao painel juntar o plano, o raio de impacto, a entrega e o rastro numa linha do tempo
só.

---

## Subcomandos

| Comando | O que faz |
|---|---|
| `expx init` | Instala as skills escolhidas neste projeto |
| `expx panel` | Sobe o painel de operação lendo o `docs/` do projeto |
| `expx add <skill...>` | Acrescenta skills à seleção e remonta o plugin |
| `expx remove <skill...>` | Remove skills da seleção e remonta o plugin |
| `expx update [skill...]` | Atualiza as skills instaladas |
| `expx doctor` | Diagnostica uma instalação quebrada |

O painel funciona **sem `init`**: ele não precisa de nada instalado.

### Flags do `init`

A seleção é feita por flag — a escolha é declarativa, o que faz a mesma linha servir ao seu
terminal e ao CI:

```bash
npx expxdev init --skills sprintx,runx,mergex --harness claude,opencode --yes
```

| Flag | Efeito |
|---|---|
| `--skills <lista>` | Skills a instalar, separadas por vírgula. Repetível |
| `--harness <lista>` | `claude`, `opencode`, ou os dois. Padrão: `claude` |
| `--yes` / `--sim` | Aplica sem exigir terminal interativo |

Todas aceitam também a forma `--flag=valor`.

**Sem terminal interativo e sem `--yes`**, o `init` imprime o que instalaria e sai **sem
escrever nada** — é o modo de simulação, e é o que protege um CI de escrever por engano.

> A seleção interativa — escolher as skills numa lista, em vez de digitá-las — está planejada
> e ainda não implementada; o plano vive em [`docs/selecao-interativa-init/`](docs/selecao-interativa-init/).
> Hoje o `init` não faz nenhuma pergunta: com `--yes` ou com TTY, ele aplica direto.

---

## Anatomia do `init`, passo a passo

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/plugin-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/plugin-light.svg">
  <img alt="Anatomia do que o expx init monta: o marketplace local, o plugin expx com so as skills escolhidas, e o lock que trava versao e hash de cada arquivo" src="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/plugin-light.svg" width="100%">
</picture>

Para cada skill selecionada, em ordem:

1. **Resolve a versão alvo.** Busca a **maior tag de versão semântica** do repositório —
   comparando número a número, porque ordenar como texto colocaria `v1.10.0` antes de
   `v1.2.0`. Pré-lançamento (`-rc.1`) é ignorado: não é versão publicada. Sem nenhuma tag, cai
   para a branch padrão e **avisa explicitamente** que aquela skill não está travada.
2. **Busca o conteúdo** com `git clone --depth 1 --branch <referência>` — clone raso, usando o
   `git` do sistema. É de propósito: assim ele aproveita a credencial já configurada na
   máquina (repositório privado funciona sem CLI nenhum saber de token) e não esbarra em
   limite de requisição de API.
3. **Detecta o layout.** Os repositórios das skills não têm todos a mesma forma: alguns trazem
   a skill embutida em `.claude/skills/<nome>/`, outros numa pasta `skill/` na raiz. O CLI não
   assume caminho: procura o **`SKILL.md` mais raso** e adota a pasta dele como raiz, depois
   confere que o `name:` do frontmatter é mesmo a skill pedida. Um layout novo passa a
   funcionar sem tocar nesta camada.
4. **Verifica os caminhos.** Recusa qualquer skill que referencie caminho **fora da própria
   pasta** — a razão está logo abaixo.
5. **Calcula o hash de cada arquivo** e registra no lock, junto com repositório, referência,
   commit e a data de resolução.

**Uma skill que falha não derruba as outras**: o erro dela é reportado nominalmente e o `init`
segue com as demais. Você fica sabendo exatamente qual não entrou e por quê.

Só depois do loop é que a escrita acontece, e ela é **atômica**: a montagem inteira ocorre numa
pasta temporária **ao lado do destino** — não em `/tmp`, porque `rename` só é atômico dentro do
mesmo sistema de arquivos — e é trocada por `rename` ao final. Se falhar no meio, o `.expx/`
anterior é devolvido ao lugar e permanece intacto.

Por fim, o harness é configurado: `.claude/settings.json` é **mesclado** — com backup datado,
preservando todo o resto, e recusando-se a "consertar" JSON inválido — e o `.opencode/` é
materializado se você escolheu o OpenCode.

> **Sobre o registro do plugin.** Declarar o marketplace no `settings.json` do projeto **não
> instala** o plugin — isso foi verificado em execução, não presumido da documentação. O `init`
> chama `claude plugin marketplace add` e `claude plugin install`. Como esse registro grava um
> caminho absoluto na configuração do usuário, ele não viaja no commit: cada pessoa roda
> `expx init` na própria máquina. Sem o binário `claude` no PATH, o `.expx/` é montado
> normalmente e o CLI imprime os dois comandos para você rodar à mão.

---

## Versão, lock e atualização

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/lock-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/lock-light.svg">
  <img alt="Instalacao travada por lock; atualizacao explicita que nunca sobrescreve trabalho local" src="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/lock-light.svg" width="100%">
</picture>

O `expx-lock.json` guarda, por skill: o repositório, a referência resolvida, se ela está
travada em versão publicada, o commit exato, a data e **o hash de cada arquivo**. É esse
último campo que permite detectar modificação local sem consultar a rede.

### O que o `update` faz

1. Descobre a versão alvo de cada skill instalada
2. Compara com o lock — skill já em dia é reportada e **não é tocada**
3. **Detecta modificação local**: se os arquivos divergirem do lock, não sobrescreve
4. Mostra o resumo por skill: versão atual, versão nova, e o que mudou
5. Bloqueia skill que exija uma versão de `expx-schema` maior que a suportada
6. Pede confirmação e aplica
7. Remonta o plugin do zero, reescreve o lock e valida

| Flag | Efeito |
|---|---|
| *(sem argumento)* | Atualiza todas as skills instaladas |
| `<skill...>` | Atualiza apenas as nomeadas |
| `--check` | Só mostra o que mudaria, não aplica nada |
| `--to <ref>` | Fixa uma skill numa tag ou commit específico — exige nomear exatamente uma skill |
| `--yes` / `--sim` | Aplica sem exigir terminal interativo |

A aplicação **remonta o plugin do zero** com a seleção inteira do lock, em vez de editar a
árvore montada. É mais lento e é de propósito: editar no lugar deixa arquivo órfão quando uma
skill encolhe entre versões.

> `--latest` é aceito pelo parser mas hoje **não altera o comportamento** — a resolução segue
> sempre a maior tag, ou a branch padrão quando não há tag.

> **Rollback.** Como `.expx/` é commitado, desfazer uma atualização é revertê-lo pelo
> versionador (`git checkout -- .expx`). O `update` diz isso em toda execução que aplica.

---

## O que o `doctor` verifica

```bash
npx expxdev doctor
```

Quatorze verificações, cada uma com severidade e correção sugerida. Achado de severidade `aviso`
não derruba a saída; `erro` sim.

| Verificação | Severidade |
|---|---|
| `.expx/` existe | erro |
| lock legível | erro |
| lock não é de uma versão futura do CLI | erro |
| `plugin.json` válido | erro |
| `marketplace.json` válido | erro |
| skill do lock presente em disco | erro |
| nenhuma skill referencia caminho **fora da própria pasta** | erro |
| `.claude/settings.json` presente | erro |
| plugin habilitado no `settings.json` | erro |
| sem colisão de nome entre Claude Code e OpenCode | erro |
| hook instalado tem o motor da skill ao lado | erro |
| `.gitignore` não ignora o `.expx/` | erro |
| disco não divergiu do lock (modificação local) | aviso |
| skill travada em versão publicada | aviso |

> **Por que "hook sem motor" é erro.** Todo caminho de falha dos hooks do memox termina em
> `exit 0`, de propósito: falha aberta nunca trava o prompt de quem está trabalhando. O preço é
> que uma instalação quebrada fica indistinguível de um projeto sem artefatos — silêncio dos
> dois lados. O `doctor` é o único lugar onde a diferença aparece.

> **Por que "caminho fora da própria pasta" importa.** Ao instalar, o Claude Code **copia** o
> plugin para `~/.claude/plugins/cache/<marketplace>/<plugin>/<versão>/`, e só a pasta do
> plugin vai junto. Qualquer `../` dentro de uma skill sai da árvore copiada e deixa de
> resolver — silenciosamente. O CLI recusa instalar uma skill assim, tanto no `init` quanto no
> `doctor`.

---

## O painel

```bash
npx expxdev panel
```

Lê a pasta `docs/` do projeto, descobre os trabalhos gravados pelas skills e mostra no
navegador o que foi planejado, o que está em execução, o que travou e o histórico do que já foi
entregue. Ele lê o **estado** gravado sob o contrato `expx-schema`: o frontmatter YAML de cada
arquivo de plano, task, bloqueio, QA e relatório.

**Somente leitura, e não só por convenção.** Qualquer requisição que não seja `GET` recebe
`405` com a mensagem `o painel e somente leitura`. O servidor escuta exclusivamente em
`127.0.0.1` — o host é constante no código, sem flag, opção ou variável de ambiente que mude
isso.

Ele observa o `docs/` e atualiza sozinho: quando um arquivo muda, o navegador recebe o estado
novo por websocket, sem recarregar a página. A cada mudança o projeto é **relido inteiro**, não
em pedaços — as regras de conformidade cruzam referências entre arquivos, e uma leitura parcial
produziria violação falsa.

### O que ele reconhece

O painel não varre todo `.md` do projeto: procura **os nomes de arquivo do contrato** —
`ORQUESTRADOR.md`, `tasks.md`, `fases.md`, `sprint.md`, `01-CAUSA-RAIZ.md`, `QA.md`,
`tecnico.md`, `uso.md` e os demais. A razão é que muitos `.md` legítimos não têm frontmatter, e
varrer por extensão encheria a tela de "fora do schema" com ruído.

Um trabalho é uma pasta com `ORQUESTRADOR.md` de frontmatter válido — a regra é sobre o
conteúdo, não sobre o caminho. Pasta sem orquestrador é ignorada em silêncio.

Além do estado, o painel lê o índice da [`memox`](#a-memória-do-projeto), quando ele existe, e
o mostra na seção **Memória** — o que já se sabe sobre cada arquivo antes de alguém mexer nele.
Ele **não** observa `.expx/`: é lá que o índice é gravado, e observá-lo faria a reindexação
realimentar a recarga da tela sem dado novo nenhum.

### Ele também aponta violações do método

Além de mostrar o andamento, o painel confere o que leu contra as regras do método e lista o
que não bate:

| Violação | O que significa |
|---|---|
| `teste_ausente` | task sem teste de integração ou funcional declarado |
| `regressao_ausente` | ocorrência do tipo `bug` sem o teste que reproduz |
| `concluida_sem_verde` | task marcada como concluída sem a suíte verde |
| `paralela_com_dependencia` | task declarada paralelizável mas com dependência aberta |
| `sem_criterio_saida` | fase ou sprint sem critério de saída |
| `dependencia_inexistente` | task que depende de um id que não existe |
| `ciclo_dependencia` | duas ou mais tasks que se esperam em círculo |
| `estagio_incoerente` | estágio declarado que não combina com o estado dos arquivos |
| `bloqueio_antigo` | bloqueio parado há mais dias que o limite configurado |

A distinção importa e tem duas telas separadas:

- **Violação** — o painel *leu* o arquivo, e o conteúdo desobedece uma regra do método. Isso é
  um achado sobre o trabalho.
- **Rejeição** — o painel *não conseguiu* ler: sem frontmatter, YAML inválido, `kind`
  desconhecido, ou versão de schema mais nova que a suportada. Isso é um achado sobre o
  arquivo, e ele fica de fora do painel até ser corrigido.

Cada regra tem escopo estreito de propósito, porque violação falsa é pior que violação
ausente: regressão não é cobrada de trabalho da `sprintx` nem de ocorrência que não é bug, e
critério de saída não é exigido de fase que não o declara por não existir.

| Flag | Padrão | O que faz |
|---|---|---|
| `--porta <n>` | `4000` | porta do servidor local |
| `--dir <caminho>` | `./docs` | pasta de documentação a observar |
| `--no-open` | — | não abre o navegador |
| `--dias-bloqueio <n>` | `7` | dias a partir dos quais um bloqueio é antigo |

---

## A memória do projeto

Uma software house resolve o mesmo tipo de problema repetidamente. Bug de arredondamento numa
faixa de peso hoje; bug parecido no cálculo de comissão em três meses. Quem lembra do primeiro
resolve o segundo em vinte minutos — e quem não lembra não sabe que deveria perguntar.

A [`memox`](https://github.com/bittencourtthulio/MemoX) resolve isso indexando o que as outras
skills já gravaram. Ela é um **índice invertido**, não uma busca semântica: a pergunta real não
é "o que é parecido com isto", é "quem já mexeu neste arquivo e por quê" — e isso é uma string
exata. Resposta de índice aponta artefato e data, então dá para abrir e conferir; recuperação
semântica erra em silêncio, devolvendo algo plausível com a mesma confiança do certo.

O índice fica em `.expx/memoria/indice.json`, é **local e gitignorado**, e se reconstrói do
zero a qualquer momento:

```bash
python3 .claude/skills/memox/assets/memox.py indexar
```

### O que o painel mostra

A seção **Memória** do painel lê esse índice e mostra quatro coisas:

| Seção | O que responde |
|---|---|
| **Arquivos de risco** | quais arquivos acumulam sinal, ordenados por **regressões**, depois reprovações de QA, depois número de trabalhos |
| **Regressões** | onde um trabalho reabriu o que outro já tinha alterado — com a evidência e os dois artefatos de origem |
| **Coincidências de arquivo** | vínculos que **não** viraram regressão, com o motivo |
| **Artefatos contaminados** | onde o memox detectou segredo, para você ir corrigir na origem |

A ordenação por regressão, e não por movimento, é deliberada: um arquivo central é tocado por
dezenas de trabalhos sem nunca ter falhado. Ordenar por contagem colocaria justamente ele no
topo, enterrando embaixo o arquivo que já quebrou duas vezes.

**Coincidência não vira regressão por parecer plausível.** Um vínculo só é registrado como
regressão quando as três condições valem juntas: um arquivo apontado pela causa raiz do
trabalho posterior está entre os que o anterior alterou; a ordem cronológica está estabelecida;
e a causa do posterior é **comprovada**, não hipótese. Faltando qualquer uma, o vínculo aparece
na tabela de coincidências com o motivo escrito — é isso que impede o sinal mais valioso do
índice de virar ruído.

**Esta seção não respeita o filtro de período**, ao contrário das demais. O valor do sinal é
justamente o antigo: um arquivo que regrediu há dois anos continua sendo um arquivo que regride.

### Quando não há índice

Este é o caso **comum**, não um erro: o índice é local e não vai para o repositório, então um
clone recém-feito não tem nenhum. A tela mostra o comando que o gera e não reclama de nada. O
painel nunca invoca o motor — ele é Python, roda fora do painel, e o painel é somente leitura.

Índice corrompido (lido no instante em que o motor o reescreve) ou gravado numa versão de
formato desconhecida cai no mesmo estado: a memória fica vazia, o resto do painel segue
funcionando. Degradar mostrando, nunca quebrar.

## Segurança e limites

- **Nunca pede nem armazena credencial.** Repositório privado usa a credencial de git já
  configurada na máquina.
- **Nunca escreve fora da raiz do projeto.**
- **Nunca escreve uma skill.** O CLI busca e empacota; jamais edita conteúdo de skill.
- **Escrita atômica.** A montagem acontece em pasta temporária e é trocada por `rename` ao
  final: se falhar no meio, o `.expx/` anterior permanece intacto.
- **O painel é somente leitura**, e escuta apenas em `127.0.0.1`.
- Toda escrita destrutiva pede confirmação, com flag para pular em ambiente não interativo.

---

## Desenvolvimento

```bash
npm install
npm test          # 295 testes, sem acesso à rede
npm run typecheck
npm run build
```

TypeScript strict + ESM, Node ≥ 20.19, Vitest em três projetos (`servidor`, `ui`, `cli`). A
suíte roda contra repositórios git locais criados em tempo de teste — nenhum teste depende de
rede nem do estado do GitHub.

Arquitetura em camadas isoladas, uma pasta por responsabilidade. **Nenhuma regra de negócio
vive no código de linha de comando:**

```
src/
  nucleo/     catálogo das skills, resolução de versão, busca, layout, lock, integridade
  plugin/     montagem do plugin e dos manifestos, com escrita atômica
  harness/    configuração de Claude Code e OpenCode, merge de settings, backup
  doctor/     os quatorze verificadores e o efeito de cada achado
  update/     comparação com o lock, detecção de modificação local, compatibilidade de schema
  parser/     leitura do expx-schema — frontmatter, kinds, enums, descoberta e conformidade
              e a leitura do índice da memox (memoria/), com falha aberta
  servidor/   o painel: HTTP, websocket e o observador de arquivos (somente leitura)
  cli/        linha de comando: roteamento de subcomando, flags e seleção interativa
ui/           a interface do painel (React + Vite)
docs/contrato/  os dois contratos compartilhados pelas seis skills
```

Este projeto foi planejado e executado com o próprio método — o plano completo, a base de
conhecimento e as decisões estão em [`docs/expx-cli/`](docs/expx-cli/), e a integração da
memória em [`docs/memox-painel/`](docs/memox-painel/).

---

## Licença

MIT

---

<div align="center">
<sub>Parte do método <strong>Expx</strong> ·
expxdev ·
<a href="https://github.com/bittencourtthulio/sprintx">sprintx</a> ·
<a href="https://github.com/bittencourtthulio/runx">runx</a> ·
<a href="https://github.com/bittencourtthulio/legadox">legadox</a> ·
<a href="https://github.com/bittencourtthulio/stackx">stackx</a> ·
<a href="https://github.com/bittencourtthulio/mergex">mergex</a></sub>
</div>
