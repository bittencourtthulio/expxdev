# Stack, build e testes deste repositório

Área interna. O dialeto técnico que o código novo do CLI é obrigado a seguir.

## Contrato de entrada

Stack declarada (`package.json`, `tsconfig.json`):

| Item | Valor |
|---|---|
| Módulos | ESM (`"type": "module"`) |
| TypeScript | `^5.6.0`, `strict: true` |
| `module` / `moduleResolution` | `NodeNext` (obriga extensão `.js` nos imports relativos) |
| `target` | `ES2022` |
| Node mínimo | `>=20.19.0` |
| Runner de teste | **Vitest** `^4.0.0` |
| Validação | **zod** `^4.0.0` |
| Observação de arquivo | **chokidar** `^5.0.0` |
| WebSocket | **ws** `^8.18.0` |
| YAML | **yaml** `^2.5.0`; nos testes, **gray-matter** `^4.0.3` (devDependency) |
| UI | React 18 + Vite 8 |

Flags estritas ligadas em `tsconfig.json:6-8,10`: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`.

Scripts (`package.json:12-19`):

| Script | Comando |
|---|---|
| `build` | `npm run build:server && npm run build:ui` |
| `build:server` | `tsc -p tsconfig.json` |
| `build:ui` | `vite build` |
| `test` | `vitest run` |
| `typecheck` | `tsc -p tsconfig.json --noEmit && tsc -p ui/tsconfig.json --noEmit` |
| `prepublishOnly` | `npm run typecheck && npm test && npm run build` |

## Contrato de saída

- `tsc` compila `src/**/*.ts` para `dist/`, com `declaration` e `sourceMap`, excluindo `**/*.test.ts` (`tsconfig.json:17-19`).
- `vite build` compila `ui/` para `ui/dist` (`vite.config.ts:6`).
- `files` do pacote publicado: `dist`, `ui/dist`, `README.md`, `LICENSE`.

## Limites e cotas

- Vitest roda em DOIS projetos separados (`vitest.config.ts:6-30`):
  - `servidor`: `src/**/*.test.ts`, `environment: node`, `testTimeout: 20000`
  - `ui`: `ui/src/**/*.test.{ts,tsx}`, `environment: jsdom`, `testTimeout: 20000`
- Testes ficam **ao lado** do arquivo testado (`src/cli/argumentos.test.ts` ao lado de `src/cli/argumentos.ts`), não em pasta separada.
- Fixtures ficam em `fixtures/<nome-do-cenario>/`, com caminho relativo à raiz do repositório dentro do teste (`src/fixtures.test.ts:6-7`).

## Erros conhecidos e tratamento

- `moduleResolution: NodeNext` obriga o sufixo `.js` em todo import relativo, inclusive de arquivo `.ts` (visível em `src/cli/principal.ts:6-7`). Esquecer o sufixo é erro de compilação.
- `verbatimModuleSyntax` obriga `import type { X }` para importar apenas tipos (padrão em `src/servidor/painel.ts:1-4`).

## Riscos para a nossa implementação

1. A F2 do promptcli2.md diz "Testes com o runner já usado no projeto; se não houver, Vitest" — **já existe Vitest**, então está decidido: Vitest. Não é pergunta.
2. O promptcli2.md diz "Framework de CLI com subcomando e seleção múltipla interativa, escolhido na F3 a partir do que já existe no projeto". Hoje **não existe** nenhuma dependência de CLI/prompt no `package.json` — o parser é escrito à mão. Então "a partir do que já existe" significa: ou escrever à mão de novo, ou introduzir dependência nova. Decisão da F2/F3.
3. Nenhuma dependência de rede/HTTP-client existe no projeto (só `ws`). Buscar skills em repositórios GitHub exige `fetch` nativo do Node (disponível ≥18) ou `git` como subprocesso. Decisão de arquitetura.
4. `prepublishOnly` roda typecheck + test + build: qualquer teste vermelho impede a publicação. Bom para o método, mas significa que a suíte de fixtures do CLI precisa ser executável sem rede.

## Fonte

`package.json`, `tsconfig.json`, `ui/tsconfig.json`, `vitest.config.ts`, `vite.config.ts`, `.npmignore`, `.gitignore`, `src/fixtures.test.ts` — lidos em 2026-08-29.
