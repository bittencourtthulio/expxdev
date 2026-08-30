# Lacunas — barra de status do Expx

Uma linha por lacuna: o que se procurou, onde, e o que se achou (ou não). Lacuna vira pergunta obrigatória na F2.

## Sobre o mecanismo do Claude Code

| # | Lacuna | Onde se procurou |
|---|---|---|
| L-01 | **Timeout de execução do script**: valor em ms/s. NÃO DOCUMENTADO. A única contenção documentada é o cancelamento por novo gatilho, não um timeout. | https://code.claude.com/docs/en/statusline, seções "How status lines work", "Tips", "Troubleshooting" |
| L-02 | **Largura máxima da barra em caracteres.** NÃO DOCUMENTADO. Só "limited width" qualitativo, mais as env vars `COLUMNS`/`LINES`. | https://code.claude.com/docs/en/statusline |
| L-03 | **Número máximo de linhas** numa statusLine multi-linha. NÃO DOCUMENTADO. | idem |
| L-04 | **`refreshInterval` máximo.** NÃO DOCUMENTADO; só o mínimo (`1`). | idem |
| L-05 | **Valores de `type`** além de `"command"`. NÃO DOCUMENTADO. | statusline.md e settings-reference |
| L-06 | **Qual é o CWD do processo do script**, e se `$CLAUDE_PROJECT_DIR` é expandido no `command` da statusLine como é nos hooks. NÃO DOCUMENTADO. Afeta como o script acha `.expx/estado.json`. Mitigação disponível: usar `workspace.project_dir` do próprio JSON do stdin. | https://code.claude.com/docs/en/statusline |
| L-07 | **Variáveis de ambiente repassadas ao script** além de `COLUMNS`/`LINES`. NÃO DOCUMENTADO. | idem |
| L-08 | **Encoding esperado do stdout** (UTF-8 explícito) e comportamento com CR-LF. NÃO DOCUMENTADO. | idem |
| L-09 | **Declaração formal de suporte a emoji.** NÃO DOCUMENTADO — há uso em todos os exemplos oficiais, mas nenhuma frase afirmando suporte. | idem |
| L-10 | **Agente `statusline-setup`** na documentação oficial. NÃO DOCUMENTADO; aparece só em fontes terceiras (ClaudeLog, repositório de engenharia reversa de system prompts). Não tratar como contrato. | https://code.claude.com/docs/en/statusline e busca em docs.claude.com |

### Lacuna que o pedido supunha existir, e não existe

| # | Achado |
|---|---|
| L-11 | O pedido pede para registrar que "a documentação avisa que [os nomes dos campos] evoluem entre versões". **Esse aviso NÃO EXISTE.** A doc não traz nenhuma frase de instabilidade. O que existe é o oposto: notas de "Requires Claude Code vX or later" por campo (`prompt_id` v2.1.196+, `pr.kind` v2.1.234+, `rate_limits.spend_limit` e `prompt_cache` v2.1.251+) e uma nota histórica sobre `cost.total_cost_usd` antes da v2.1.211. O contrato é aditivo e versionado por campo. **O risco real não é renome, é ausência** — e a doc lista explicitamente quais campos podem faltar ou vir `null`. Ver `07-statusline-json-do-stdin.md`. |

## Sobre o OpenCode

| # | Lacuna | Situação |
|---|---|---|
| L-12 | **O OpenCode tem mecanismo equivalente?** **RESOLVIDA, no negativo.** Não existe. A issue oficial #30295 afirma: "OpenCode currently renders the status bar in SolidJS with no user-facing customization." Nenhuma página da doc oficial expõe slot de statusline. | https://github.com/anomalyco/opencode/issues/30295, https://opencode.ai/docs/tui/ |
| L-13 | **API de plugin do OpenCode para status bar.** NÃO DOCUMENTADA — é o que as issues #23539 e #8619 pedem, ambas abertas. | https://opencode.ai/docs/ |
| L-14 | Resposta de mantenedor na issue #30295 (fechada, com assignee, sem comentários visíveis na extração) — não foi possível ler o motivo do fechamento. | https://github.com/anomalyco/opencode/issues/30295 |

