# Bibliotecas de interface de terminal no projeto

> A especificação manda não introduzir dependência nova sem necessidade, e usar as já presentes se derem conta.
> **Conclusão: não há nenhuma biblioteca de terminal disponível em runtime. Não há nada para reaproveitar.**

## Contrato de entrada

Dependências de **produção** declaradas em `package.json` — as únicas que existem quando o pacote é instalado por um usuário:

| Pacote | Versão | Serve para TUI? |
|---|---|---|
| `chokidar` | `^5.0.0` | não — observação de arquivos |
| `ws` | `^8.18.0` | não — websocket do painel |
| `yaml` | `^2.5.0` | não — frontmatter |
| `zod` | `^4.0.0` | não — validação de schema |

Dependências de **desenvolvimento** relevantes: `react`, `react-dom`, `vite`, `vitest`, `typescript`, `jsdom`, `@testing-library/*`, `gray-matter`, `@types/*`. Nenhuma é de terminal, e nenhuma está disponível em runtime — `package.json` publica apenas `dist`, `ui/dist`, `nucleo`, `README.md` e `LICENSE` (campo `files`).

## Contrato de saída

Busca por pacotes de terminal em `node_modules` (`chalk|ink|blessed|kleur|picocolors|ansi|cli-|term|colors|yoga|log-update|boxen`) devolve exatamente três, **todos transitivos de devDependencies**, confirmado por `npm ls`:

| Pacote | Versão | Trazido por |
|---|---|---|
| `picocolors` | 1.1.1 | `@testing-library/jest-dom`, `@babel/code-frame`, `postcss` (via `vite`) |
| `ansi-styles` | 5.2.0 | `pretty-format` (via `@testing-library/dom`) |
| `ansi-regex` | 5.0.1 | `pretty-format` (via `@testing-library/dom`) |

Nenhum dos três é dependência direta. Todos somem numa instalação de produção (`npm i --omit=dev`, ou `npx expxdev`). **Usá-los seria depender de dependência transitiva de devDependency** — quebra silenciosa na mão do usuário.

## Limites e cotas

Recursos de terminal disponíveis sem nenhuma dependência, na plataforma declarada (Node `>=20.19.0`, `package.json` campo `engines`):

- `process.stdout.isTTY` — já usado em `src/cli/expx.ts:39` e `expx.ts:151`.
- `process.stdout.columns` / `rows` — **não usado em lugar nenhum do projeto hoje**.
- `process.stdout.on("resize", ...)` — idem.
- `process.stdin.setRawMode()` — **não usado em lugar nenhum**.
- `node:readline` — usado, mas só para pergunta e resposta em linha (`src/cli/perguntar.ts:1`), não para desenho de tela.
- Sequências ANSI escritas à mão — **nenhuma ocorrência no projeto**.

Busca por `isTTY|setRawMode|.columns|NO_COLOR|x1b|u001b` em `src/**/*.ts`, excluindo testes, devolve **duas linhas apenas**, ambas de `isTTY` em `src/cli/expx.ts`.

## Erros conhecidos e tratamento

- `NÃO DOCUMENTADO`: convenção do projeto para cor no terminal. Não existe função de cor, constante de código ANSI, nem tratamento de `NO_COLOR` em nenhum arquivo.
- `NÃO DOCUMENTADO`: convenção para largura de terminal. Nenhuma leitura de `columns` existe.
- O único precedente de saída formatada é o bloco de texto do painel em `src/cli/principal.ts:57-70`: `process.stdout.write` de linhas prontas, com indentação de dois espaços e separador `·`, sem cor e sem emoji. É o estilo visual vigente do projeto.

## Riscos para a nossa implementação

1. **Toda a camada de desenho é construção nova.** Cor, largura, truncamento, redesenho sem piscar, restauração do terminal na saída — nada disso tem precedente no repositório. É o maior bloco de trabalho realmente novo da feature; o parser, ao contrário, está pronto.

2. **A regra "sem cor quando a saída não for terminal" é sobre `stdout.isTTY` sozinho**, e não sobre a função `ehInterativo()` existente (`expx.ts:38-40`), que exige `stdin` **e** `stdout`. Reusar `ehInterativo()` para decidir cor seria errado: em `expx watch | less` o `stdin` continua TTY e a cor sairia mesmo com `stdout` redirecionado — exatamente o que a especificação proíbe. São duas perguntas distintas com respostas distintas.

3. **`NO_COLOR` não está na especificação nem no projeto.** É convenção de ecossistema amplamente adotada, mas nenhuma fonte deste repositório a afirma. Ver lacuna L-06.

4. **"Redesenho não pode piscar a tela inteira" exige técnica específica** — reposicionar o cursor e reescrever só o que mudou, ou usar o buffer alternativo do terminal. `NÃO DOCUMENTADO` qual das duas o projeto prefere; nenhuma fonte se pronuncia.

5. **"Nunca deixa o terminal quebrado" tem requisito além do `SIGINT`.** O precedente de `principal.ts:78-81` cobre `SIGINT`/`SIGTERM`, mas se o watch usar `setRawMode` ou o buffer alternativo, a restauração também precisa acontecer em exceção não capturada e em `process.on("exit")`. `NÃO DOCUMENTADO` no projeto.

## Fonte

`package.json` (dependências e `files`), `npm ls picocolors ansi-styles ansi-regex`, listagem de `node_modules`, `src/cli/expx.ts:38-40`, `src/cli/perguntar.ts`, `src/cli/principal.ts:57-70`, busca por `isTTY|setRawMode|.columns|NO_COLOR|x1b|u001b` em `src/**/*.ts` — 2026-08-30
