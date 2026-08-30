# statusLine — o JSON recebido no stdin

## Contrato de entrada

"Claude Code sends JSON data to your script via stdin." Estrutura completa, **verbatim** da doc:

```json
{
  "cwd": "/current/working/directory",
  "session_id": "abc123...",
  "session_name": "my-session",
  "prompt_id": "550e8400-e29b-41d4-a716-446655440000",
  "transcript_path": "/path/to/transcript.jsonl",
  "model": { "id": "claude-opus-5", "display_name": "Opus" },
  "workspace": {
    "current_dir": "/current/working/directory",
    "project_dir": "/original/project/directory",
    "added_dirs": [],
    "git_worktree": "feature-xyz",
    "repo": { "host": "github.com", "owner": "anthropics", "name": "claude-code" }
  },
  "version": "2.1.90",
  "output_style": { "name": "default" },
  "cost": {
    "total_cost_usd": 0.01234,
    "total_duration_ms": 45000,
    "total_api_duration_ms": 2300,
    "total_lines_added": 156,
    "total_lines_removed": 23
  },
  "context_window": {
    "total_input_tokens": 15500,
    "total_output_tokens": 1200,
    "context_window_size": 200000,
    "used_percentage": 8,
    "remaining_percentage": 92,
    "current_usage": {
      "input_tokens": 8500,
      "output_tokens": 1200,
      "cache_creation_input_tokens": 5000,
      "cache_read_input_tokens": 2000
    }
  },
  "exceeds_200k_tokens": false,
  "prompt_cache": { "warm": true, "caching_observed": true, "ttl": "1h", "expires_at": 1738429200, "requests": 14, "misses": 2, "expected_rebuilds": 1, "hit_ratio": 0.91, "cache_write_tokens": 352000, "miss_recache_tokens": 310200, "last_miss_at": 1738425230, "recache_tokens_if_cold": 45000 },
  "fast_mode": false,
  "effort": { "level": "high" },
  "thinking": { "enabled": true },
  "rate_limits": {
    "five_hour": { "used_percentage": 23.5, "resets_at": 1738425600 },
    "seven_day": { "used_percentage": 41.2, "resets_at": 1738857600 },
    "spend_limit": { "used_percentage": 62.8, "resets_at": 1740787200 }
  },
  "vim": { "mode": "NORMAL" },
  "agent": { "name": "security-reviewer" },
  "pr": { "number": 1234, "url": "https://github.com/anthropics/claude-code/pull/1234", "review_state": "pending" },
  "worktree": { "name": "my-feature", "path": "/path/to/.claude/worktrees/my-feature", "branch": "worktree-my-feature", "original_cwd": "/path/to/project", "original_branch": "main" }
}
```

Campo descrito na tabela mas ausente do exemplo: `pr.kind` — "`mr` when `pr` describes a GitLab merge request. Absent for GitHub pull requests".

### Os campos que a nossa barra usa

| Campo do pedido | Campo do JSON | Observação da doc |
|---|---|---|
| percentual de contexto | `context_window.used_percentage` | "Pre-calculated percentage of context window used" |
| custo da sessão | `cost.total_cost_usd` | ver ressalva abaixo |
| largura do terminal | **não vem no JSON** — env var `COLUMNS` | ver 08 |

**Não existe campo de branch nem de git dirty no JSON.** `workspace.git_worktree` é o nome do worktree, não o branch; `worktree.branch` só aparece dentro de um worktree do Claude Code. Confirma que branch e estado sujo exigem a chamada externa ao versionador, como o pedido já previa.

## Contrato de saída — semântica que muda cálculo

Verbatim, cada um é contrato:

