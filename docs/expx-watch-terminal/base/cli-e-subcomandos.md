# CLI e roteamento de subcomandos (`src/cli/`)

## Contrato de entrada

Dois pontos de extensão, ambos em arquivos pequenos:

**1. A lista de subcomandos**, `src/cli/subcomandos.ts:13`:

```ts
export const SUBCOMANDOS = ["init", "panel", "add", "remove", "update", "doctor"] as const;
export type Subcomando = (typeof SUBCOMANDOS)[number];
```

`interpretarSubcomando` (`subcomandos.ts:47`) valida o primeiro token contra essa lista e devolve `{ subcomando, resto }`. Token desconhecido vira erro; `--ajuda`/`--help`/`-h`/vazio devolvem a ajuda.

**2. A tabela de executores**, `src/cli/expx.ts:63`:

```ts
type Executor = (resto: readonly string[], saida: Required<Saida>) => Promise<number>;
const EXECUTORES: Partial<Record<Subcomando, Executor>> = { panel, init, add, remove, update, doctor };
```

Acrescentar `watch` é: um item no array `SUBCOMANDOS`, uma linha na constante `AJUDA` (`subcomandos.ts:23-38`), e uma entrada em `EXECUTORES`. O `Partial<Record<>>` já prevê subcomando declarado sem executor — `expx.ts:186-189` responde "ainda nao esta disponivel nesta versao".

Precedente direto: `panel` delega para `principalPainel(resto)` (`expx.ts:64`), que faz o próprio parsing de opções em `src/cli/argumentos.ts`. O watch pode ter parser próprio pelo mesmo padrão.

## Contrato de saída

- Todo executor devolve `Promise<number>` — o código de saída do processo.
- A saída é **injetável**: `Saida = { escrever?, escreverErro? }` (`expx.ts:23-26`), com padrão para `process.stdout`/`stderr` (`expx.ts:174-175`). O motivo está documentado em `expx.ts:31-35`: capturar `process.stdout` global vaza entre testes paralelos e produz falha intermitente. **Este é o padrão que o watch tem de seguir para ser testável.**
- Binários declarados em `package.json`: `expx` e `expxdev` → `dist/cli/expx-bin.js`; `expx-painel` → `dist/cli/principal.js`.

## Limites e cotas

- Node `>=20.19.0` (`package.json`, campo `engines`).
- `"type": "module"` — ESM, imports com extensão `.js`.
- Dependências de produção, as únicas disponíveis em runtime: `chokidar ^5.0.0`, `ws ^8.18.0`, `yaml ^2.5.0`, `zod ^4.0.0`.
- Testes do CLI: `src/cli/**/*.test.ts`, projeto vitest `cli`, timeout **120 000 ms** (`vitest.config.ts:19-33`). O projeto `servidor` exclui `src/cli/**` e usa timeout de 20 000 ms.

## Erros conhecidos e tratamento

- **Detecção de interatividade exige os dois lados**: `process.stdin.isTTY === true && process.stdout.isTTY === true` (`expx.ts:38-40`). O comentário em `expx.ts:31-37` registra o porquê: `stdout` sozinho não prova que há teclado — em `expx init < /dev/null` o `stdout` continua TTY e o wizard travaria. **A regra de "sem cor quando a saída não for terminal" é sobre `stdout.isTTY` isoladamente**, que é decisão diferente desta.
- Comando longo-vivo: o `panel` registra `SIGINT` e `SIGTERM` e chama `painel.parar()` antes de `process.exit(0)` (`src/cli/principal.ts:78-81`). É o precedente para "sair com a tecla de interrupção restaurando o terminal".
- Detecção de "executado como programa" resolve `realpath` nos dois lados, porque o npm cria symlink em `node_modules/.bin/` e a comparação direta falharia em silêncio (`principal.ts:84-106`).

## Riscos para a nossa implementação

1. **`principal.ts` retorna 0 e deixa o processo vivo pelos handlers de sinal** (`principal.ts:78-83`) — o processo só não morre porque o servidor HTTP segura o event loop. Um watch que apenas observe arquivos precisa segurar o loop explicitamente; o chokidar o faz, mas isso passa a ser condição de correção, não acidente.
2. **`expx panel` aceita `--dir` com padrão `./docs`** (`argumentos.ts:6`). O watch precisa de duas raízes (`docs/` e `.expx/`), então copiar o contrato de opções do painel não basta.
3. **Nenhum código do CLI hoje escreve ANSI, lê `process.stdout.columns` ou usa `setRawMode`.** Busca por `isTTY|setRawMode|.columns|NO_COLOR|x1b|u001b` em `src/**/*.ts` (excluindo testes) devolve só as duas linhas de `expx.ts` citadas acima. Toda a camada de desenho de terminal é construção nova.
4. **A ajuda é uma string literal única** (`subcomandos.ts:23-38`) — acrescentar `watch` mexe num texto que os testes de CLI podem comparar. `NÃO DOCUMENTADO` se algum teste faz asserção sobre o texto integral da ajuda.

## Fonte

`src/cli/expx.ts`, `src/cli/subcomandos.ts`, `src/cli/argumentos.ts`, `src/cli/principal.ts`, `src/cli/perguntar.ts`, `package.json`, `vitest.config.ts` — lidos em 2026-08-30
