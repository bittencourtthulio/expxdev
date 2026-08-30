# statusLine — execução, gatilhos, render e cor

## Contrato de entrada

"Claude Code runs your script with JSON session data on stdin and displays whatever the script prints to stdout."

**Largura do terminal — contrato importante, verbatim:**

> "Claude Code captures your script's output instead of connecting it directly to the terminal, so `tput cols` and language-level width detection **cannot** read the terminal size from inside the script. Read the **`COLUMNS` and `LINES`** environment variables instead. **Claude Code sets these to the current terminal dimensions before running your script.**"

Consequência direta para o requisito "cortando da direita quando não couber": a largura vem de `$COLUMNS`, e **só de lá**. `tput cols` não funciona. Também: como a saída é capturada e não ligada ao terminal, **um teste `[ -t 1 ]` para decidir se liga cor dará sempre falso em produção** — a saída nunca é TTY. Ver riscos.

## Contrato de saída

**A premissa "a primeira linha do stdout vira a barra" é FALSA na doc atual.** Verbatim:

> "**Multiple lines**: each `echo` or `print` statement displays as a separate row."

Há uma seção inteira "Display multiple lines" com exemplo de duas linhas. O pedido especifica UMA linha — isso continua sendo uma escolha de projeto legítima e defensável (a doc avisa que "Multi-line status lines with escape codes are more prone to rendering issues than single-line plain text"), mas **não é uma imposição do mecanismo**. Registrar como decisão, não como restrição herdada.

Render: "The status line renders in its own row above the built-in footer badges and does not replace them." Ocultação temporária: "It temporarily hides during certain UI interactions, including autocomplete suggestions, the help menu, and permission prompts."

## Limites e cotas

### Gatilhos (lista verbatim)

"Your script runs once when a session starts, including when you resume one. After that, it runs again when:
* A new assistant message arrives
* `/compact` finishes
* The permission mode changes
* Vim mode toggles
* You change the `command` in your `statusLine` settings
* A `refreshInterval` timer elapses, if you set one
* A rate-limit window in the data your script last received reaches its `resets_at` time
* A warm prompt cache in the data your script last received reaches its `expires_at` time"

**Não há gatilho de alteração de arquivo.** O `estado.json` mudando não redesenha a barra: ela só atualiza na próxima mensagem do assistente. Isso confirma a definição de pronto do pedido ("atualizando ao fechar cada task") — funciona porque fechar task é seguido de mensagem do assistente —, mas o mecanismo é indireto.

### Debounce e cancelamento

- **300 ms**, verbatim: "Claude Code debounces updates at **300ms**, so rapid changes batch together and your script runs once after the changes stop. **A change to the `command` itself skips the debounce**: Claude Code runs the new command right away."
- **Cancelamento**, verbatim: "If a new update triggers while your script is still running, **Claude Code cancels the in-flight script**." Repetido no Troubleshooting.

Confere exatamente com o que `docs/contrato/CONTRATO-expx-estado.md` já afirmava.

### Limites sem número

| Limite | Situação |
|---|---|
| Timeout do script (ms/s) | **NÃO DOCUMENTADO** — não há timeout numérico; a contenção é o cancelamento por novo gatilho |
| Largura da barra em caracteres | **NÃO DOCUMENTADO** — só "limited width" + as env vars |
| Número máximo de linhas | **NÃO DOCUMENTADO** |
| `refreshInterval` máximo | **NÃO DOCUMENTADO** — só o mínimo, `1` |

## Erros conhecidos e tratamento

Verbatim:

- "Scripts that exit with non-zero codes or produce no output **cause the status line to go blank**." → **o script precisa sair 0 e imprimir algo em todo caminho**, inclusive no de erro.
- "Slow scripts block the status line from updating until they complete. **Keep scripts fast to avoid stale output.**"
- "Your status line script runs frequently during active sessions. Commands like `git status` or `git diff` can be slow, especially in large repositories."
- "**Cache slow operations**: your script runs frequently during active sessions, so commands like `git status` can cause lag."
- "The status line runs locally and **does not consume API tokens**."
- "Complex escape sequences (ANSI colors, OSC 8 links) can occasionally cause garbled output if they overlap with other UI updates."
- "On narrow terminals, these notifications may truncate your status line output."

**Padrão de cache oficial**, com a armadilha nomeada: o exemplo usa `CACHE_MAX_AGE=5` segundos e alerta: "The cache filename needs to be stable across status line invocations within a session, but unique across sessions ... Process-based identifiers like `$$`, `os.getpid()`, or `process.pid` change on every invocation and defeat the cache. **Use the `session_id` from the JSON input instead**: it's stable for the lifetime of a session and unique per session."

Debug: "Run `claude --debug` to log the exit code and stderr from the first status line invocation in a session."

Teste com mock, verbatim da doc:

```
echo '{"model":{"display_name":"Opus"},"workspace":{"current_dir":"/home/user/project"},"context_window":{"used_percentage":25},"session_id":"test-session-abc"}' | ./statusline.sh
```

— o precedente direto para o `expx statusline testar`.

## Cor, emoji e links

- **ANSI: suportado**, verbatim: "**Colors**: use ANSI escape codes like `\033[32m` for green (**terminal must support them**)." Exemplos oficiais usam `\033[32m`, `\033[33m`, `\033[31m`, `\033[36m`, `\033[0m`.
- **OSC 8 (links): suportado, condicional** — "Requires a terminal that supports hyperlinks like iTerm2, Kitty, or WezTerm." Trap: "If escape sequences appear as literal text like `\e]8;;`, use `printf '%b'` instead of `echo -e`." Fora do escopo da V1.
- **Emoji**: usado em todos os exemplos oficiais (`📁`, `🌿`, `💰`, `⏱️`) e blocos Unicode (`▓ ░ █`). Declaração formal de suporte: **NÃO DOCUMENTADO** — demonstrado por exemplo, não afirmado por frase.

## Riscos para a nossa implementação

1. **A decisão antecipada "cor desligada automaticamente quando a saída não for terminal" colide com o mecanismo.** A doc afirma que o Claude Code captura o stdout em vez de ligá-lo ao terminal — então `[ -t 1 ]` é falso *sempre*, e a barra sairia sem cor em uso normal. O desligamento precisa de outro critério (`NO_COLOR`, `TERM=dumb`, ou uma flag do `testar`). Isto é achado para a F2, não detalhe.
2. `printf '%b'` em vez de `echo -e` é a forma portável de emitir escapes — `echo -e` não é POSIX e o `/bin/sh` do Debian (dash) não o suporta.
3. Sair não-zero apaga a barra. Todo caminho de erro tem de sair `0` com uma linha — mesmo padrão dos hooks do memox (`src/doctor/verificadores.ts:257-262`: "Todo caminho de erro dos hooks do memox termina em `exit 0`, de propósito: falha aberta nunca trava o prompt").
4. O corte por largura depende de `$COLUMNS`, que pode não estar setado num teste ou num `expx statusline testar` fora do Claude Code — precisa de fallback (80).
5. Cache por `session_id` é o padrão oficial para a chamada ao git. Como o `git status` é justamente a chamada externa que o pedido permite, vale avaliar cachear — mas cache introduz escrita em disco a cada render, o que tem custo próprio.

## Fonte

https://code.claude.com/docs/en/statusline — acessado em 2026-08-30
