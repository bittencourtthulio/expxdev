# Validação em execução — marketplace local e cache de plugin

Área externa/experimental. O `promptcli1.md:36-38` exige que este ponto seja validado **em execução, não por fé na documentação**. Foi. Este arquivo registra o experimento e o resultado.

## Contrato de entrada

Projeto de teste montado em pasta temporária, na estrutura exata que o `promptcli1.md:71-79` especifica:

```
.expx/marketplace/.claude-plugin/marketplace.json
.expx/plugin/.claude-plugin/plugin.json      name: "expx"
.expx/plugin/skills/sprintx/SKILL.md
.expx/plugin/commands/sprintx-teste.md
.claude/settings.json
```

Sonda usada em cada rodada, sempre no diretório do projeto de teste:

```
claude -p "responda so: PLUGIN_OK se existir skill com prefixo expx:, senao PLUGIN_NAO"
```

## Contrato de saída — os resultados

### Rodada 1 — cinco declarações em `extraKnownMarketplaces` do PROJETO

| `source` testado | Resultado |
|---|---|
| `{"source":{"source":"directory","path":"./.expx/marketplace"}}` | `PLUGIN_NAO` |
| `{"source":"./.expx/marketplace"}` | `PLUGIN_NAO` |
| `{"source":{"source":"local","path":"./.expx/marketplace"}}` | `PLUGIN_NAO` |
| `{"source":{"source":"path","path":"./.expx/marketplace"}}` | `PLUGIN_NAO` |
| `{"source":{"source":"directory","path":"<absoluto>"}}` | `PLUGIN_NAO` |

**Nenhuma declaração em `.claude/settings.json` do projeto, sozinha, instalou o plugin.**

### Rodada 2 — o caminho que FUNCIONA

```
claude plugin marketplace add ./.expx/marketplace
→ Successfully added marketplace: expx-local (declared in user settings)

claude plugin install expx@expx-local
→ Successfully installed plugin: expx@expx-local (scope: user)

sonda → PLUGIN_OK
```

**O namespace do promptcli1.md:20 se confirma na prática**: com `name: "expx"` no plugin.json, a skill `sprintx` do plugin fica disponível com prefixo `expx:`.

### A sintaxe REAL gravada pelo próprio Claude Code

O `marketplace add` grava em `~/.claude/settings.json` (user, **não** projeto):

```json
"extraKnownMarketplaces": {
  "expx-local": {
    "source": { "source": "directory", "path": "/caminho/ABSOLUTO/.expx/marketplace" }
  }
}
```

Dois desvios da documentação:

1. O tipo é **`directory`** (a doc de `marketplace.json` documenta `github`, `url`, `npm`, `archive`, `command` e string relativa — `directory` aparece só aqui, e havia precedente na máquina: `zai-coding-plugins` usa exatamente essa forma).
2. O `path` é **absoluto**. O comando resolve o relativo para absoluto antes de gravar.

E `enabledPlugins` no arquivo real é **objeto**, não array:

```json
"enabledPlugins": { "expx@expx-local": true }
```