- `cwd` vs `workspace.current_dir`: "Both fields contain the same value; `workspace.current_dir` is preferred for consistency with `workspace.project_dir`."
- `context_window.context_window_size`: "**200000 by default, or 1000000** for models with extended context."
- `context_window.used_percentage`: "calculated from input tokens only: `input_tokens + cache_creation_input_tokens + cache_read_input_tokens`. **It does not include `output_tokens`.**" E: "If you calculate context percentage manually from `current_usage`, use the same input-only formula to match `used_percentage`."
- `exceeds_200k_tokens`: "**a fixed threshold regardless of actual context window size**."
- `cost.total_cost_usd`: "Estimated session cost in USD, computed client-side at list price unless a `modelPricing` table is in effect. **May differ from your actual bill.** Resets to $0 when `/clear` starts a new session. **Before v2.1.211**, the total carried over after `/clear`."
- `rate_limits.*.used_percentage`: "from 0 to 100"; `spend_limit` "can go above 100 once you exceed the limit."
- `effort.level`: "`low`, `medium`, `high`, `xhigh`, or `max` ... Ultracode is not a distinct level and reports as `xhigh`."
- `vim.mode`: "`NORMAL`, `INSERT`, `VISUAL`, or `VISUAL LINE`".
- `pr.review_state`: "`approved`, `pending`, `changes_requested`, or `draft`".

## Limites e cotas — ausência e nulidade

Contrato defensivo, verbatim:

**Podem estar AUSENTES** (chave não existe): `session_name`; `prompt_id` ("appears only after the first user input"); `workspace.git_worktree`; `workspace.repo` ("only inside a git repository with an `origin` remote configured"); `effort`; `vim` ("only when vim mode is enabled"); `agent`; `pr`; `worktree`; `rate_limits` ("only for Claude.ai Pro and Max subscribers... and only after the first API response in the session"); `prompt_cache` ("appears after the main conversation's first API response").

**Podem ser `null`**: `context_window.current_usage` ("`null` before the first API call in a session, and again after `/compact` until the next API call repopulates it"); `context_window.used_percentage` e `remaining_percentage` ("**may be `null` early in the session**").

E a instrução direta: "Handle missing fields with conditional access and null values with fallback defaults in your scripts."

**Isto significa que `used_percentage` pode ser `null` e `cost` pode existir com valor — ou o contrário. Cada campo precisa de tratamento independente.**

Requisitos de versão declarados: `prompt_id` — v2.1.196+; `pr.kind` — v2.1.234+; `rate_limits.spend_limit` e `prompt_cache` — v2.1.251+.

## Erros conhecidos e tratamento

**Aviso de que os campos mudam entre versões: NÃO DOCUMENTADO.** A premissa do pedido ("a documentação avisa que evoluem entre versões") **não se confirma**. O que existe é o inverso: notas pontuais de "Requires Claude Code vX or later" por campo, e uma nota histórica ("Before v2.1.211, the total carried over after `/clear`"). O contrato é aditivo e versionado por campo, não instável.

Isso não anula o risco — campos novos aparecem com versão —, mas muda a mitigação: em vez de "os nomes podem mudar, evite depender deles", é "os nomes são estáveis; a ausência é que precisa ser tratada, e a doc diz exatamente quais campos podem faltar".

Ponto sutil: no exemplo `used_percentage` é inteiro (`8`), mas todos os scripts oficiais aplicam truncamento (`| cut -d. -f1`, `Math.floor(...)`) e o exemplo inline usa `// 0`. **Trate como numérico possivelmente fracionário e possivelmente `null`.**

## Riscos para a nossa implementação

1. Extração por texto (grep/sed) sobre este JSON é inviável: há aninhamento de três níveis (`context_window.current_usage.input_tokens`) e chaves que somem. O pedido já proíbe, e a doc confirma o motivo.
2. `used_percentage` `null` "early in the session" é o caso comum no primeiro render — a barra precisa omitir o campo, não imprimir `null%`.
3. `cost.total_cost_usd` é estimativa ("May differ from your actual bill"). Exibir como custo exato é enganoso; o pedido já diz "quando disponível".
4. O JSON traz `workspace.project_dir` — o caminho para achar `.expx/estado.json` sem depender do CWD do processo. Provavelmente melhor que assumir CWD.

## Fonte

https://code.claude.com/docs/en/statusline — acessado em 2026-08-30
