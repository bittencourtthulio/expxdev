# CLI expxdev — catálogo, montagem do plugin e instalação

## Contrato de entrada

`npx expxdev init` instala skills num projeto. A fonte única do que o CLI sabe instalar é `CATALOGO` (`src/nucleo/catalogo.ts`):

```ts
export type Skill = {
  nome: string;
  repositorio: string;
  papel: string;    // texto mostrado na seleção do init
  camada: boolean;  // true = sozinha não faz nada
};
```

Hoje o catálogo tem **cinco** entradas: `sprintx`, `runx` (base) e `legadox`, `stackx` (camadas), mais `mergex` (base). Derivados dele:

- `NOMES` — os nomes na ordem em que a seleção do `init` os apresenta;
- `buscarNoCatalogo(nome)`;
- `ehCamada(nome)` — usado por `src/cli/selecao.ts` para exigir que uma camada venha acompanhada de `sprintx` ou `runx`.

`executarInit(op: OpcoesInit)` (`src/cli/init.ts`) recebe `{ raiz, skills, harness, origens?, referencias? }` e resolve a origem por `origens?.[nome] ?? CATALOGO.find(...)?.repositorio`. Uma skill fora do catálogo falha com `"skill fora do catalogo"` sem abortar as demais.

## Contrato de saída

`ResultadoInit = { ok, instaladas[], falhas[], naoTravadas[], avisos[] }`.

A montagem produz, sob `.expx/`, um marketplace local contendo um plugin (`src/plugin/montagem.ts`):

```
marketplace/
  .claude-plugin/marketplace.json
  plugins/expx/
    .claude-plugin/plugin.json
    skills/<nome>/      <- cópia recursiva da raiz da skill
    commands/<arquivo>  <- comandos da skill
```

`montarPlugin` copia `s.raizSkill` para `skills/<s.nome>` e cada arquivo de `s.comandos` para `commands/`. O comentário registra a restrição: "O nome da pasta tem que continuar igual ao `name` do frontmatter: o OpenCode exige isso para descobrir a skill."

### Detecção de layout

`detectarLayout(raizRepo, nomeEsperado)` (`src/nucleo/layout.ts`) NÃO assume caminho fixo:

1. procura o `SKILL.md` mais raso por busca em largura (profundidade máx. `5`), ignorando `.git`, `node_modules`, `.github`, `dist`;
2. toma o diretório que o contém como `raizSkill`;
3. lê `name:` do frontmatter e exige que bata com `nomeEsperado`;
4. procura comandos no primeiro diretório que existir entre `.claude/commands`, `commands`, `.opencode/commands`, `.opencode/command`, filtrando arquivos `.md` cujo nome seja `<nome>.md` ou comece com `<nome>-`.

O comentário é explícito: "Um layout novo passa a funcionar sem alterar esta camada, desde que o `SKILL.md` exista em algum lugar."

Aplicado ao repositório MemoX (`.claude/skills/memox/SKILL.md`, comandos em `.claude/commands/memox*.md`): o layout é o **embutido**, idêntico ao de `sprintx`/`stackx`/`mergex`. Os cinco arquivos de comando (`memox.md`, `memox-arquivo.md`, `memox-buscar.md`, `memox-indexar.md`, `memox-modulo.md`) casam com o filtro `<nome>.md` ou `<nome>-*`.

### Harness

- Claude Code: `mesclarSettings` (`src/harness/settings.ts`) acrescenta `extraKnownMarketplaces` e `enabledPlugins`, com backup antes e preservando o resto. O comentário avisa que escrever essas chaves **não** instala o plugin — quem instala é `claude plugin install` (`src/harness/instalar.ts`).
- OpenCode: `materializarOpenCode` (`src/harness/opencode.ts`).

## Limites e cotas

