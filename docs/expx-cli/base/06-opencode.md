# OpenCode — descoberta de skills e comandos

Área externa. Como o CLI configura o harness OpenCode.

## Contrato de entrada

### Skills

O OpenCode suporta Agent Skills (pasta com `SKILL.md` + frontmatter `name`/`description`). Descobre de SEIS diretórios (https://opencode.ai/docs/skills/):

| Escopo | Caminho |
|---|---|
| Projeto nativo | `.opencode/skills/<name>/SKILL.md` |
| Global nativo | `~/.config/opencode/skills/<name>/SKILL.md` |
| **Projeto Claude-compat** | **`.claude/skills/<name>/SKILL.md`** |
| Global Claude-compat | `~/.claude/skills/<name>/SKILL.md` |
| Projeto agent-compat | `.agents/skills/<name>/SKILL.md` |
| Global agent-compat | `~/.agents/skills/<name>/SKILL.md` |

**Confirmado o que o promptcli1.md:98-99 afirma: o OpenCode lê `.claude/skills/` do projeto nativamente.**

Regra de subida (doc): "For project-local paths, OpenCode walks up from your current working directory until it reaches the git worktree."

Requisitos de `name` (doc): 1–64 caracteres, regex `^[a-z0-9]+(-[a-z0-9]+)*$`, e **deve bater com o nome da pasta**. `description`: 1–1024 caracteres.

### Comandos

Arquivo markdown; o nome do arquivo vira o nome do comando (`test.md` → `/test`), invocado com `/nome` (https://opencode.ai/docs/commands/).

**Singular vs plural — divergência real e verificada:**

- A documentação oficial só documenta o **plural**: `.opencode/commands/` (projeto), `~/.config/opencode/commands/` (global) — https://opencode.ai/docs/commands/
- O código aceita os DOIS: glob `{command,commands}/**/*.md`, prefixos removidos `["command/", "commands/"]` (`packages/opencode/src/config/command.ts`)
- O próprio repositório `sst/opencode` usa o **singular** em produção (`.opencode/command/commit.md`)

O `promptcli1.md:100` usa `.opencode/commands/` (plural) — que é a forma **documentada**. Coincide com a doc.

Frontmatter de comando documentado: `description` (opcional), `agent` (opcional), `model` (opcional), `subtask` (booleano, opcional). Argumentos são placeholders no CORPO, não frontmatter: `$ARGUMENTS`, `$1`..`$N`; também `` !`cmd` `` para injetar saída de bash e `@arquivo` para incluir arquivo.

## Contrato de saída

Comandos em subdiretório recebem nome com **barra**: `commands/nested/docs.md` → comando `nested/docs` (confirmado em `packages/core/test/config/command.test.ts`). O separador é `/`, nunca `:`.

## Limites e cotas

- Não existe conceito de plugin com namespace de comando (`/plugin:comando`) no OpenCode. A doc de plugins (https://opencode.ai/docs/plugins/) cobre hooks e eventos, não registro de comandos com namespace. **Confirma o promptcli1.md:97: "O namespace de plugin é do Claude Code; no OpenCode não existe."**
- Chave `skills` no schema oficial publicado (https://opencode.ai/config.json), ausente da prosa da doc:
  ```json
  { "skills": { "paths": ["..."], "urls": ["https://..."] } }
  ```
  `paths` = "Additional paths to skill folders"; `urls` = "URLs to fetch skills from".
- Não existe chave para diretórios extras de COMANDOS: `NÃO DOCUMENTADO` e ausente do schema.
- Habilitar/desabilitar skills é documentado via permissões: `permission.skill` com `allow`/`deny`/`ask` e wildcards; desligar a ferramenta toda com `tools: { skill: false }` (https://opencode.ai/docs/skills/).

## Erros conhecidos e tratamento

### Colisão de nomes — o ponto que o prompt manda resolver

A doc EXIGE unicidade mas **não publica regra de precedência**. O único texto oficial é o troubleshooting:

> "Ensure skill names are unique across all locations" — https://opencode.ai/docs/skills/

Precedência: `NÃO DOCUMENTADA`.

Comportamento real observado no código (`packages/opencode/src/skill/index.ts`): não há prioridade — é **last-writer-wins** sobre um mapa indexado por `name`, emitindo `logWarning("duplicate skill name", {existing, duplicate})`. Ordem de varredura: (1) globais `~/.claude` e `~/.agents`, (2) projeto `.claude`/`.agents` subindo até o worktree, (3) diretórios de config OpenCode (`.opencode`), (4) `skills.paths`, (5) `skills.urls`.

Consequência: hoje `.opencode/skills/x` sobrescreve `.claude/skills/x`. **Mas isso é implementação não documentada e pode mudar** — não construir lógica que dependa disso.

Escape documentado no código, ausente da doc — variáveis de ambiente (`packages/opencode/src/effect/runtime-flags.ts`):

| Variável | Efeito |
|---|---|
| `OPENCODE_DISABLE_EXTERNAL_SKILLS` | desliga `.claude` + `.agents` |
| `OPENCODE_DISABLE_CLAUDE_CODE_SKILLS` | desliga só as skills de `.claude` |
| `OPENCODE_DISABLE_CLAUDE_CODE` | desliga `.claude` por inteiro |

## Riscos para a nossa implementação

1. **A colisão do promptcli1.md:101-103 é REAL, mas o mecanismo é outro.** O risco não é entre Claude Code e OpenCode (no Claude Code o plugin tem namespace e não colide — ver `05-plugins-claude-code.md`). O risco é **dentro do próprio OpenCode**, que lê `.claude/skills/` E `.opencode/skills/` e resolve duplicata por last-writer-wins com apenas um warning. Se o CLI copiar as skills para os dois lugares, o OpenCode vê duas cópias do mesmo `name`.
2. **A solução mais simples é não duplicar:** com OpenCode escolhido, copiar as skills apenas para `.claude/skills/` (que o OpenCode lê nativamente) — que é exatamente o que o `promptcli1.md:98-99` já manda. O risco só aparece se algo também escrever em `.opencode/skills/`. O `doctor` precisa detectar as duas cópias.
3. **`name` da skill deve bater com o nome da pasta** no OpenCode (regra documentada). Ao montar o plugin e ao copiar para `.claude/skills/`, o CLI não pode renomear a pasta sem renomear o `name` do frontmatter — quebraria a descoberta no OpenCode.
4. **`commands/` (plural) é o documentado e é o que o prompt pede** — seguir a doc, não o repositório dos mantenedores. Registrar como decisão.
5. Comando de subpasta vira `subpasta/comando`. Se o CLI quisesse namespace no OpenCode, teria que usar pasta — mas o prompt determina "comandos para `.opencode/commands/` sem prefixo" (promptcli1.md:100), então não se aplica.

## Fonte

- https://opencode.ai/docs/skills/
- https://opencode.ai/docs/commands/
- https://opencode.ai/docs/plugins/
- https://opencode.ai/docs/config/
- https://opencode.ai/config.json (schema oficial)
- https://github.com/sst/opencode — `packages/opencode/src/skill/index.ts`, `packages/opencode/src/config/command.ts`, `packages/core/test/config/command.test.ts`, `packages/opencode/src/effect/runtime-flags.ts`

Todas acessadas em 2026-08-29.
