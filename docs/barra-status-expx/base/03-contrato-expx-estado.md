# Contrato `expx-estado` v1 — o arquivo que a barra lê

## Contrato de entrada

O script da barra lê `.expx/estado.json` (`docs/contrato/CONTRATO-expx-estado.md`, seção "Local"). Estrutura completa, verbatim da fonte:

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

Dezesseis chaves. **Chave nunca omitida** — o que não se aplica vai `null` (regra 2 do contrato). `raio` é `null` fora do modo legado; `pr_estado` é `null` antes do push.

Tipos deduzidos do exemplo (a fonte não declara tipos formalmente — ver LACUNAS):
`expx_estado` inteiro; `atualizado_em` string ISO 8601 com `Z`; `trabalho`, `ferramenta`, `titulo_curto`, `fase`, `task`, `raio`, `orcamento_arquivos`, `orcamento_linhas`, `branch`, `pr_estado` strings ou `null`; `tasks_concluidas`, `tasks_total`, `bloqueios` números.

`orcamento_arquivos` e `orcamento_linhas` são **strings no formato `"consumido/total"`**, não números.

## Contrato de saída

O arquivo é somente leitura para a barra. Regra 1: "Somente exibição. Nenhuma skill toma decisão lendo este arquivo. Ele é derivado e descartável; apagá-lo não pode quebrar nada."

## Limites e cotas

| Limite | Valor | Referência |
|---|---|---|
| Tamanho do `estado.json` | abaixo de 1 KB | contrato, regra 4 |
| `titulo_curto` | cabe em 30 caracteres, corte sem quebrar linha | contrato, regra 5 |
| Debounce da barra | 300 ms | contrato, seção "A regra que justifica tudo" |

A regra que justifica o desempenho, verbatim: "A barra de status roda a cada mensagem do assistente, com debounce de 300 ms, e **se um gatilho novo dispara enquanto o script ainda executa, o Claude Code mata a execução em vez de enfileirar**. Script lento não atrasa: ele simplesmente não aparece."

E a consequência direta: "Por isso a barra **nunca** lê `tasks.md`, frontmatter, plano ou rastro. Ela lê um arquivo só, pequeno, já mastigado."

## Erros conhecidos e tratamento

- Escrita atômica é obrigação de quem escreve (regra 3): "Escreva em arquivo temporário e renomeie. A barra pode estar lendo no exato momento da gravação, e JSON pela metade quebra o parse." Mesmo assim, a barra precisa sobreviver a JSON quebrado — a garantia é do escritor, e escritor errado existe.
- Sem trabalho aberto (regra 6): `trabalho`, `fase` e `task` viram `null`. **O arquivo continua existindo.** Ou seja: "arquivo ausente" e "sem trabalho aberto" são estados distintos.
- Enums (regra 7): minúsculo, sem acento. `e3`, não `E3`. `alto`, não `ALTO`. Iguais aos do `expx-schema`.

## Riscos para a nossa implementação

1. **`.expx/estado.json` é ignorado pelo versionador** ("Ignorado pelo versionador. É estado da máquina de quem está trabalhando, não do projeto") — enquanto **`.expx/statusline.sh` é commitado** (o `.expx/` inteiro é commitado, `src/cli/projeto.ts:29-33`, e o `doctor` reprova `.gitignore` que ignore `.expx/`, `src/doctor/verificadores.ts:53-60`). Os dois convivem na mesma pasta com regras de versionamento opostas: o `.gitignore` precisa ignorar **o arquivo**, nunca a pasta.
2. O contrato **não enumera os valores válidos de `fase`**. O exemplo traz `e3` (runx). A sprintx usa `f1..f6` (`references/00-schema.md`). A barra imprime o valor cru, então não depende disso — mas o `doctor`, ao "validar o estado.json", precisa saber se valida enum ou só forma.
3. O contrato **não enumera os valores de `raio`**. O exemplo traz `alto`; o pedido fala em baixa/média/alta. A regra "faixa de raio, só quando não for baixa" e "orçamento só em raio médio ou alto" depende dos valores exatos. Ver LACUNAS.
4. `expx_estado: 1` é versão de contrato. Nada na fonte diz o que a barra faz diante de uma versão diferente. Ver LACUNAS.
5. `.expx/statusline.sh` sendo commitado significa que ele **não pode conter caminho absoluto** — o repositório viaja entre máquinas.

## Quem escreve o quê (fora do escopo da V1, mas define o que a barra pode esperar)

| Campo | Dono |
|---|---|
| `trabalho`, `ferramenta`, `titulo_curto`, `fase` | sprintx e runx, nas transições |
| `task`, `tasks_concluidas`, `tasks_total` | sprintx e runx, ao abrir e fechar task |
| `raio`, `orcamento_arquivos`, `orcamento_linhas` | legadox |
| `branch`, `pr_estado` | mergex |
| `bloqueios` | quem registrar bloqueio |

"O CLI [instala a barra]. As skills só mantêm o arquivo — nem precisam saber que a barra existe."

Ressalva do próprio contrato: "A barra de status é mecanismo do Claude Code. O OpenCode tem o seu, com formato possivelmente diferente. Trate como lacuna a verificar, não como paridade garantida."

## Fonte

`docs/contrato/CONTRATO-expx-estado.md` (70 linhas) — lido em 2026-08-30