## Sobre o contrato `expx-estado`

| # | Lacuna | Onde se procurou |
|---|---|---|
| L-15 | **Valores válidos de `raio`.** O contrato traz só o exemplo `"alto"`. O pedido fala em baixa/média/alta e condiciona a exibição do orçamento a "raio médio ou alto" — mas os literais exatos (`medio` sem acento? `media`?) não estão declarados em lugar nenhum. **Bloqueia a regra de exibição.** | `docs/contrato/CONTRATO-expx-estado.md`; a legadox é a dona do campo |
| L-16 | **Valores válidos de `fase`.** O exemplo traz `e3` (runx); a sprintx usa `f1..f6`. O contrato não enumera. A barra imprime o valor cru, então não bloqueia a barra — mas bloqueia o `doctor` decidir se valida enum ou só forma. | `docs/contrato/CONTRATO-expx-estado.md`, `references/00-schema.md` |
| L-17 | **O que fazer diante de `expx_estado` diferente de `1`.** O contrato versiona o arquivo mas não diz o comportamento esperado numa versão futura. | `docs/contrato/CONTRATO-expx-estado.md` |
| L-18 | **Tipos formais dos campos.** O contrato mostra um exemplo, não um schema. Os tipos foram deduzidos do exemplo (ver `03-contrato-expx-estado.md`). Em especial `orcamento_arquivos`/`orcamento_linhas` são **strings** `"n/total"`, não números — deduzido, não afirmado. | `docs/contrato/CONTRATO-expx-estado.md` |
| L-19 | **Quem cria o `.expx/estado.json` na primeira vez**, e se o `init` deve criá-lo vazio. O contrato diz que as skills o mantêm e que o CLI instala a barra, mas não nomeia o criador inicial. | `docs/contrato/CONTRATO-expx-estado.md`, seção "Quem escreve o quê" |
| L-20 | **Como `.expx/estado.json` fica fora do versionador** sendo que `.expx/` inteiro é commitado e o `doctor` reprova `.gitignore` que ignore `.expx/` (`src/doctor/verificadores.ts:53-60`). É preciso ignorar o arquivo sem ignorar a pasta — e ninguém escreve essa linha hoje. | `docs/contrato/CONTRATO-expx-estado.md`, `src/cli/projeto.ts`, `src/doctor/verificadores.ts` |

## Sobre a decisão de implementação

| # | Lacuna | Situação |
|---|---|---|
| L-21 | **Cor "desligada quando a saída não for terminal" é inviável como especificada.** A doc afirma que o Claude Code **captura** o stdout em vez de ligá-lo ao terminal — logo `[ -t 1 ]` é falso sempre, e a barra sairia sem cor em uso normal. Precisa de outro critério (`NO_COLOR`, `TERM=dumb`, flag do `testar`). | https://code.claude.com/docs/en/statusline |
| L-22 | **"A primeira linha do stdout vira a barra" é falso na doc atual**: "each `echo` or `print` statement displays as a separate row". Uma linha só continua sendo escolha legítima, mas é decisão nossa, não imposição do mecanismo. | idem |
| L-23 | **Não há `timeout(1)` no macOS base** para limitar a chamada ao git, como o pedido exige. O padrão portável (background + kill) custa processos extras. Falta decidir a técnica. | medição em 2026-08-30, `10-desempenho-medido.md` |
| L-24 | **Comportamento esperado quando o usuário roda `expx statusline remover` e o backup não existe** (por exemplo, barra instalada por um `init` que criou o settings do zero — nesse caso `mesclarSettings` não faz backup, `src/harness/settings.ts:93-106`). | `src/harness/settings.ts`, `src/harness/backup.ts` |
