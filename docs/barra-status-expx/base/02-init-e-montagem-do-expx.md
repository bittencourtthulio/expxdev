# `init`, montagem do `.expx/` e o wizard

## Contrato de entrada

### `executarInit(op: OpcoesInit)` — `src/cli/init.ts:53`

```ts
type OpcoesInit = {
  raiz: string;
  skills: readonly string[];
  harness: readonly string[];
  origens?: Record<string, string>;
  referencias?: Record<string, string>;
};
```

### Flags do `init` — `src/cli/init-flags.ts:37`

```ts
type OpcoesInitCli = {
  skills: string[];
  harness: Harness[];   // "claude" | "opencode"
  painel: boolean;
  sim: boolean;
  simular: boolean;
};
```

Flags aceitas hoje (`init-flags.ts:53-84`): `--skills`, `--harness`, `--painel`, `--yes`/`--sim`, `--check`/`--simular`. Qualquer outro token é erro: `opcao desconhecida em init: <nome>` (`init-flags.ts:82-83`). **Uma flag nova precisa entrar neste switch ou o init recusa a linha inteira.**

### Wizard interativo — `src/cli/wizard.ts:105`

`executarWizard(p: Perguntador, parciais: OpcoesInitCli, raiz: string)`. A ordem das perguntas (`wizard.ts:110-131`):

1. confirmar reconfiguração, se `.expx/` já existe (`wizard.ts:97-103`);
2. skills (`wizard.ts:114`);
3. harness (`wizard.ts:117`);
4. painel como devDependency (`wizard.ts:120-122`);
5. confirmação final `confirmar? [S/n]` (`wizard.ts:128`).

Regra declarada no cabeçalho (`wizard.ts:15-16`): "Toda pergunta respeita o que já veio por flag: quem passou `--harness` não é perguntado de novo."

O `Perguntador` (`src/cli/perguntar.ts:13-18`) é injetado — `linha`, `escrever`, `fechar`. Existe `perguntadorDeRoteiro` para teste, que devolve string vazia quando o roteiro acaba (`perguntar.ts:47-53`). Auxiliares: `interpretarEscolhaMultipla` (`perguntar.ts:78`) e `interpretarSimNao(resposta, padrao)` (`perguntar.ts:92`).

## Contrato de saída

```ts
type ResultadoInit = {
  ok: boolean;          // ok = instaladas.length > 0  (init.ts:146)
  instaladas: string[];
  falhas: Falha[];      // { nome, erro }
  naoTravadas: string[];
  avisos: string[];
};
```

## Limites e cotas

- A montagem inteira do `.expx/` acontece dentro de `escreverAtomico` (`init.ts:121-127`): "ou o `.expx/` novo aparece completo, ou o anterior permanece intocado" (`init.ts:25-27`). Um arquivo novo em `.expx/` gerado pelo CLI precisa ou entrar nessa transação, ou ser escrito fora dela conscientemente.
- Dentro de `escreverAtomico`, `tmp` **já é o futuro `.expx/`** — o lock é gravado em `join(tmp, "expx-lock.json")`, e o comentário avisa que passar por `escreverLock` gravaria fora da pasta temporária e o arquivo se perderia (`init.ts:123-126`).
- `instalarHooks` roda **depois** de `escreverAtomico` e **antes** do `rmSync` dos clones temporários (`init.ts:129-131`, decisão D-26).
- `mesclarSettings` só é chamada com `harness.includes("claude")` (`init.ts:133-137`); `materializarOpenCode` com `opencode` (`init.ts:138`).
- Uma skill inacessível nunca aborta as outras (`init.ts:20-23`).

## Erros conhecidos e tratamento

| Condição | Comportamento |
|---|---|
| skill fora do catálogo | `falhas.push`, segue (`init.ts:64-67`) |
| versão não resolve | `falhas.push`, segue (`init.ts:69-72`) |
| skill referencia caminho fora da própria pasta | `falhas.push`, segue (`init.ts:91-99`) |
| merge do settings falha | vira `aviso`, não aborta (`init.ts:135-136`) |
| sem terminal e sem `--yes` | mostra o que faria e sai `0` sem escrever (`src/cli/expx.ts:98-101`) |

`ehInterativo()` exige **stdin E stdout** TTY (`expx.ts:38-40`), com a justificativa em `expx.ts:31-37`.

## Riscos para a nossa implementação

1. A pergunta da barra precisa entrar no wizard **e** ganhar flag em `init-flags.ts`, senão o modo não interativo fica sem equivalente — e o switch de flags recusa qualquer token não previsto.
2. O script `.expx/statusline.sh` precisa ser gerado dentro de `escreverAtomico` para não sumir na troca atômica, ou ser gerado depois, deliberadamente. É decisão de projeto, não detalhe.
3. `chmod 0o755` já tem precedente para arquivo executável gerado (`src/harness/hooks.ts:55`), com a justificativa "sem ele o hook não roda, e não avisa".
4. `podeAplicarSemPerguntar` (`init-flags.ts:97-99`) existe mas **não é usada em `expx.ts`** — o expx.ts implementa a regra na mão (`expx.ts:98-101`). Duplicação a não replicar.
5. Instalar a barra num init `--harness opencode` puro não faz sentido hoje: a barra é mecanismo do Claude Code.

## Fonte

`src/cli/init.ts`, `src/cli/init-flags.ts`, `src/cli/wizard.ts`, `src/cli/perguntar.ts`, `src/cli/expx.ts` — lidos em 2026-08-30
