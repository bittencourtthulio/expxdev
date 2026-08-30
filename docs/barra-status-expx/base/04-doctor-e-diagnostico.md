# `doctor` — contrato dos verificadores

## Contrato de entrada

`diagnosticar(raiz: string): Diagnostico` — `src/doctor/verificadores.ts:44`. Recebe só a raiz do projeto; nenhuma opção, nenhum I/O de rede.

Verificadores auxiliares seguem o padrão `(raiz: string, push: (a: Achado) => void): void` — `verificarRastro` (`verificadores.ts:207`), `verificarHooks` (`verificadores.ts:268`). Um verificador novo entra chamando `push` e sendo invocado em `diagnosticar` (`verificadores.ts:193-194`).

## Contrato de saída

```ts
type Severidade = "erro" | "aviso";

type Achado = {
  id: string;         // identificador estável, kebab-case
  severidade: Severidade;
  problema: string;   // o que está errado
  correcao: string;   // o que fazer — obrigatório
};

type Diagnostico = { saudavel: boolean; achados: Achado[] };
```

`saudavel` é `achados.filter(a => a.severidade === "erro").length === 0` (`verificadores.ts:196`) — avisos não reprovam.

Impressão no CLI (`src/cli/expx.ts:160-170`): `[${severidade}] ${problema}\n  correcao: ${correcao}\n`; sai `0` quando saudável, `1` quando não. Sem achados: `"nenhum problema encontrado"`.

Regra declarada (`verificadores.ts:13-18`): "Cada achado traz a correção sugerida, porque um diagnóstico que só diz 'está errado' transfere o trabalho de volta para quem pediu ajuda." E: "`erro` impede o funcionamento; `aviso` é situação legítima que a pessoa precisa saber."

## Limites e cotas

- **Saída antecipada**: sem `.expx/`, `diagnosticar` retorna imediatamente (`verificadores.ts:62-70`); lock ilegível também (`verificadores.ts:72-81`). Verificação nova colocada depois desses pontos **não roda** em projeto sem `.expx/`.
- Ordem deliberada: o `.gitignore` é verificado ANTES de exigir `.expx/`, porque "um `.gitignore` que ignora `.expx/` é justamente a causa provável de ele não estar ali" (`verificadores.ts:50-52`).
- Amostragem: listas longas são truncadas — `fora.slice(0, 3)` (`verificadores.ts:127`), `lista.slice(0, 5)` (`verificadores.ts:138`).
- Verificações que dependem do harness são condicionadas: `if (l.lock.harness.includes("claude"))` (`verificadores.ts:157`).
- `lerJson` devolve `undefined` para ausente E para inválido (`verificadores.ts:35-42`) — não distingue os dois casos.

## Erros conhecidos e tratamento

Todo acesso a disco em verificador é embrulhado em `try/catch` que segue em frente: `readdirSync` (`verificadores.ts:212-216`, `275-279`), `readFileSync` (`verificadores.ts:220-224`). Um verificador **nunca** derruba o `doctor`.

Precedente direto para "tempo de execução": não existe. Nenhum verificador atual mede tempo nem executa subprocesso. `verificarRastro` é o mais pesado (lê arquivos `.jsonl` de `docs/eventos/`).

Precedente de severidade para coisa que "não impede o método de funcionar": `verificarRastro` usa **aviso, nunca erro**, com a justificativa (`verificadores.ts:201-206`): "um `doctor` que reprova a instalação por causa de linha antiga em disco é um doctor que as pessoas param de rodar."

## Riscos para a nossa implementação

1. As quatro verificações pedidas (barra configurada, script existe e é executável, `estado.json` válido, tempo de execução) precisam decidir severidade. O precedente sugere: script ausente/não executável quando a barra ESTÁ configurada = **erro** (a barra referenciada não roda); `estado.json` ausente = **não é achado nenhum**, porque a própria barra degrada para a linha curta e o contrato diz que apagá-lo não pode quebrar nada; `estado.json` inválido = **aviso**; tempo acima do limite = **aviso**.
2. Medir tempo de execução significa **executar o script** dentro do `doctor` — o primeiro subprocesso de qualquer verificador. Precisa de timeout próprio e de stdin sintético (o script espera JSON no stdin). Se travar, trava o `doctor`.
3. Verificar "barra configurada" exige ler `.claude/settings.json`, que já é lido em `verificadores.ts:158`. Reaproveitar essa leitura evita ler o arquivo duas vezes.
4. A verificação da barra precisa ficar **antes** dos `return` antecipados se tiver de valer em projeto sem `.expx/` — mas nesse caso não faz sentido, então fica depois.

## Fonte

`src/doctor/verificadores.ts`, `src/doctor/efeito.ts`, `src/cli/expx.ts:160-170` — lidos em 2026-08-30
