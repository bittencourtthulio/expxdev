# As cinco skills do ecossistema Expx

Área interna/externa. O que o CLI busca, empacota e instala. Fatos apurados a partir das skills INSTALADAS na máquina (`~/.claude/skills/`), não da documentação dos repositórios.

## Contrato de entrada

As cinco skills e seus repositórios (promptcli1.md:11-16):

| Skill | Repositório | Papel |
|---|---|---|
| `sprintx` | `https://github.com/bittencourtthulio/sprintx` | planeja e executa features novas |
| `runx` | `https://github.com/bittencourtthulio/runx` | ocorrências de manutenção do dia a dia |
| `legadox` | `https://github.com/bittencourtthulio/legadox` | camada para projetos legados |
| `stackx` | `https://github.com/bittencourtthulio/stackx` | descobre o dialeto técnico do repositório |
| `mergex` | `https://github.com/bittencourtthulio/mergex` | versionamento, entrega e revisão de PRs |

Estrutura real observada em `sprintx` e `runx` (as duas que existem em disco):

```
<skill>/
  SKILL.md              frontmatter: name, description
  DECISOES-DA-SKILL.md
  references/*.md       7 a 9 arquivos
  assets/TEMPLATE-*.md  8 a 10 arquivos
```

Frontmatter do `SKILL.md` — apenas duas chaves observadas (`~/.claude/skills/sprintx/SKILL.md:1-4`):

```yaml
name: sprintx
description: Use para planejar e implementar qualquer feature...
```

Comandos correspondentes vivem SEPARADOS das skills, em `~/.claude/commands/` — 13 arquivos observados:

`sprintx.md`, `sprintx-base.md`, `sprintx-descoberta.md`, `sprintx-sprints.md`, `sprintx-orquestrador.md`, `sprintx-auditoria.md`, `sprintx-executar.md`, `runx.md`, `runx-causa.md`, `runx-plano.md`, `runx-fix.md`, `runx-qa.md`, `runx-relatar.md`.

Frontmatter de comando observado (`~/.claude/commands/sprintx-sprints.md:1-4`):

```yaml
description: sprintx F3 — gera o plano de sprints, fases e tasks
argument-hint: [nome-da-feature]
```

O corpo do comando usa `$ARGUMENTS` e **invoca a skill pelo NOME**, não por caminho:

> "Invoque a skill `sprintx` e execute a F3 PLANO seguindo `references/03-plano.md`."

## Contrato de saída

As skills escrevem em `docs/<slug>/` conforme o contrato expx-schema v1 (ver `03-contrato-expx-schema.md`). O CLI **nunca escreve skill** (promptcli2.md:115) — só busca e empacota.

## Limites e cotas

- `sprintx`: 17 arquivos. `runx`: 20 arquivos. Tamanho pequeno, cópia integral é viável.
- Número de referências a `references/` ou `assets/` dentro de cada SKILL.md: **9 em cada** (medido com `grep -c`).

## Erros conhecidos e tratamento

**Verificação do risco de caminho relativo para fora da pasta** — o ponto que o promptcli1.md:81-84 marca como regra crítica:

```
grep -rn "\.\./|~/|/Users/" ~/.claude/skills/sprintx/SKILL.md ~/.claude/skills/sprintx/references/*.md
→ nenhum resultado
```

As skills `sprintx` e `runx` **hoje não referenciam nada fora da própria raiz**. Todas as referências são relativas à raiz da skill (`references/03-plano.md`, `assets/TEMPLATE-tasks.md`), e o próprio SKILL.md declara: "Os caminhos acima são relativos à raiz desta skill".

Isso NÃO dispensa a verificação automática exigida pelo prompt: `legadox`, `stackx` e `mergex` não estão em disco e não foram verificadas — e uma versão futura de qualquer skill pode introduzir a referência externa.

## Riscos para a nossa implementação

1. **`legadox`, `stackx` e `mergex` não existem em disco nesta máquina.** A estrutura delas é presumida igual à de `sprintx`/`runx`, mas isso NÃO está verificado — inclusive se os repositórios existem e são públicos. Lacuna registrada.
2. **Comandos e skills são coisas separadas.** As skills não trazem os comandos dentro delas: em disco, comandos vivem em `~/.claude/commands/`. Se o repositório da skill não contiver a pasta `commands/`, o CLI não tem de onde tirar os comandos para empacotar no plugin. **De onde vêm os comandos** é lacuna crítica.
3. O comando invoca a skill pelo **nome** (`Invoque a skill \`sprintx\``). Se o empacotamento como plugin alterar o nome pelo qual a skill é invocável, todo o corpo dos comandos existentes quebra. A relação entre nome de skill e namespace de plugin é o ponto 3 da pesquisa externa.
4. `mergex` "junto com sprintx ou runx dispara os patches de integração" (promptcli1.md:62) — o que é um "patch de integração", onde ele mora e o que ele altera é **NÃO DOCUMENTADO**. Lacuna.
5. `legadox` e `stackx` são "camadas: sozinhas não fazem nada" (promptcli1.md:60-61) — o mecanismo dessa camada não está documentado. Lacuna.

## Fonte

`~/.claude/skills/sprintx/` (17 arquivos), `~/.claude/skills/runx/` (20 arquivos), `~/.claude/commands/*.md` (13 arquivos), `promptcli1.md`, `promptcli2.md` — lidos em 2026-08-29.
