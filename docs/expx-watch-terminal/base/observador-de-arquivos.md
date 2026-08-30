# Observador de arquivos (`src/servidor/observador.ts`)

## Contrato de entrada

`src/servidor/observador.ts:16`:

```ts
export async function observar(
  raiz: string,
  aoMudar: () => void,
  debounceMs = 300,
): Promise<Observador>
```

- `raiz` — pasta a observar.
- `aoMudar` — callback sem argumentos. **Não diz o que mudou**, apenas que algo mudou.
- `debounceMs` — padrão `300` (`observador.ts:19`).

Motor: `chokidar`, dependência de produção declarada em `package.json` (`"chokidar": "^5.0.0"`).

## Contrato de saída

```ts
export type Observador = { parar: () => Promise<void> };
```

A promise só resolve depois do evento `ready` do chokidar (`observador.ts:47`), então quem chama tem garantia de que a observação está ativa ao receber o objeto.

Eventos escutados: `add`, `change`, `unlink`, `addDir`, `unlinkDir` (`observador.ts:43`).

## Limites e cotas

- Debounce padrão: **300 ms** (`observador.ts:19`).
- `awaitWriteFinish.stabilityThreshold`: `max(50, debounceMs/3)` = **100 ms** no padrão; `pollInterval`: **20 ms** (`observador.ts:40`).
- Pastas ignoradas por regex: `node_modules`, `.git`, `dist` e **`.expx`** (`observador.ts:36`).
- `ignoreInitial: true` (`observador.ts:31`) — a carga inicial não dispara o callback; quem chama precisa ler o estado uma vez por conta própria.

## Erros conhecidos e tratamento

- Erro de observação (permissão, limite de watchers do SO) é engolido: `watcher.on("error", () => undefined)` (`observador.ts:45`). O painel não cai, mas **também não avisa que parou de observar**.
- O debounce existe por um motivo documentado em `observador.ts:9-14`: as skills gravam `tasks.md` a cada transição de task, e ler no instante da gravação produz YAML truncado — uma rejeição transitória que apareceria e sumiria da tela. Esperar o silêncio evita mostrar erro que não existe.
- `NÃO DOCUMENTADO`: comportamento em rede/volume montado, e limite de watchers em projeto muito grande.

## Riscos para a nossa implementação

1. **`.expx` é ignorado pelo observador — e é onde mora `estado.json`.** `observador.ts:36` exclui `.expx` da regex por decisão D-06 (evitar realimentação com o índice do memox). Mas a especificação do watch declara `.expx/estado.json` como **fonte primária**. Consequência direta: `observar()` como está **não serve** para o `estado.json`; ou o watch usa um segundo observador para esse arquivo, ou torna o ignore configurável. É a incompatibilidade mais concreta encontrada na F1.

2. **`aoMudar` não diz o que mudou.** A especificação exige gatilhos distintos: reler o plano só quando o plano muda, e reler o rastro quando o rastro muda. Com um callback cego, ou o watch relê tudo (perdendo a promessa), ou precisa de observadores separados por área, ou o callback precisa carregar o caminho alterado. `chokidar` fornece o caminho nos handlers (`observador.ts:43` os descarta); expor isso é mudança pequena e aditiva.

3. **O painel observa `./docs` por padrão** (`src/cli/argumentos.ts:6`), e `.expx/` é irmã de `docs/`, não descendente. Mesmo sem o ignore, observar `docs/` jamais alcançaria `.expx/estado.json`. O watch precisa observar duas raízes distintas.

4. **Rotação do rastro.** O contrato manda o `.jsonl` virar `<trabalho_id>.1.jsonl` acima de 5 MB (`CONTRATO-expx-eventos.md`), e `nucleo/hooks/expx-rastro.sh:210-215` implementa isso. Durante a rotação o arquivo observado é renomeado: chega `unlink` seguido de `add`. O debounce agrupa os dois, mas o leitor precisa reabrir o arquivo, não manter descritor.

5. **Debounce de 300 ms é o valor do painel, não necessariamente o do watch.** Painel ao lado do editor tolera latência maior que uma tela que a pessoa fica olhando. `NÃO DOCUMENTADO` qual valor serve ao watch; nenhuma fonte no repositório afirma um número para esse caso.

## Fonte

`src/servidor/observador.ts`, `src/cli/argumentos.ts:6`, `nucleo/hooks/expx-rastro.sh:189-222`, `docs/contrato/CONTRATO-expx-eventos.md` — lidos em 2026-08-30
