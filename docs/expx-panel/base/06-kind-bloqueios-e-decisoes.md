# kinds `bloqueios` e `decisoes`

## Contrato de entrada

### `kind: bloqueios` — `00-BLOQUEIOS.md` (sprintx) / `BLOQUEIOS.md` (runx)

| Campo | Tipo | Obrigatório | Valor quando não se aplica |
|---|---|---|---|
| cabeçalho comum | — | sim | — |
| `atualizado_em` | data | sim | — |
| `bloqueios` | lista | sim | `[]` |

Cada item:

| Campo | Tipo | Obrigatório | Valor quando não se aplica |
|---|---|---|---|
| `id` | string `B-NN` | sim | — |
| `task` | string `T-NN.MM` | sim | — |
| `aberto_em` | data | sim | — |
| `resolvido_em` | data \| null | sim | `null` enquanto aberto |
| `descricao` | string uma linha | sim | — |

**Um bloqueio está aberto quando `resolvido_em: null`.** É a única definição disponível — nenhuma fonte declara um campo de status para bloqueio.

O nome do arquivo diverge entre as skills: `00-BLOQUEIOS.md` na sprintx, `BLOQUEIOS.md` na runx. O contrato aceita os dois no título da seção (`contrato:150`). O parser precisa procurar ambos.

### `kind: decisoes` — `00-DECISOES.md` (só sprintx)

**Este kind não existe no contrato.** Aparece apenas em `~/.claude/skills/sprintx/references/00-schema.md:186-212`. Lacuna L-02.

| Campo | Tipo | Obrigatório | Valor quando não se aplica |
|---|---|---|---|
| cabeçalho comum | — | sim | — |
| `atualizado_em` | data | sim | — |
| `decisoes` | lista | sim | `[]` |

Cada item: `id` (`D-NN`), `decisao`, `alternativa_descartada` (string \| null), `motivo` (string \| null), `status` (`fechada` \| `pendente`), `bloqueante` (booleano).

Regras (`sprintx:206-212`): um PENDENTE da prosa entra com `status: pendente`, `alternativa_descartada: null` e `motivo: null`; todo PENDENTE é `bloqueante: true` por padrão; decisão `fechada` é `bloqueante: false`.

Consequência para o painel: como o contrato não lista este kind, um parser fiel ao contrato rejeitaria todo `00-DECISOES.md` como "kind desconhecido" — e a sprintx grava esse arquivo em toda feature. Seriam rejeições falsas em massa.

## Contrato de saída

Bloqueios agregados por trabalho e globalmente (o card "contagem de bloqueios abertos" da visão global soma os abertos de todos os trabalhos).

## Limites e cotas

`NÃO DOCUMENTADO`.

## Erros conhecidos e tratamento

Violação da tela de conformidade que nasce deste kind:

| Violação | Como detectar |
|---|---|
| bloqueio aberto há mais de N dias | `resolvido_em == null && (hoje - aberto_em) > N` |

O valor de **N não é declarado em nenhuma das três fontes** — veio do pedido da feature como "N dias". É parâmetro de configuração ou constante? `NÃO DOCUMENTADO` — L-18.

## Riscos para a nossa implementação

- **`aberto_em` no futuro** ou `resolvido_em` anterior a `aberto_em`: nenhuma fonte declara validação de coerência temporal. A conta de "N dias" produz número negativo sem erro.
- **Bloqueio referenciando task inexistente**: mesmo problema de referência cruzada dos outros kinds. `NÃO DOCUMENTADO`.
- **O kind `decisoes` fora do contrato** (L-02) é a lacuna com maior potencial de dano imediato: sem resolvê-la, o painel enche a tela de "fora do schema" com arquivos perfeitamente válidos, violando a definição de pronto.
- **"Hoje"** para a conta de dias: fuso do servidor, UTC? Com `aberto_em` sendo só data (sem hora), a diferença é em dias de calendário. `NÃO DOCUMENTADO`.

## Fonte

- `docs/contrato/CONTRATO-expx-schema-v1.md:148-164` — acessado em 2026-08-29
- `~/.claude/skills/sprintx/references/00-schema.md:170-212` — acessado em 2026-08-29
- `~/.claude/skills/runx/references/00-schema.md:247-266` — acessado em 2026-08-29
