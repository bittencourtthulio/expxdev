# Projeto atual — o painel `@expx/painel`

Área interna. O que já existe neste repositório e que o CLI vai absorver, reaproveitar ou renomear.

## Contrato de entrada

O pacote publicado hoje é `@expx/painel`, versão `0.1.0`, com um único binário declarado:

- `bin`: `{ "expx-painel": "dist/cli/principal.js" }` (`package.json:6-8`)
- `type: "module"` — ESM puro (`package.json:5`)
- `engines.node`: `>=20.19.0` (`package.json:9-11`)

O CLI atual aceita apenas opções, nunca subcomando (`src/cli/argumentos.ts:32-44`):

| Opção | Padrão | Efeito |
|---|---|---|
| `--porta <n>` | `4000` | porta do servidor local; validada na faixa 0–65535 |
| `--dir <caminho>` | `./docs` | pasta de documentação observada |
| `--no-open` | (abre) | não abre o navegador |
| `--dias-bloqueio <n>` | `7` | dias a partir dos quais um bloqueio é antigo |
| `--ajuda` / `--help` / `-h` | — | texto de ajuda |

`interpretar(argv)` (`src/cli/argumentos.ts:60`) devolve `{ ok: true, opcoes }` ou `{ ok: false, erro }` — nunca lança e nunca escreve na saída. Aceita as duas formas `--porta 4000` e `--porta=4000`. Opção desconhecida é erro, não é ignorada (`src/cli/argumentos.ts:106-107`).

## Contrato de saída

`principal(argv)` (`src/cli/principal.ts:31`) devolve `Promise<number>` — o código de saída. Regras observadas:

- argumento inválido → escreve erro + ajuda em `stderr` e devolve `1` (`src/cli/principal.ts:33-36`)
- `--ajuda` → escreve ajuda em `stdout` e devolve `0` (`src/cli/principal.ts:37-40`)
- pasta inexistente → erro em `stderr`, devolve `1` (`src/cli/principal.ts:43-46`)
- sucesso → sobe o painel, imprime URL/estatísticas, registra `SIGINT`/`SIGTERM` e devolve `0`

A detecção de "executado como programa" resolve `realpath` dos dois lados porque o npm cria `node_modules/.bin/expx-painel` como symlink e a comparação direta de `argv[1]` com `import.meta.url` falharia silenciosamente (`src/cli/principal.ts:80-99`). **É o padrão que o binário `expx` novo precisa repetir.**

`iniciarPainel(op)` (`src/servidor/painel.ts:30`) devolve `{ url, urlWebsocket, porta, estado, parar }`.

## Limites e cotas

- O servidor faz bind EXCLUSIVAMENTE em `127.0.0.1`, sem flag, variável ou opção que mude isso — decisão de segurança declarada no código (`src/servidor/http.ts:7-15`).
- O websocket difunde o ESTADO INTEIRO a cada atualização, não um delta (decisão D-28, `src/servidor/painel.ts:21-28`).
- A releitura do projeto é total, nunca incremental (decisão D-27, `src/servidor/estado.ts:11-15`).
- Debounce padrão do observador: `300` ms (`src/servidor/painel.ts:58`).
- Profundidade máxima da varredura: `12` níveis (`src/parser/descoberta/varredura.ts:54`).

## Erros conhecidos e tratamento

- `abrirNavegador` engole qualquer exceção: falhar ao abrir o navegador nunca derruba o painel (`src/cli/principal.ts:16-18`).
- `varrerCandidatos` engole erro de leitura de pasta: "pasta sumiu ou sem permissão: ignora, nunca derruba" (`src/parser/descoberta/varredura.ts:60-63`).
- A pasta de estáticos é procurada em dois candidatos (`../../ui/dist` e `../ui`) e pode ser `undefined`; sem ela, só a API responde (`src/cli/principal.ts:22-29`, `src/servidor/http.ts:20-22`).

## Riscos para a nossa implementação

1. **Renomear o pacote quebra o binário existente.** Hoje é `@expx/painel` com bin `expx-painel`; a feature pede `@expx/cli` com bin `expx`. Quem já instalou o painel depende do nome antigo — a transição precisa ser decidida na F2 (manter os dois bins? deprecar?). É pergunta obrigatória.
2. **O parser de argumentos atual não tem subcomando.** `interpretar` trata qualquer token desconhecido como erro, então `expx init` hoje falharia com "opcao desconhecida: init". A camada de subcomando é código novo, não adaptação.
3. `exactOptionalPropertyTypes: true` e `noUncheckedIndexedAccess: true` estão ligados (`tsconfig.json:6-8`). Isso obriga o padrão `...(x !== undefined ? { k: x } : {})` já usado no projeto — código novo precisa seguir, ou não compila.
4. `.npmignore` exclui `fixtures/`, `docs/`, `scripts/` e `src/` do pacote publicado. Se o CLI passar a precisar de algum arquivo em runtime (por exemplo templates), ele tem que entrar em `files` do `package.json` explicitamente.
5. O painel é **somente leitura** por decisão declarada (`src/index.ts:3-5`, `src/servidor/http.ts:7-15`). O CLI novo ESCREVE em disco. São dois regimes de confiança no mesmo pacote — a fronteira precisa ficar explícita no código e nos testes.

## Fonte

`package.json`, `src/cli/argumentos.ts`, `src/cli/principal.ts`, `src/servidor/painel.ts`, `src/servidor/http.ts`, `src/servidor/estado.ts`, `src/parser/descoberta/varredura.ts`, `src/index.ts` — lidos em 2026-08-29.
