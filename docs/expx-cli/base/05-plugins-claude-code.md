# Plugins e marketplaces do Claude Code

Área externa. Como o plugin local `expx` é montado, declarado e resolvido.

## Contrato de entrada

### `.claude-plugin/plugin.json`

Único campo OBRIGATÓRIO: `name` (string, kebab-case). Exemplo oficial completo:

```json
{
  "name": "plugin-name",
  "displayName": "Plugin Name",
  "version": "1.2.0",
  "description": "Brief description",
  "author": { "name": "Author Name", "email": "author@example.com" },
  "skills": "./custom/skills/",
  "commands": ["./custom/commands/"],
  "agents": ["./custom/agents/"],
  "hooks": "./config/hooks.json",
  "mcpServers": "./mcp-config.json",
  "lspServers": "./.lsp.json",
  "dependencies": ["helper-lib"],
  "userConfig": { }
}
```

Campos e obrigatoriedade (https://code.claude.com/docs/en/plugins-reference.md):

| Campo | Obrigatório | Tipo | Nota |
|---|---|---|---|
| `name` | **SIM** | string kebab-case | prefixo dos comandos e skills |
| `version` | não | string semver | se omitido usa o commit SHA; se definido, usuários recebem update quando muda |
| `skills` | não | string | padrão `./skills/` |
| `commands` | não | string[] | padrão `./commands/` |
| `agents` | não | string[] | padrão `./agents/` |
| `hooks` | não | string | padrão `./hooks/hooks.json` |
| `defaultEnabled` | não | boolean | padrão `true` |

Regra estrutural explícita (https://code.claude.com/docs/en/plugins.md):

> "Don't put `commands/`, `agents/`, `skills/`, or `hooks/` inside the `.claude-plugin/` directory. Only `plugin.json` goes inside `.claude-plugin/`. All other directories must be at the plugin root level."

### `.claude-plugin/marketplace.json`

Campos obrigatórios: `name`, `owner`, `plugins` (https://code.claude.com/docs/en/plugin-marketplaces.md). Em cada entrada de plugin: `name` e `source` são obrigatórios.

```json
{
  "name": "my-plugins",
  "owner": { "name": "Your Name", "email": "you@example.com" },
  "plugins": [
    { "name": "my-plugin", "source": "./plugins/my-plugin", "description": "...", "version": "2.1.0" }
  ]
}
```

Tipos de `source` documentados: caminho relativo (string iniciada por `./`), `github`, `url`, `npm`, `archive`, `command`.

**O caso do expx é o primeiro: `"source": "./plugins/my-plugin"` — caminho relativo local, que É um tipo documentado dentro do marketplace.json.**

## Contrato de saída

### Namespace — regra confirmada

> "Skills are prefixed with this [`name`] (e.g., `/my-first-plugin:hello`)."
> — https://code.claude.com/docs/en/plugins.md

Padrão exato: `/<plugin-name>:<skill-name>`. Com `"name": "expx"` e uma skill em `skills/sprintx-sprints/SKILL.md`, o resultado é `/expx:sprintx-sprints` — **exatamente o que o promptcli1.md:20 espera**.

> "Plugin skills are always namespaced (like `/my-first-plugin:hello`) to prevent conflicts when multiple plugins have skills with the same name."

### Precedência e colisão

Ordem de precedência entre skills de mesmo nome (https://code.claude.com/docs/en/skills.md): Enterprise → Personal (`~/.claude/skills/`) → Project (`.claude/skills/`) → bundled. Plugin fica FORA dessa disputa:

> "Plugin skills use a `plugin-name:skill-name` namespace, so they can't conflict with other levels. For example, `my-plugin/skills/deploy/SKILL.md` becomes `/my-plugin:deploy` and loads alongside a `deploy` skill in your project's `.claude/skills/`."

Skills do projeto em `.claude/skills/<nome>/SKILL.md` são descobertas nativamente, sem plugin, e também a partir de cada diretório pai até a raiz do repositório e de diretórios adicionados com `--add-dir`.

### settings.json

Chaves exatas (https://code.claude.com/docs/en/settings-reference.md):

```json
{
  "extraKnownMarketplaces": {
    "my-team-tools": { "source": { "source": "github", "repo": "your-org/claude-plugins" } }
  },
  "enabledPlugins": ["plugin-name@marketplace-name"]
}
```

`enabledPlugins` é array de strings no formato `"plugin-name@marketplace-name"`.

## Limites e cotas

Limitação declarada a partir da v2.1.195 (https://code.claude.com/docs/en/discover-plugins.md):

> "As of Claude Code v2.1.195, adding the marketplace doesn't install plugins that come from an external source, on any path that loads plugins. A plugin that only the project's `.claude/settings.json` enables, and that comes from an external source such as a GitHub repository or npm package, doesn't load until the team member installs it."

Leitura literal: a restrição incide sobre plugin vindo de **fonte externa** (GitHub, npm). O plugin do expx vem de caminho local dentro do próprio repositório — o que sugere que ele NÃO cai nessa restrição. Mas a documentação não afirma isso; é inferência. Ver riscos.

Aviso sobre marketplaces por URL/caminho (https://code.claude.com/docs/en/discover-plugins.md):

> "URL-based marketplaces have some limitations compared to Git-based marketplaces. If you encounter 'path not found' errors when installing plugins, see Troubleshooting."

Qual é a limitação específica: `NÃO DOCUMENTADO`.

## Erros conhecidos e tratamento

- `'path not found'` ao instalar de marketplace baseado em URL/caminho — a doc remete ao Troubleshooting sem detalhar a causa. `NÃO DOCUMENTADO`.

## Riscos para a nossa implementação

1. **O PONTO CRÍTICO DO PROMPT SE CONFIRMA.** `promptcli1.md:35-38` manda registrar em LACUNAS se marketplace por diretório local declarado em `settings.json` funciona como esperado. A documentação **NÃO afirma**: mostra `source` local dentro de `marketplace.json` ✓ e `source: github` dentro de `extraKnownMarketplaces` ✓, mas **nunca mostra a sintaxe de caminho local dentro de `extraKnownMarketplaces` no settings.json**, nem afirma que isso carrega sem interação para quem clona. O plano é obrigado a prever **validação em execução, não fé na documentação** — como o próprio prompt exige.
2. **Cache do plugin: localização NÃO DOCUMENTADA.** Existem as variáveis de ambiente `CLAUDE_CODE_PLUGIN_CACHE_DIR` e `CLAUDE_CODE_PLUGIN_SEED_DIR`, mas o caminho padrão do cache não é publicado.
3. **Referência relativa para fora da pasta do plugin: NÃO DOCUMENTADA.** A doc não afirma que quebra, nem que funciona. A existência de `${CLAUDE_PLUGIN_ROOT}` sugere que o caminho correto é usar a variável. A regra crítica do `promptcli1.md:81-84` (o CLI verificar e falhar se alguma skill apontar para fora da própria raiz) permanece válida como **precaução**, não como fato documentado.
4. **A premissa de colisão do promptcli1.md:101-102 está PARCIALMENTE ERRADA.** O prompt afirma que "a mesma skill pode acabar visível em dois lugares que o OpenCode lê, e nomes de skill precisam ser únicos entre todas as localizações". Para o **Claude Code** isso é falso: skill de plugin (`/expx:sprintx`) e skill de projeto (`/sprintx`) coexistem sem conflito por terem namespaces distintos. O problema de colisão, se existir, é do lado do **OpenCode** — que não usa namespace. Isso muda o desenho da solução e precisa ser confirmado na F2.
5. `version` no plugin.json controla a percepção de update pelo usuário: "se definido, usuários recebem updates quando bumped". O CLI precisa decidir se e como versiona o plugin `expx` montado.

## Fonte

- https://code.claude.com/docs/en/plugins.md
- https://code.claude.com/docs/en/plugins-reference.md
- https://code.claude.com/docs/en/plugin-marketplaces.md
- https://code.claude.com/docs/en/discover-plugins.md
- https://code.claude.com/docs/en/settings-reference.md
- https://code.claude.com/docs/en/skills.md

Todas acessadas em 2026-08-29.