A doc (https://code.claude.com/docs/en/settings-reference.md) mostra `["plugin-name@marketplace-name"]` — array. O arquivo real em disco usa mapa `nome → boolean`.

### Erro concreto obtido — e a regra que ele revela

Com `"source": "../plugin"` no marketplace.json (plugin FORA da pasta do marketplace):

```
Failed to install plugin "expx@expx-local":
  This plugin's marketplace entry is invalid: source: Invalid input
```

Corrigido movendo o plugin para DENTRO da pasta do marketplace e usando `"source": "./plugins/expx"` → instalou.

**Regra derivada: o `source` relativo do marketplace.json não pode subir de diretório.** A estrutura do `promptcli1.md:73-77`, com `marketplace/` e `plugin/` como irmãos dentro de `.expx/`, **não funciona como está** — o plugin precisa ficar dentro da árvore do marketplace.

## Limites e cotas — o cache (resolve L-07 e L-08)

Layout real de `~/.claude/plugins/`:

```
blocklist.json
cache/<marketplace>/<plugin>/<versao>/     ← o plugin COPIADO
data/
installed_plugins.json
known_marketplaces.json
marketplaces/<marketplace>/
plugin-catalog-cache.json
```

O plugin `expx` instalado foi para:

```
~/.claude/plugins/cache/expx-local/expx/0.1.0/
  .claude-plugin/plugin.json
  commands/sprintx-teste.md
  skills/sprintx/SKILL.md
```

Registro em `installed_plugins.json` (`"version": 2`), com uma entrada por escopo:

```json
"expx@expx-local": [
  { "scope": "user",    "installPath": ".../cache/expx-local/expx/0.1.0", "version": "0.1.0", "installedAt": "...", "lastUpdated": "..." },
  { "scope": "project", "installPath": ".../cache/expx-local/expx/0.1.0", "version": "0.1.0", "projectPath": "/caminho/do/projeto", ... }
]
```

Para plugins vindos de git, o registro traz também `gitCommitSha` — e quando o plugin.json não declara `version`, o diretório do cache é o SHA curto (observado em `claude-plugins-official/frontend-design/aa296ec81e8c`).

**`version` do plugin.json vira o nome do diretório no cache** (`expx/0.1.0/`). É o mecanismo pelo qual o Claude Code distingue versões — confirma a nota da doc de que bumpar `version` faz o usuário receber update.

**L-08 respondida por prova:** o plugin é COPIADO para o cache, e só a pasta do plugin vai junto. Qualquer `../` dentro de uma skill sai da árvore copiada e aponta para o vazio. A regra crítica do `promptcli1.md:81-84` está **provada**, não presumida.

## Erros conhecidos e tratamento

| Erro | Causa | Correção |
|---|---|---|
| `source: Invalid input` | `source` do marketplace.json sobe de diretório (`../plugin`) | manter o plugin dentro da árvore do marketplace |
| plugin declarado em settings do projeto não carrega | declaração sozinha não instala | rodar `claude plugin marketplace add` + `claude plugin install` |

Comandos de limpeza verificados: `claude plugin uninstall <p>@<m>` e `claude plugin marketplace remove <m>` — removem registro e deixam zero resíduo em `settings.json`, `installed_plugins.json` e `known_marketplaces.json`.

## Riscos para a nossa implementação

1. **O desenho do `promptcli1.md` precisa mudar em dois pontos, e isso é consequência de fato medido:**
   - `marketplace/` e `plugin/` não podem ser irmãos: o plugin vai para dentro do marketplace (ex.: `.expx/marketplace/plugins/expx/`).
   - Escrever `.claude/settings.json` **não basta** para que quem clona receba o plugin. O `init` tem de invocar `claude plugin marketplace add` + `claude plugin install`, ou o CLI precisa documentar esse passo para quem clona.
2. **O `marketplace add` grava caminho ABSOLUTO em `~/.claude/settings.json` do usuário.** Isso é hostil a repositório compartilhado: o caminho da máquina de quem rodou não serve para o colega, e não é commitável. Quem clona precisa rodar o `expx init` (ou um `expx doctor --fix`) na própria máquina.
3. **A doc diverge do arquivo real em `enabledPlugins`** (array documentado × objeto real). O merge de `settings.json` do CLI precisa aceitar as DUAS formas ao ler, e escrever a forma que o Claude Code escreve (objeto), sob risco de corromper o arquivo do usuário.
4. Versão testada do Claude Code: a instalada nesta máquina em 2026-08-29. O comportamento de `settings.json` do projeto mudou na v2.1.195 conforme a própria doc; **pode mudar de novo**. O `doctor` deve verificar o efeito (a skill aparece?) e não só a sintaxe do arquivo.

## Fonte

Experimento executado em 2026-08-29 em `<scratchpad>/mkt-test`, com o `claude` instalado nesta máquina. Arquivos inspecionados: `~/.claude/settings.json`, `~/.claude/plugins/installed_plugins.json`, `~/.claude/plugins/known_marketplaces.json`, `~/.claude/plugins/cache/`. Ambiente restaurado ao estado original ao fim (zero resíduo verificado).