- Profundidade máxima da busca por `SKILL.md`: `5` (`layout.ts`, `profundidadeMax = 5`).
- `marketplace.json` valida `plugins` com `.length(1)` (`src/plugin/manifestos.ts`) — um único plugin, com todas as skills dentro.
- `source` do marketplace não pode conter `..`: validado por `.refine()`, com a justificativa medida em `docs/expx-cli/base/09-validacao-marketplace-local.md` ("um `source` que sobe de diretório é rejeitado pelo Claude Code com `source: Invalid input` — medido, não suposto").
- Nenhuma das skills reais tem tag hoje (`src/nucleo/versao.ts` e `base/08-repositorios-reais.md`), então a resolução cai no branch padrão.

## Erros conhecidos e tratamento

- **Repositório inacessível**: reportado em `falhas`, sem abortar as outras. Comentário em `init.ts`: "perder a instalação inteira por causa de um repositório fora do ar é pior que uma instalação parcial declarada."
- **Montagem parcial**: tudo acontece dentro de `escreverAtomico` — "ou o `.expx/` novo aparece completo, ou o anterior permanece intocado."
- **`settings.json` inválido**: `mesclarSettings` devolve `{ ok: false }` e não altera o arquivo.
- **Nome divergente do frontmatter**: `detectarLayout` falha com `nome da skill e "X", esperado "Y"`.

## Riscos para a nossa implementação

1. **O número cinco está escrito em vários lugares.** Acrescentar a sexta skill exige tocar, no mínimo:
   - `src/nucleo/catalogo.ts` — o array e o comentário "As cinco skills do ecossistema Expx";
   - `src/nucleo/catalogo.test.ts:6` — `expect(CATALOGO).toHaveLength(5)`;
   - `src/nucleo/catalogo.test.ts:9` — `expect(NOMES).toEqual([... cinco nomes])`;
   - `README.md` — várias ocorrências de "as cinco skills".
   Os outros "cinco" encontrados (`layout.ts`, `versao.ts`, `caminhos.ts`, `settings.ts`, `instalar.ts`, `compatibilidade.ts`) são **comentários** sobre os repositórios reais, e ficam desatualizados sem quebrar teste — mas ficam errados.
2. **`memox` é camada ou base?** Ele "não tem fluxo próprio: produz um índice que as outras skills consultam" (README do MemoX) — o que é a definição literal de `camada: true` no catálogo. Mas `ehCamada` faz a seleção **exigir** `sprintx` ou `runx` junto, e isso precisa ser conferido contra a intenção.
3. **Hooks não são cobertos pela montagem.** `montarPlugin` copia `skills/` e `commands/`. O MemoX também traz `.claude/hooks/memox-injetar.sh` e `memox-reindexar.sh`, que precisam ser copiados, ter bit de execução e ser registrados em `settings.json` (`UserPromptSubmit` e `Stop`). **Nada disso existe hoje no CLI** — nenhuma das cinco skills atuais tem hook.
4. **`chmod +x` é requisito do MemoX.** A instalação documentada no README dele inclui `chmod +x <projeto>/.claude/hooks/memox-*.sh`. `cpSync` preserva o modo da origem, mas isso depende do modo com que o arquivo chegou ao clone.
5. **O OpenCode não tem hooks.** O README do MemoX declara isso como "lacuna declarada, não paridade garantida".

## Fonte

- `src/nucleo/catalogo.ts`, `src/nucleo/layout.ts`, `src/nucleo/catalogo.test.ts` — acessados em 2026-08-29
- `src/cli/init.ts`, `src/cli/selecao.ts` — acessados em 2026-08-29
- `src/plugin/montagem.ts`, `src/plugin/manifestos.ts` — acessados em 2026-08-29
- `src/harness/settings.ts`, `src/harness/instalar.ts` — acessados em 2026-08-29
- `/Users/thuliobittencourt/Documents/Projetos/MemoX/README.md` (seção Instalação) — acessado em 2026-08-29
- Layout do repositório MemoX conferido por listagem de arquivos — acessado em 2026-08-29
