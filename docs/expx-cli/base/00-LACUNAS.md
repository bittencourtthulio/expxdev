# Lacunas — expx-cli

O que foi procurado na F1. Atualizado após a investigação empírica: 9 das 15 lacunas iniciais foram **RESOLVIDAS por verificação em execução**; o restante virou decisão registrada em `00-DECISOES.md`.

## RESOLVIDAS por experimento — não são mais lacunas

| # | Lacuna original | Resposta obtida | Onde |
|---|---|---|---|
| L-01 | Marketplace local em `settings.json` funciona sem interação? | **NÃO.** Cinco sintaxes testadas em `.claude/settings.json` do projeto, todas `PLUGIN_NAO`. Só funciona via `claude plugin marketplace add` + `claude plugin install`, que gravam caminho ABSOLUTO no settings do USUÁRIO. | `09-validacao-marketplace-local.md` |
| L-02 | De onde vêm os `commands/`? | Vêm do próprio repositório de cada skill, em `.claude/commands/` (layout A) ou `commands/` na raiz (layout B). 32 comandos no total. | `08-repositorios-reais.md` |
| L-04 | `legadox`, `stackx`, `mergex` existem? | **Sim, os cinco existem e são públicos.** Nenhum tem tag; todos só `main`. Dois layouts distintos. | `08-repositorios-reais.md` |
| L-05 | O que é "patch de integração" do `mergex`? | O `mergex` **não usa patch**: resolve por `references/integracao/*.md` interno. Quem tem patch é o `legadox`, e são prompts que REESCREVEM a skill destino — proibido ao CLI (promptcli2.md:115). | `08-repositorios-reais.md` |
| L-06 | O que significa `legadox`/`stackx` serem "camadas"? | Ativam por convenção de arquivo no projeto (`docs/legado/PERFIL.md` para o legadox), não por instalação. | `08-repositorios-reais.md` |
| L-07 | Onde fica o cache de plugin? | `~/.claude/plugins/cache/<marketplace>/<plugin>/<versao>/`, com registro em `installed_plugins.json` (`version: 2`). | `09-validacao-marketplace-local.md` |
| L-08 | Skill no plugin pode referenciar fora da pasta? | **Não.** O plugin é COPIADO para o cache; só a pasta dele vai. Provado, não presumido. Além disso, `source` do marketplace.json que sobe de diretório é rejeitado com `source: Invalid input`. | `09-validacao-marketplace-local.md` |
| L-11 | `npx expx` vs `@expx/cli` | Ambos livres no npm (404), e `@expx/painel` também — **o painel nunca foi publicado**, não há usuário a quebrar. | `08-repositorios-reais.md` |
| L-15 | Colisão entre harnesses | Confirmado: no Claude Code não há colisão (namespace); o risco é só dentro do OpenCode, e some se as skills forem só para `.claude/skills/`. | `05-plugins-claude-code.md`, `06-opencode.md` |

## RESOLVIDAS por decisão registrada em `00-DECISOES.md`

| # | Lacuna | Decisão |
|---|---|---|
| L-03 | Como a skill declara a versão de `expx-schema`? | D-11 |
| L-09 | Limitação de marketplaces por URL | absorvida por D-02 (não se usa marketplace por URL) |
| L-10 | Precedência de skills no OpenCode | D-08 |
| L-12 | Mecanismo de detecção de modificação local | D-09 |
| L-13 | Método de busca e obtenção do "o que mudou" | D-06, D-07 |
| L-14 | Destino do pacote `@expx/painel` | D-01 |

## Lacunas que PERMANECEM abertas

| # | Lacuna | Impacto | Mitigação adotada |
|---|---|---|---|
| L-16 | O comportamento de plugin em `settings.json` do projeto **mudou na v2.1.195** e pode mudar de novo. O experimento vale para a versão instalada em 2026-08-29. | O `init` pode passar a funcionar só com settings, ou o caminho atual pode quebrar. | O `doctor` verifica o EFEITO (a skill aparece?), nunca só a sintaxe do arquivo — D-05. |
| L-17 | As cinco skills não têm tag hoje. A regra de "maior tag semântica" nunca foi exercitada contra um repositório real com tags. | O caminho principal de resolução de versão só será validado com fixture sintética. | Fixture de repositório com tags é obrigatória na sprint de fixtures — D-07. |
