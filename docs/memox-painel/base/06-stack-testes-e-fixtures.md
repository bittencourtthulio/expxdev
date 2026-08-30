# Stack, testes e fixtures do painel

## Contrato de entrada

Comandos declarados em `package.json`:

| Script | Comando |
|---|---|
| `test` | `vitest run` |
| `typecheck` | `tsc -p tsconfig.json --noEmit && tsc -p ui/tsconfig.json --noEmit` |
| `build` | `build:server` (tsc) + `build:ui` (vite build) |
| `prepublishOnly` | `typecheck && test && build` |

Runtime: Node `>=20.19.0`. Dependências de produção: `chokidar`, `ws`, `yaml`, `zod`. **Não há dependência de runtime Python** — o motor do memox é externo ao painel.

## Contrato de saída

`vitest.config.ts` define **três projetos** com escopos disjuntos:

| Projeto | Inclui | Ambiente | Timeout |
|---|---|---|---|
| `servidor` | `src/**/*.test.ts` menos `cli`, `teste`, `nucleo`, `plugin`, `harness`, `update`, `doctor` | `node` | 20 s |
| `cli` | `src/{cli,teste,nucleo,plugin,harness,update,doctor}/**/*.test.ts` | `node` | 120 s |
| `ui` | `ui/src/**/*.test.{ts,tsx}` | `jsdom` | 20 s |

O timeout de 120 s no projeto `cli` tem justificativa no arquivo: "Estes testes clonam repositorios git de verdade em pasta temporaria. Sob a carga da suite completa em paralelo, 30s nao bastam."

**Consequência de roteamento**: um teste novo em `src/servidor/` cai no projeto `servidor`; um em `src/nucleo/` cai no `cli`. O arquivo decide o projeto pelo caminho, sem configuração adicional.

### Nomenclatura dos testes

Padrão observado em `src/servidor/http.test.ts` e `ui/src/telas/telas.test.tsx`: cada `it` começa com `integração:` ou `funcional:`.

```ts
it("integração: GET /api/projeto devolve 200 com JSON", async () => { ... });
it("funcional: o projeto servido traz os dois trabalhos da fixture", async () => { ... });
```

Isso espelha o contrato da task da sprintx (`teste_integracao` + `teste_funcional`).

### Fixtures

`fixtures/` contém projetos de verdade em disco:

| Pasta | Papel |
|---|---|
| `fixtures/projeto-ok` | projeto sem violação (2 trabalhos) |
| `fixtures/projeto-ruim` | projeto com violações e rejeições |
| `fixtures/projeto-novo-layout` | layout alternativo `docs/{sprintx,runx,relatorios}` |
| `fixtures/cli/*` | oito cenários do CLI (settings ausente/inválido/válido, gitignore quebrado, lock futuro, skill fora) |

Os testes de servidor apontam direto para elas: `criarServidor({ raiz: "fixtures/projeto-ok", porta: 0 })`.

**As fixtures da UI não são objetos escritos à mão.** `ui/src/telas/fixture.ts` chama o parser real:

```ts
export function estadoFixture(): Estado {
  return lerEstado({ raiz: "fixtures/projeto-ok", diasBloqueio: 7 },
                   new Date("2026-08-29T12:00:00Z")) as unknown as Estado;
}
```

com a justificativa: "Um duplicado escrito à mão passaria a mentir no dia em que o parser mudasse; assim, um teste de tela quebra se o contrato entre as camadas quebrar — que é exatamente o que queremos saber."

A data é **fixa** (`2026-08-29T12:00:00Z`), para o filtro de período ser determinístico.

## Limites e cotas

- Node `>=20.19.0` (`package.json` → `engines`).
- Timeouts: 20 s (servidor, ui), 120 s (cli).
- `files` publicados no npm: `dist`, `ui/dist`, `README.md`, `LICENSE`.

## Erros conhecidos e tratamento

- `prepublishOnly` roda typecheck + testes + build antes de publicar: uma quebra de tipos barra a publicação.
- O `typecheck` cobre **dois** tsconfig (raiz e `ui/`). Um tipo novo em `ui/src/tipos.ts` que não case com o servidor falha aqui, não em runtime.

## Riscos para a nossa implementação

1. **Fixture nova exige projeto em disco.** Para testar a memória, o índice precisa existir como arquivo real numa fixture (`.expx/memoria/indice.json`). Como as fixtures da UI vêm do parser real, não dá para "fingir" o estado num objeto.
2. **`.expx/` em fixture e `.npmignore`.** `fixtures/` não está em `files`, então não vai para o pacote. Mas `.gitignore` do projeto Expx **não** ignora `.expx/memoria/` — verificado: as linhas são `node_modules/`, `dist/`, `ui/dist/`, `*.log`, `.DS_Store`, `promptcli1.md`, `promptcli2.md`. Logo uma fixture com `.expx/memoria/indice.json` **é commitável**. (O `.gitignore` que o motor do memox escreve, `.expx/memoria/`, valeria para o projeto onde o memox roda, não para este repositório — e nenhuma das duas linhas casa com o teste de `expxNoGitignore`, que só reconhece `.expx` exato.)
3. **Fixtures existentes precisam continuar válidas.** Uma chave nova no `Estado` que seja obrigatória quebra a tipagem de `estadoFixture()` se o parser não a produzir para `fixtures/projeto-ok`, que não tem índice de memox. O caso "sem índice" tem que ser representável.
4. **Roteamento de teste por caminho.** Código de leitura do índice em `src/servidor/` cai no projeto `servidor` (20 s, node). Se cair em `src/nucleo/`, vai para o projeto `cli` (120 s) — que é onde os testes de catálogo e montagem já moram.

## Fonte

- `package.json`, `vitest.config.ts`, `.gitignore` — acessados em 2026-08-29
- `src/servidor/http.test.ts`, `ui/src/telas/telas.test.tsx`, `ui/src/telas/fixture.ts` — acessados em 2026-08-29
- `src/cli/projeto.ts` (`expxNoGitignore`), `src/doctor/verificadores.ts` — acessados em 2026-08-29
- Listagem de `fixtures/` — acessada em 2026-08-29
