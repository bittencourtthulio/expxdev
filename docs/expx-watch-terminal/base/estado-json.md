# `.expx/estado.json` — contrato `expx-estado` v1

Fonte primária declarada na especificação do watch. **Nenhum código do repositório lê este arquivo hoje** — ver Riscos.

## Contrato de entrada

Caminho fixo: `.expx/estado.json`. Ignorado pelo versionador — é estado da máquina de quem trabalha, não do projeto (`CONTRATO-expx-estado.md`, seção "Local").

## Contrato de saída

Formato integral, do contrato:

```json
{
  "expx_estado": 1,
  "atualizado_em": "2026-08-29T14:32:10Z",
  "trabalho": "OC-2026-0142",
  "ferramenta": "runx",
  "titulo_curto": "frete acima de 50kg",
  "fase": "e3",
  "task": "T-01.02",
  "tasks_concluidas": 4,
  "tasks_total": 9,
  "raio": "alto",
  "orcamento_arquivos": "2/3",
  "orcamento_linhas": "31/40",
  "branch": "fix/OC-2026-0142-calculo-frete",
  "pr_estado": null,
  "bloqueios": 0
}
```

Cobertura do cabeçalho que o watch pede, campo a campo:

| O que o cabeçalho pede | Campo | Vem do estado.json? |
|---|---|---|
| trabalho atual | `trabalho` | sim |
| ferramenta | `ferramenta` | sim |
| título | `titulo_curto` | sim, **cortado em 30 caracteres** |
| fase ou estágio | `fase` | sim |
| tasks concluídas sobre total | `tasks_concluidas` / `tasks_total` | sim, já como par de inteiros |
| faixa de raio (modo legado) | `raio` | sim |
| orçamento consumido | `orcamento_arquivos`, `orcamento_linhas` | sim, já como string `"2/3"` |
| branch | `branch` | sim |
| estado do PR | `pr_estado` | sim |

**Todo o cabeçalho especificado sai deste arquivo, e apenas dele.** `raio`, `orcamento_*`, `branch` e `pr_estado` não existem em nenhum `kind` do `expx-schema` — o parser do painel não os conhece. Confirmado por leitura de `src/parser/esquema/kinds.ts`.

## Limites e cotas

- **Abaixo de 1 KB** (regra 4 do contrato). Sem listas, sem caminhos longos.
- `titulo_curto` **cabe em 30 caracteres**; a regra 5 manda cortar, não quebrar linha.
- Escrita **atômica**: arquivo temporário e rename (regra 3). O motivo declarado: a barra pode estar lendo no instante da gravação, e JSON pela metade quebra o parse. **Consequência para o watch: ler o arquivo inteiro de uma vez é seguro; não há janela de leitura parcial.**
- Enums iguais aos do `expx-schema`: minúsculo e sem acento — `e3`, nunca `E3`; `alto`, nunca `ALTO` (regra 7).

## Erros conhecidos e tratamento

- **Chave nunca omitida** (regra 2): o que não se aplica vai `null`. `raio` é `null` fora do modo legado; `pr_estado` é `null` antes do push.
- **Sem trabalho aberto**: `trabalho`, `fase` e `task` viram `null`, e o arquivo continua existindo (regra 6). Isto é diferente de o arquivo não existir.
- **Somente exibição** (regra 1): "nenhuma skill toma decisão lendo este arquivo. Ele é derivado e descartável; apagá-lo não pode quebrar nada." O watch é exibição, então está dentro do uso previsto — mas herda a obrigação de não depender dele para correção.
- `NÃO DOCUMENTADO`: o que fazer quando `expx_estado` não é `1`. O contrato não define política de versão futura, ao contrário do `expx-schema`, que tem `VERSAO_SUPORTADA` em `src/parser/esquema/cabecalho.ts`.
- `NÃO DOCUMENTADO`: se `estado.json` pode divergir do plano em disco, e qual das duas fontes ganha nesse caso.

## Riscos para a nossa implementação

1. **Não existe leitor deste arquivo no repositório.** Busca por `estado\.json|expx_estado` em `src/`, `ui/src` e `nucleo/` não devolve nenhuma ocorrência. Não há schema zod, não há tipo TypeScript, não há teste. Tudo isso é construção nova — e é a única fonte de `raio`, `orcamento_*`, `branch` e `pr_estado`.

2. **A tolerância a falha "estado.json inválido cai para leitura direta do plano" tem um custo declarado.** O plano não contém `raio`, `orcamento_*`, `branch` nem `pr_estado`. No modo degradado, essas linhas do cabeçalho simplesmente não podem ser exibidas — não é escolha de implementação, é ausência de fonte.

3. **`titulo_curto` já vem cortado em 30 caracteres.** Se o watch quiser o título completo em terminal largo, precisa buscá-lo no `ORQUESTRADOR.md` via parser (campo `titulo`, `kinds.ts:73`). São dois títulos com fontes diferentes para o mesmo trabalho.

4. **`.expx/` é ignorada pelo observador atual** (`src/servidor/observador.ts:36`) e não é descendente de `docs/`. Ver `observador-de-arquivos.md`, risco 1.

5. **Escrita atômica por rename gera `unlink`+`add`, não `change`.** O observador escuta os três (`observador.ts:43`), então funciona — mas um observador novo, escrito só para `change`, perderia toda atualização do `estado.json`.

## Fonte

`docs/contrato/CONTRATO-expx-estado.md` (70 linhas, íntegro); busca por `estado\.json|expx_estado` em `src/`, `ui/src`, `nucleo/` — 2026-08-30
