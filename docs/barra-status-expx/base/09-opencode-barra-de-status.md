# OpenCode — existe barra de status customizável?

## Contrato de entrada

**Não existe.** Não há chave de configuração, hook, ou comando externo pelo qual o OpenCode aceite uma barra de status fornecida pelo usuário.

Afirmação da própria issue oficial do repositório, verbatim:

> "**OpenCode currently renders the status bar in SolidJS with no user-facing customization.**"
> — issue #30295, "Feature: Custom statusLine via shell script (like Claude Code)", status **Closed**, 2026-06-01, https://github.com/anomalyco/opencode/issues/30295

## Contrato de saída

Não se aplica: não há mecanismo.

## Limites e cotas

Confirmação por ausência na documentação oficial:

- `https://opencode.ai/docs/tui/` documenta tema, keybinds, scroll, cursor, mouse e notificações — **nenhum slot de statusline nem comando externo para o rodapé**.
- O índice de `https://opencode.ai/docs/` (Configure: Tools, Rules, Agents, Models, Themes, Keybinds, Commands, Formatters, Permissions, Policies, LSP Servers, MCP servers, ACP Support, Agent Skills, References, Custom Tools) **não tem página de statusline**.

## Erros conhecidos e tratamento

Pedidos abertos, nenhum deles contrato:

| Issue | Título | Situação |
|---|---|---|
| #30295 | Custom statusLine via shell script (like Claude Code) | Closed |
| #23539 | [FEATURE]: Plugin API for custom status bar widgets | aberta |
| #8619 | [FEATURE]: Native StatusLine Hook for Plugins (Context-Free Display) | aberta |
| #11774 | Implement StatusBar component | aberta |

Soluções de comunidade, fora de contrato: `ocstatusline` (github.com/amirlehmam/ocstatusline), `opencode-subagent-statusline` (npm).

A **API de plugin do OpenCode para status bar é NÃO DOCUMENTADA** — é justamente o que as issues #23539 e #8619 pedem.

## Riscos para a nossa implementação

1. A lacuna está **resolvida no sentido negativo**: não há mecanismo equivalente. O item "FORA DE ESCOPO NA V1 — barra para o OpenCode, enquanto a lacuna não estiver resolvida" fica confirmado, e por um motivo mais forte do que "não sabemos": sabemos, e não existe superfície onde encaixar.
2. Portar a barra para OpenCode não é mapear configuração — passa por SDK/plugin com API que ainda não existe. Não é detalhe de implementação; é dependência externa.
3. Consequência prática para o CLI: num `init --harness opencode` **sem** `claude`, a pergunta da barra não deve nem aparecer, porque não há onde instalar. Com os dois harness, a barra é instalada só do lado Claude Code, e o CLI deve dizer isso em vez de deixar a impressão de paridade.
4. O `estado.json` continua correto e inofensivo sem barra — como o próprio `docs/contrato/CONTRATO-expx-estado.md` já previa na Ressalva.

## Fonte

- https://github.com/anomalyco/opencode/issues/30295 — acessado em 2026-08-30
- https://opencode.ai/docs/ e https://opencode.ai/docs/tui/ — acessados em 2026-08-30
- Issues https://github.com/anomalyco/opencode/issues/23539, /8619, /11774 — acessadas em 2026-08-30
