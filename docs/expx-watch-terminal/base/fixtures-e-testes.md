# Fixtures e convenções de teste do projeto

## Contrato de entrada

Três projetos vitest, isolados por pasta (`vitest.config.ts`):

| Projeto | Inclui | Ambiente | Timeout |
|---|---|---|---|
| `servidor` | `src/**/*.test.ts` **exceto** `src/cli/`, `src/teste/`, `src/nucleo/`, `src/plugin/`, `src/harness/`, `src/update/`, `src/doctor/` | `node` | 20 000 ms |
| `cli` | `src/cli/**`, `src/teste/**`, `src/nucleo/**`, `src/plugin/**`, `src/harness/**`, `src/update/**`, `src/doctor/**` | `node` | 120 000 ms |
| `ui` | `ui/src/**/*.test.{ts,tsx}` | `jsdom` | 20 000 ms |

Um `src/watch/**` novo cairia no projeto `servidor` (timeout 20 s); um `src/cli/watch.test.ts` cairia no projeto `cli` (timeout 120 s). A escolha de pasta decide o timeout — não é neutra.

Teste fica **ao lado** do código: `argumentos.ts` / `argumentos.test.ts`. Sem pasta `__tests__`. Comandos: `npm test` (`vitest run`), `npm run typecheck` (tsc nos dois tsconfig), `npm run build`.

## Contrato de saída

Auxiliares de teste existentes, em `src/teste/`:

- **`projetoTemporario(origem?)`** (`src/teste/projeto-temporario.ts:19`) → `{ raiz, descartar }`. Cria `mkdtemp` e, com `origem`, copia a fixture para dentro. O comentário registra a razão (`projeto-temporario.ts:5-11`): o CLI escreve de verdade, então testá-lo exige projeto real e não mock de fs; copiar mantém as fixtures do repositório intactas.
- **`repoFixture`** (`src/teste/repo-fixture.ts`) — repositórios git locais no lugar da rede. Não se aplica ao watch.
- **`layouts-fixture.ts`** — os dois layouts de pasta de trabalho.

Fixtures de projeto existentes, em `fixtures/`:

| Fixture | O que cobre |
|---|---|
| `projeto-ok/` | trabalho sprintx (`exportacao-csv`, `estagio: f6`, `status: em_andamento`) e ocorrência runx (`OC-2026-0142`, `estagio: e4`) — layout antigo |
| `projeto-novo-layout/` | os mesmos dois trabalhos no layout `docs/sprintx/features/` e `docs/runx/ocorrencias/` |
| `projeto-ruim/` | `sem-frontmatter`, `yaml-invalido`, `kind-desconhecido`, `enum-errado` (`estagio: F3`, `status: Concluída`), `chave-ausente`, `schema-futuro`, `pasta-sem-orquestrador`, `violacoes` |
| `projeto-memoria/`, `projeto-memoria-corrompida/` | índice do memox |
| `cli/projeto-limpo/`, `cli/projeto-com-expx/`, `cli/quebrado-*` | instalação do CLI |

O padrão de validação de fixture está em `src/fixtures.test.ts:13-31`: lê o frontmatter com `gray-matter` e afirma o `kind` de cada arquivo esperado.

## Limites e cotas

- Node `>=20.19.0`; ESM (`"type": "module"`), imports com extensão `.js`.
- `gray-matter` é **devDependency** — usada em teste, não disponível em runtime. O runtime usa `yaml`.
- `NÃO DOCUMENTADO`: qualquer convenção para testar saída de terminal (largura, cor, redesenho). Nenhum teste do projeto exercita isso.

## Erros conhecidos e tratamento

- Captura de `process.stdout` global é **explicitamente evitada**: `src/cli/expx.ts:31-35` registra que ela "vaza entre testes que rodam em paralelo e produz falha intermitente". A alternativa adotada é injetar `Saida = { escrever, escreverErro }`. O watch precisa do mesmo padrão para ser testável.
- `src/cli/perguntar.ts:10-14` documenta a mesma escolha para entrada: o wizard recebe um `Perguntador` em vez de falar com `process.stdin`, "o que torna o fluxo testável sem subprocesso e sem TTY falso".
- Fixture nunca é escrita no lugar: sempre copiada para pasta temporária (`projeto-temporario.ts:5-11`).

## Riscos para a nossa implementação

1. **Das dez fixtures que a especificação pede, cinco não existem em nenhuma forma.** Verificado por busca no disco:

| Fixture pedida | Existe hoje? | Evidência |
|---|---|---|
| trabalho do sprintx em execução | **sim** | `fixtures/projeto-ok/docs/exportacao-csv/` (`estagio: f6`) |
| trabalho com bloqueio aberto | **parcial** | `fixtures/projeto-ok/.../00-BLOQUEIOS.md` existe; conteúdo a conferir |
| plano com frontmatter inválido | **sim** | `fixtures/projeto-ruim/` — seis variedades |
| ocorrência runx em modo legado com raio alto | **não** | `raio` só existe em `estado.json`, e nenhuma fixture tem esse arquivo |
| trabalho concluído | **não** | todo `ORQUESTRADOR.md` das fixtures tem `status: em_andamento` |
| nenhum trabalho aberto | **não** | nenhuma fixture com `docs/` sem trabalho (a `projeto-limpo` do CLI não tem `docs/`) |
| `estado.json` inválido | **não** | `find fixtures -name estado.json` não devolve nada |
| rastro ausente | **não** | `find fixtures -path "*eventos*"` não devolve nada — **nenhuma fixture tem rastro, então "ausente" é o estado atual de todas** |
| terminal de 60 colunas | **não** | nenhum teste do projeto lê ou simula largura |
| saída redirecionada para arquivo | **não** | nenhum teste do projeto exercita `isTTY: false` |

2. **Nenhuma fixture tem `.expx/estado.json` nem `docs/eventos/*.jsonl`.** As duas fontes primárias do watch não têm fixture nenhuma. Isso é trabalho de sprint de fundação, coerente com a regra 13 do método ("a primeira sprint entrega a capacidade de testar").

3. **"Rastro ausente" é o padrão, não o caso de exceção.** Como nenhuma fixture tem `docs/eventos/`, todo teste que não criar o arquivo estará exercitando o caminho degradado sem querer. O caso positivo é que precisa ser construído.

4. **Testar redesenho sem piscar e restauração do terminal é o ponto sem precedente.** As duas primeiras definições de pronto ("ver as tasks mudando ao vivo", "sair com a tecla de interrupção e o terminal volta ao normal") descrevem verificação manual. `NÃO DOCUMENTADO` como automatizá-las neste projeto. Ver lacuna L-07.

5. **A escolha da pasta muda o timeout em 6×.** `src/watch/` → 20 s; `src/cli/` → 120 s. Um teste que use `projetoTemporario` com cópia de fixture e observação de arquivo com debounce pode se aproximar do limite menor.

## Fonte

`vitest.config.ts`, `src/teste/projeto-temporario.ts`, `src/teste/repo-fixture.ts`, `src/fixtures.test.ts`, `src/cli/expx.ts:31-35`, `src/cli/perguntar.ts:10-14`, `package.json`, listagem de `fixtures/`, buscas por `estado.json` e `*eventos*` em `fixtures/` — 2026-08-30
