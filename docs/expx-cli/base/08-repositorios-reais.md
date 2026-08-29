# Os cinco repositórios — estrutura real verificada

Área externa. Substitui a presunção do `04-skills-do-ecossistema.md` por fato: os cinco repositórios foram clonados e inspecionados.

## Contrato de entrada

Todos os cinco existem, são **públicos** (clone sem credencial) e **nenhum tem uma única tag**:

```
git ls-remote --tags --heads https://github.com/bittencourtthulio/<skill>
→ sprintx  4e3570c9  refs/heads/main   (nenhuma tag)
→ runx     96d392be  refs/heads/main   (nenhuma tag)
→ legadox  0c933d20  refs/heads/main   (nenhuma tag)
→ stackx   babcd943  refs/heads/main   (nenhuma tag)
→ mergex   e3214e14  refs/heads/main   (nenhuma tag)
```

Branch padrão: `main` nos cinco.

### DOIS layouts distintos — o achado principal

**Layout A — harness embutido** (`sprintx`, `stackx`, `mergex`):

```
.claude/skills/<nome>/SKILL.md + references/ + assets/
.claude/commands/<nome>-*.md
.opencode/command(s)/<nome>-*.md
```

**Layout B — raiz plana** (`runx`, `legadox`):

```
skill/SKILL.md + references/ + assets/
commands/<nome>-*.md
(sem .opencode/)
```

Tamanho: 44 a 51 arquivos por repositório.

### Divergência singular/plural em `.opencode/`

| Skill | Pasta |
|---|---|
| `sprintx` | `.opencode/command/` (**singular**) |
| `stackx` | `.opencode/commands/` (plural) |
| `mergex` | `.opencode/commands/` (plural) |
| `runx`, `legadox` | não têm `.opencode/` |

As duas formas funcionam no OpenCode (glob `{command,commands}/**/*.md`), mas só o plural é documentado — ver `06-opencode.md`.

### Nome da skill

Os cinco têm `name:` no frontmatter igual ao nome do repositório e ao nome da pasta que os contém: `sprintx`, `runx`, `legadox`, `stackx`, `mergex`. Atende a regra do OpenCode de que `name` deve bater com a pasta.

### Comandos por skill

| Skill | Comandos |
|---|---|
| `sprintx` | 8: `sprintx`, `-base`, `-descoberta`, `-sprints`, `-orquestrador`, `-auditoria`, `-executar`, `-estimar` |
| `runx` | 6: `runx`, `-causa`, `-plano`, `-fix`, `-qa`, `-relatar` |
| `legadox` | 6: `legadox`, `-caracterizar`, `-divida`, `-manual`, `-perfil`, `-raio` |
| `stackx` | 5: `stackx`, `-atualizar`, `-check`, `-detectar`, `-migracao` |
| `mergex` | 7: `mergex`, `-abrir`, `-atencao`, `-check`, `-pr`, `-qa`, `-revisar` |

Total: 32 comandos.

## Contrato de saída

Cada repositório traz seu próprio `install.sh` (`sprintx`, `runx`, `legadox` — verificado). O do `runx` aceita `--global`, `--claude`, `--opencode`, `--force`, `--dry-run`, copia `skill/` para `<skills>/runx` e `commands/` para o diretório de comandos, e pergunta antes de sobrescrever quando há TTY.

**O CLI expx substitui esses cinco instaladores.**

## Limites e cotas

- Nenhuma tag em nenhum repositório → **a regra de "maior tag semântica" do promptcli2.md:21 não tem o que resolver hoje**. Os cinco caem no fallback de branch padrão, e o CLI é obrigado a avisar que nenhuma skill está travada em versão publicada (promptcli2.md:22-23).
- Nomes no npm — todos livres (HTTP 404 no registry em 2026-08-29): `expx`, `@expx/cli`, `@expx/painel`. **O painel nunca foi publicado**, então não existe usuário instalado para quebrar.

## Erros conhecidos e tratamento

Verificação de referência para fora da própria pasta, nas cinco skills:

```
grep -rn '\.\./' <pasta-da-skill>  →  0 ocorrências em todas as cinco
```

Nenhuma skill referencia caminho fora da própria raiz. A regra crítica do promptcli1.md:81-84 está satisfeita hoje pelas cinco, e a verificação automática permanece como proteção contra regressão futura.

## Riscos para a nossa implementação

1. **O CLI precisa de um normalizador de layout.** Dois layouts distintos (A e B) significam que "buscar a skill no repositório" não é copiar uma pasta fixa: é localizar `SKILL.md`, tomar o diretório que o contém como raiz da skill, e localizar os comandos em `.claude/commands/` ou `commands/`. Isso é uma camada própria, testável com fixtures dos dois layouts.
2. **Os "patches de integração" do `legadox` são prompts que REESCREVEM a skill destino.** `legadox/docs/integracao/patch-sprintx.md` começa com "Você vai aplicar o patch do legadox na skill sprintx... não peça autorização para editar arquivos". Isso colide frontalmente com promptcli2.md:115 ("O CLI busca e empacota, **nunca escreve skill**"). O CLI não pode aplicar esses patches; no máximo pode informar que existem e apontar o caminho.
3. **O `mergex` NÃO usa patch.** Ele resolve a integração por reference interno (`references/integracao/sprintx.md`, `runx.md`, `legadox.md`, `stackx.md`), que já vem dentro da própria skill. Ou seja, "mergex dispara os patches de integração" (promptcli1.md:62) descreve algo que, no repositório real, é auto-contido — nada a disparar.
4. O gatilho do `legadox` é o arquivo `docs/legado/PERFIL.md` no projeto, não uma configuração do CLI. O `stackx` tem `references/integracao/` análogo. As "camadas" se ativam por convenção de arquivo, não por instalação.
5. `sprintx` usa `.opencode/command/` singular enquanto os outros usam plural — se o CLI copiar cegamente a pasta do repositório, produz projetos inconsistentes. O CLI deve normalizar para a forma documentada (plural).

## Fonte

Clone `--depth 1` dos cinco repositórios `https://github.com/bittencourtthulio/<skill>` em 2026-08-29; `git ls-remote --tags --heads`; `registry.npmjs.org`; leitura de `legadox/docs/integracao/patch-sprintx.md`, `mergex/.claude/skills/mergex/references/integracao/sprintx.md`, `runx/install.sh`.
