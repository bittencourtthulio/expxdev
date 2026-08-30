# statusLine do Claude Code — configuração no settings.json

> **Nota de fonte:** `https://docs.claude.com/en/docs/claude-code/statusline` responde **301** para `https://code.claude.com/docs/en/statusline`. O domínio canônico hoje é `code.claude.com/docs/en/...`.

## Contrato de entrada

A chave `statusLine` no `settings.json`. Forma canônica, verbatim da doc:

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh",
    "padding": 2
  }
}
```

| Campo | Obrigatório | Afirmação verbatim |
|---|---|---|
| `type` | sim | "Set `type` to `\"command\"` and point `command` to a script path or an inline shell command." |
| `command` | sim | "The `command` field runs in a shell, so you can also use inline commands instead of a script file." |
| `padding` | não | "adds extra horizontal spacing (in characters)... **Defaults to `0`**. This padding is in addition to the interface's built-in spacing" |
| `refreshInterval` | não | "re-runs your command every N seconds in addition to the event-driven updates. **The minimum is `1`.**" |
| `hideVimModeIndicator` | não | "suppresses the built-in `-- INSERT --` text below the prompt" |

Outros valores de `type` além de `"command"`: **NÃO DOCUMENTADO**.

Escopo do arquivo (settings-reference): `statusLine` — "Location in settings: Any file (User, Project, Local, or Managed)". Ou seja, **`.claude/settings.json` de projeto é local válido** — que é exatamente onde o CLI já mescla.

Chave irmã `subagentStatusLine`, mesmo shape, contrato diferente (recebe `columns` e um array `tasks`; saída é uma linha JSON por row). Fora do escopo da V1, mas existe e é vizinha da nossa chave.

## Contrato de saída

Recarga: "Claude Code reloads settings automatically and runs your script as soon as you save the file."

Remoção documentada: "Run `/statusline` and ask it to remove or clear your status line (e.g., `/statusline delete`, `/statusline clear`, `/statusline remove it`). You can also **manually delete the `statusLine` field from your settings.json**."

## Limites e cotas

- `padding` padrão `0`; `refreshInterval` mínimo `1` segundo. Máximo: **NÃO DOCUMENTADO**.
- Renderização: "The status line renders in its own row above the built-in footer badges and does not replace them."
- Custo colateral de instalar uma barra custom: "Claude Code stops showing most of the footer's keyboard hints, including `esc to interrupt`, the `? for shortcuts` fallback, and the `hold space to speak` voice dictation hint." **Instalar a barra do Expx tira as dicas de teclado do rodapé do usuário.**

## Erros conhecidos e tratamento

Três gates administrativos desligam a barra, dois deles em silêncio:

| Gate | Comportamento verbatim |
|---|---|
| `disableAllHooks: true` | "Claude Code runs only a `statusLine` from managed settings, and with no managed `statusLine` the status line is disabled." |
| `allowManagedHooksOnly` (managed settings) | "your custom status line **disappears without warning**" |
| Workspace trust não aceito | "the status line stays blank, and `claude --debug` logs `Status line command skipped: workspace trust not accepted`" |

Justificativa do último: "Because `statusLine` executes a shell command, Claude Code runs it under the same workspace trust rule as hooks in settings files."

**Windows** (trap documentado): "On Windows, Claude Code runs status line commands through Git Bash when Git Bash is installed, or through PowerShell when Git Bash is absent." E: "Git Bash treats unquoted backslashes as escape characters, so a Windows-style path such as `C:\Users\username\script.mjs` reaches the script runner with its separators removed and **the command fails without a visible error**. Write file paths in the `command` string with forward slashes."

## Riscos para a nossa implementação

1. O caminho gravado em `command` **precisa usar barras normais**, mesmo no Windows, sob pena de falha silenciosa. `path.join` do Node produz `\` no Windows — o valor gravado no settings tem de ser normalizado.
2. `.expx/statusline.sh` é caminho relativo à raiz do projeto. A doc não afirma qual é o CWD do script nem se há expansão de `$CLAUDE_PROJECT_DIR` no `command` da statusLine (os hooks usam isso, `src/harness/settings.ts:130`). **Lacuna registrada.**
3. Três gates podem deixar a barra invisível sem erro. O `doctor` que verifica "barra configurada" pode dizer OK e a barra não aparecer — vale mencionar `claude --debug` na correção do achado.
4. Instalar a barra tem custo visível (some as dicas do rodapé). Isso reforça pedir antes de instalar, e não instalar por padrão.
5. `/statusline` do próprio Claude Code escreve em `~/.claude/` e **atualiza o settings automaticamente** — ou seja, o usuário pode ter uma barra que ele nunca editou à mão. A regra "nunca substituir em silêncio" cobre exatamente esse caso.

## Fonte

https://code.claude.com/docs/en/statusline e https://code.claude.com/docs/en/settings-reference — acessados em 2026-08-30
