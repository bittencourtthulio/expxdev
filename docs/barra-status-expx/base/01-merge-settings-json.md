# Merge do `.claude/settings.json` (CLI atual)

## Contrato de entrada

`mesclarSettings(raizProjeto, caminhoMarketplace, hooks)` — `src/harness/settings.ts:82-138`.

- `raizProjeto: string` — a raiz onde vive `.claude/settings.json`.
- `caminhoMarketplace: string` — absoluto de propósito (`settings.ts:78-81`).
- `hooks: readonly HookInstalado[]` — padrão `[]`. `HookInstalado = { skill: string; relativo: string }` (`src/harness/hooks.ts:20-24`).

O caminho do arquivo é fixo: `join(raizProjeto, ".claude", "settings.json")` — `caminhoDoSettings`, `settings.ts:72-74`.

## Contrato de saída

`ResultadoMerge` (`settings.ts:25-27`):

```ts
| { ok: true; criado: boolean; backup?: string }
| { ok: false; erro: string }
```

- `criado` é `!existe` — o arquivo não existia antes.
- `backup` só aparece quando havia arquivo anterior (`settings.ts:137`).
- Erro quando o JSON é inválido (`settings.ts:96-101`) ou quando o conteúdo não é objeto (`settings.ts:102-104`).

Escrita: `writeFileSync(caminho, JSON.stringify(novo, null, 2) + "\n")` — dois espaços de indentação e newline final (`settings.ts:135`).

## Limites e cotas

- O merge só toca três chaves: `extraKnownMarketplaces`, `enabledPlugins` e — condicionalmente — `hooks` (`settings.ts:117-133`). Todo o resto é preservado por spread de `atual` (`settings.ts:118`).
- A chave `hooks` **não é criada** quando não há hook a registrar: `if (hooks.length > 0)` (`settings.ts:125-133`, decisão D-23 citada no comentário). Um projeto sem hook não deve ganhar `hooks: {}` do nada.
- Backup: `<arquivo>.backup-AAAA-MM-DD`, com sufixo numérico `-1`, `-2`… se já existir backup do dia (`src/harness/backup.ts:21-30`). O backup de ontem não é destruído pelo erro de hoje (`backup.ts:17-20`).
- Idempotência do merge de hook: a comparação é pelo `command`, e entrada duplicada não é acrescentada (`settings.ts:41-46`).

## Erros conhecidos e tratamento

| Condição | Comportamento | Referência |
|---|---|---|
| `settings.json` não é JSON válido | `{ ok: false, erro }`, arquivo **não é alterado** | `settings.ts:96-101` |
| Conteúdo não é objeto (array, escalar) | `{ ok: false, erro }` | `settings.ts:102-104` |
| Arquivo não existe | segue com `atual = {}`, sem backup, `criado: true` | `settings.ts:90-106` |
| `enabledPlugins` em array (documentado) ou objeto (real) | `lerPluginsHabilitados` aceita os dois e escreve o objeto | `settings.ts:56-70`, comentário `settings.ts:14-18` |

Quem chama trata a falha como AVISO, não como aborto: `if (!r.ok) avisos.push(r.erro)` — `src/cli/init.ts:135-136`.

## Riscos para a nossa implementação

1. `mesclarSettings` hoje **não tem parâmetro para a chave `statusLine`**, nem qualquer mecanismo de "já existe valor do usuário nesta chave — pergunte". As três chaves atuais são todas de merge aditivo (objeto ou lista). `statusLine` é chave de valor único: acrescentá-la é sobrescrever. A regra do pedido ("NUNCA substituir em silêncio", três saídas) não tem precedente no código atual e precisa ser construída.
2. `mesclarSettings` é síncrona e pura em relação ao terminal — não pergunta nada. A decisão de três saídas exige interação (ou flag), então ela precisa acontecer **antes** da chamada, não dentro dela.
3. A função escreve o arquivo inteiro num único `writeFileSync`. Duas chamadas separadas (uma para o plugin, outra para a statusLine) fariam dois backups no mesmo dia — `fazerBackup` já lida com isso via sufixo numérico (`backup.ts:24-28`), mas produz ruído. Vale considerar uma passagem única.
4. `mesclarSettings` é chamada **apenas quando `harness` inclui `claude`** (`init.ts:133-137`). A barra é mecanismo do Claude Code, então isso está alinhado — mas significa que num init `--harness opencode` a barra não pode ser instalada por esse caminho.

## Fonte

`src/harness/settings.ts`, `src/harness/backup.ts`, `src/harness/hooks.ts`, `src/cli/init.ts` — lidos em 2026-08-30
