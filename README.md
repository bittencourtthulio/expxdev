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

## O ecossistema

O método Expx é um conjunto de skills que se compõem. O CLI é quem as instala e mantém.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/ecossistema-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/ecossistema-light.svg">
  <img alt="O CLI busca as cinco skills, empacota como plugin e configura os dois harnesses" src="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/ecossistema-light.svg" width="100%">
</picture>

| Skill | O que faz | Quando usar |
|---|---|---|
| **[sprintx](https://github.com/bittencourtthulio/sprintx)** | Planeja e executa **features novas** em seis fases: ingestão → descoberta → plano → orquestrador → auditoria → execução. Todo o esforço vai para o planejamento, e a execução é autônoma porque a ambiguidade já foi eliminada. | Construir algo que não existe |
| **[runx](https://github.com/bittencourtthulio/runx)** | A metade **Run**: ocorrências de manutenção em produção, em cinco estágios — investigação com causa raiz comprovada, plano, fix sob TDD, QA independente e relatórios de fechamento. | Corrigir, ajustar ou investigar o que já está no ar |
| **[legadox](https://github.com/bittencourtthulio/legadox)** | **Camada** que endurece o trabalho em projetos legados. Não acrescenta fase: muda o *rigor* de cada uma, proporcional ao raio de impacto da mudança. | Mexer em código sem testes ou sem dono |
| **[stackx](https://github.com/bittencourtthulio/stackx)** | **Camada** que descobre o dialeto técnico do repositório — convenções, padrões e aderência — para o código novo parecer com o que já existe. | Entrar em base desconhecida |
| **[mergex](https://github.com/bittencourtthulio/mergex)** | Versionamento, entrega e revisão: branch, um commit por task, portão de prontidão, descrição de PR, pacote de QA e abertura do pull request. | Levar o trabalho pronto até o merge |

**Camadas** (`legadox`, `stackx`) sozinhas não fazem nada — elas modificam o comportamento de
`sprintx` e `runx`. O CLI avisa se você selecionar uma camada sem base, mas nunca impede.

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

### Modo não interativo

Toda pergunta do `init` tem equivalente por flag, para uso em script e CI:

```bash
npx expxdev init --skills sprintx,runx,mergex --harness claude,opencode --yes
```

| Flag | Efeito |
|---|---|
| `--skills <lista>` | Skills a instalar, separadas por vírgula |
| `--harness <lista>` | `claude`, `opencode`, ou os dois |
| `--painel` | Instala o painel como devDependency |
| `--yes` | Pula confirmações |

Sem terminal interativo e sem `--yes`, o `init` mostra o que faria e sai **sem escrever nada**.

---

## Versão, lock e atualização

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/lock-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/lock-light.svg">
  <img alt="Instalacao travada por lock; atualizacao explicita que nunca sobrescreve trabalho local" src="https://raw.githubusercontent.com/bittencourtthulio/expxdev/main/.github/assets/lock-light.svg" width="100%">
</picture>

Por padrão o CLI busca a **maior tag de versão semântica** de cada repositório. Se o
repositório não tiver tag nenhuma, ele cai para a branch padrão e **avisa explicitamente**
que aquela skill não está travada em versão publicada — nunca segue a branch em silêncio
quando existe tag.

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
| `--to <ref>` | Fixa uma skill numa tag ou commit específico |
| `--latest` | Segue a branch padrão em vez da maior tag |
| `--yes` | Pula confirmações |

> **Rollback.** Como `.expx/` é commitado, desfazer uma atualização é revertê-lo pelo
> versionador (`git checkout -- .expx`). O `update` diz isso em toda execução que aplica.

---

## O que é criado no projeto

```
.expx/
  expx-lock.json                                    versão exata de cada skill + hash por arquivo
  marketplace/
    .claude-plugin/marketplace.json
    plugins/expx/
      .claude-plugin/plugin.json                    name: "expx"
      skills/<só as selecionadas>/
      commands/<só os correspondentes>/
.claude/settings.json                               mesclado, nunca sobrescrito
.opencode/commands/                                 se OpenCode for escolhido
```

**Todo o `.expx/` é commitado** — é isso que faz quem clona receber as mesmas skills. O CLI
verifica que nenhuma regra de `.gitignore` o esteja ignorando.

O merge do `.claude/settings.json` faz backup datado antes de tocar, mescla apenas as chaves
necessárias e preserva todo o resto. JSON inválido não é consertado: o CLI avisa e sai.

> **Sobre o registro do plugin.** Declarar o marketplace no `settings.json` do projeto **não
> instala** o plugin — isso foi verificado em execução, não presumido da documentação. O `init`
> chama `claude plugin marketplace add` e `claude plugin install`. Como esse registro grava um
> caminho absoluto na configuração do usuário, ele não viaja no commit: cada pessoa roda
> `expx init` na própria máquina. Sem o binário `claude` no PATH, o `.expx/` é montado
> normalmente e o CLI imprime os dois comandos para você rodar à mão.

---

## O que o `doctor` verifica

```bash
npx expxdev doctor
```

- `.expx/` existe, lock legível, skills do lock presentes em disco
- divergência entre disco e lock, indicando modificação local
- skill não travada em versão publicada
- `plugin.json` e `marketplace.json` válidos, com name `expx`
- nenhuma skill referenciando caminho **fora da própria pasta**
- `settings.json` válido e com o plugin habilitado
- colisão de nome de skill entre Claude Code e OpenCode
- compatibilidade entre a versão do CLI e a estrutura em `.expx/`
- `.gitignore` ignorando `.expx/` indevidamente

Cada achado vem com a correção sugerida. Achado de severidade `aviso` não derruba a saída.

> **Por que "caminho fora da própria pasta" importa.** Ao instalar, o Claude Code **copia** o
> plugin para `~/.claude/plugins/cache/<marketplace>/<plugin>/<versão>/`, e só a pasta do
> plugin vai junto. Qualquer `../` dentro de uma skill sai da árvore copiada e deixa de
> resolver — silenciosamente. O CLI recusa instalar uma skill assim.

---

## O painel

```bash
npx expxdev panel
```

Lê a pasta `docs/` do projeto, descobre os trabalhos gravados por `sprintx` e `runx` e mostra
no navegador o que foi planejado, o que está em execução, o que travou e o histórico do que
já foi entregue.

**Somente leitura.** O painel nunca escreve nos arquivos do projeto e nunca executa comando
algum. O servidor escuta exclusivamente em `127.0.0.1` — não há flag que mude isso.

| Flag | Padrão | O que faz |
|---|---|---|
| `--porta <n>` | `4000` | porta do servidor local |
| `--dir <caminho>` | `./docs` | pasta de documentação a observar |
| `--no-open` | — | não abre o navegador |
| `--dias-bloqueio <n>` | `7` | dias a partir dos quais um bloqueio é antigo |

---

## Segurança e limites

- **Nunca pede nem armazena credencial.** Repositório privado usa a credencial de git já
  configurada na máquina.
- **Nunca escreve fora da raiz do projeto.**
- **Nunca escreve uma skill.** O CLI busca e empacota; jamais edita conteúdo de skill.
- **Escrita atômica.** A montagem acontece em pasta temporária e é trocada por `rename` ao
  final: se falhar no meio, o `.expx/` anterior permanece intacto.
- Toda escrita destrutiva pede confirmação, com flag para pular em ambiente não interativo.

---

## Desenvolvimento

```bash
npm install
npm test          # 231 testes, sem acesso à rede
npm run typecheck
npm run build
```

TypeScript strict + ESM, Node ≥ 20.19, Vitest em três projetos (`servidor`, `ui`, `cli`). A
suíte roda contra repositórios git locais criados em tempo de teste — nenhum teste depende
de rede nem do estado do GitHub.

Arquitetura em camadas isoladas: resolução de versão e busca, normalização de layout,
montagem do plugin, configuração de harness, detecção de modificação local. Nenhuma regra de
negócio vive no código de linha de comando.

Este projeto foi planejado e executado com o próprio método — o plano completo, a base de
conhecimento e as decisões estão em [`docs/expx-cli/`](docs/expx-cli/).

---

<div align="center">
<sub>Parte do método <strong>Expx</strong> ·
<a href="https://github.com/bittencourtthulio/sprintx">sprintx</a> ·
<a href="https://github.com/bittencourtthulio/runx">runx</a> ·
<a href="https://github.com/bittencourtthulio/legadox">legadox</a> ·
<a href="https://github.com/bittencourtthulio/stackx">stackx</a> ·
<a href="https://github.com/bittencourtthulio/mergex">mergex</a></sub>
</div>
