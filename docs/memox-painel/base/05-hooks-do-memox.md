# Hooks do memox — contrato e o que a instalação exige

## Contrato de entrada

Dois scripts bash, em `.claude/hooks/` do repositório MemoX:

| Arquivo | Evento | Papel |
|---|---|---|
| `memox-injetar.sh` | `UserPromptSubmit` | injeta no contexto o que se sabe sobre os arquivos que o prompt declara que serão tocados |
| `memox-reindexar.sh` | `Stop` | reconstrói o índice quando detecta artefato novo ou alterado |

Ambos leem stdin de forma não bloqueante (`timeout 1 cat`).

Registro exigido em `.claude/settings.json` (README do MemoX, seção Instalação):

```json
{
  "hooks": {
    "UserPromptSubmit": [
      { "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/memox-injetar.sh" }] }
    ],
    "Stop": [
      { "hooks": [{ "type": "command", "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/memox-reindexar.sh" }] }
    ]
  }
}
```

## Contrato de saída

- `memox-injetar.sh`: stdout de texto simples, injetado no contexto do modelo. Silencioso quando não há nada relevante. O bloco emitido é delimitado por `<memoria-expx fonte="memox">` (`memox.py:1342-1347`).
- `memox-reindexar.sh`: nada no stdout. Dispara a reconstrução **em segundo plano** (`( ... ) &`), para não segurar o encerramento da sessão.

Ambos: **saem com `0` SEMPRE**, inclusive em erro. Os dois arquivos declaram isso no cabeçalho ("falha aberta, nunca trava o prompt") e implementam com `trap 'exit 0' ERR`.

### Como os hooks localizam o motor

```bash
DIR_HOOK="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MEMOX_PY="$DIR_HOOK/../skills/memox/assets/memox.py"
[ -f "$MEMOX_PY" ] || exit 0
```

**Este é o detalhe que governa a instalação.** O hook espera o motor em `<pasta-do-hook>/../skills/memox/assets/memox.py`. Com o hook em `.claude/hooks/`, isso resolve para `.claude/skills/memox/assets/memox.py`.

A raiz do projeto é `git rev-parse --show-toplevel`, com fallback para `pwd`.

## Limites e cotas

- `memox-injetar.sh`: "abaixo de 200 ms; sem rede, sem modelo" (cabeçalho). Timeout duro de `2` s na chamada ao motor (`timeout 2`); estourado, o prompt segue sem memória.
- Leitura de stdin: `timeout 1`.
- Requisito de runtime: `python3` no PATH (`command -v python3 || exit 0`). O README do MemoX confirma: "Requisito: `python3`. O motor usa apenas a biblioteca padrão — sem dependência externa, sem rede."

## Erros conhecidos e tratamento

Toda condição de falha resulta em saída limpa e silenciosa:

| Condição | Comportamento |
|---|---|
| `memox.py` ausente | `exit 0` |
| `python3` ausente | `exit 0` |
| Nenhuma pasta de artefato (`docs/relatorios`, `docs/manutencao`, `docs/entregas`, `docs/legado`) | `exit 0` — "inativo, sem erro" |
| Erro inesperado | `trap 'exit 0' ERR` |
| Motor demora demais | `timeout` mata e segue |

O hook é **inerte num projeto sem artefatos do método**. Isso importa: instalar o memox num projeto novo não produz efeito nenhum até o terceiro trabalho fechado.

## Riscos para a nossa implementação

1. **O CLI não instala hooks hoje.** `montarPlugin` (`src/plugin/montagem.ts`) copia apenas `skills/` e `commands/`. Nenhuma das cinco skills atuais tem hook, então a capacidade nunca foi exercida.
2. **O caminho relativo do hook amarra o local de instalação.** `$DIR_HOOK/../skills/memox/assets/memox.py` só resolve se hook e skill forem irmãos. Na árvore do plugin montado pelo CLI, as skills ficam em `.expx/marketplace/plugins/expx/skills/`, **não** em `.claude/skills/`. Copiar o hook para `.claude/hooks/` sem copiar a skill para `.claude/skills/` deixa o hook inerte (sai `0`, silenciosamente — a falha não aparece).
3. **`chmod +x` é parte da instalação documentada.** O README do MemoX manda `chmod +x`. `cpSync` preserva o modo da origem; o clone do git preserva o bit de execução, mas isso precisa ser garantido, não presumido.
4. **`mesclarSettings` hoje só mexe em duas chaves.** Ele escreve `extraKnownMarketplaces` e `enabledPlugins`. Registrar hooks exige mesclar a chave `hooks`, que é um objeto de arrays — merge mais delicado, com risco real de duplicar entradas em reinstalação.
5. **Hook é mecanismo do Claude Code.** No OpenCode, o README do MemoX declara lacuna: "enquanto não houver equivalente mapeado, isso é lacuna declarada, não paridade garantida."
6. **Falha aberta esconde instalação errada.** Como todo caminho de erro sai `0` em silêncio, uma instalação mal feita é indistinguível de um projeto sem artefatos. Um `doctor` que confira isso tem valor desproporcional.

## Fonte

- `/Users/thuliobittencourt/Documents/Projetos/MemoX/.claude/hooks/memox-injetar.sh` — acessado em 2026-08-29
- `/Users/thuliobittencourt/Documents/Projetos/MemoX/.claude/hooks/memox-reindexar.sh` — acessado em 2026-08-29
- `/Users/thuliobittencourt/Documents/Projetos/MemoX/README.md` (seção Instalação) — acessado em 2026-08-29
- `src/plugin/montagem.ts`, `src/harness/settings.ts` — acessados em 2026-08-29
