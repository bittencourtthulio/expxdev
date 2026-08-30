# Contrato expx-estado v1 — o arquivo que a barra de status lê

Leitura necessária no estágio que for gravar o `estado.json`. Este arquivo é **derivado e descartável**: ele existe para a barra de status do terminal mostrar, em uma linha, qual ocorrência está aberta e em que estágio ela está.

**Nada nesta skill decide coisa alguma lendo este arquivo.** Nenhum portão, nenhuma detecção de estágio, nenhum pré-requisito consulta o `estado.json`. A máquina de estados continua sendo detectada pelo disco de `docs/manutencao/<OC-ID>-<slug>/`, exatamente como o `SKILL.md` descreve. Apagar o `estado.json` no meio de uma ocorrência não pode quebrar nada — na pior hipótese a barra fica vazia até a próxima gravação.

Por isso ele **não é regra inviolável**, e a sua ausência nunca interrompe o trabalho.

## A regra que justifica o formato

A barra de status roda a cada mensagem do assistente, com debounce de 300 ms, e **se um gatilho novo dispara enquanto o script ainda executa, o Claude Code mata a execução em vez de enfileirar**. Script lento não atrasa: ele simplesmente não aparece.

Por isso a barra nunca lê o plano, o `tasks.md`, o frontmatter nem o rastro. Ela lê um arquivo só, pequeno, já mastigado. Quem mantém esse arquivo são as skills, que já estão gravando em disco de qualquer forma.

Quem instala a barra é o CLI. Esta skill só mantém o arquivo — nem precisa saber que a barra existe.

## Local

```
.expx/estado.json
```

Ignorado pelo versionador. É estado da máquina de quem está trabalhando, não do projeto.

O caminho é relativo à raiz do repositório — a mesma raiz que ancora `docs/manutencao/` e `docs/relatorios/`, definida na seção "Onde ficam `docs/manutencao/` e `docs/relatorios/`" do `SKILL.md`. Nunca escreva caminho absoluto.

## Se `.expx/` não existir, não crie

`.expx/` ausente significa que o CLI **não instalou o ecossistema neste projeto**. Não há barra de status para alimentar.

Nesse caso: **siga sem gravar, sem erro e sem aviso.** Não crie o diretório, não avise o usuário, não registre nada. O estágio segue normalmente, como se esta página não existisse.

## Formato

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
  "raio": null,
  "orcamento_arquivos": null,
  "orcamento_linhas": null,
  "branch": null,
  "pr_estado": null,
  "bloqueios": 0
}
```

## Regras do contrato

1. **Somente exibição.** Nenhuma skill toma decisão lendo este arquivo. Ele é derivado e descartável; apagá-lo não pode quebrar nada.
2. **Chave nunca omitida.** O que não se aplica vai `null`. `raio` é `null` fora do modo legado; `pr_estado` é `null` antes do push.
3. **Escrita atômica.** Escreva em arquivo temporário e renomeie. A barra pode estar lendo no exato momento da gravação, e JSON pela metade quebra o parse.
4. **Pequeno.** Abaixo de 1 KB. Nada de listas, nada de caminhos longos.
5. **`titulo_curto` cabe em 30 caracteres.** Corte, não quebre linha.
6. **Sem trabalho aberto:** `trabalho`, `fase` e `task` viram `null`. O arquivo continua existindo.
7. **Enums iguais aos do `expx-schema`:** minúsculo, sem acento. `e3`, não `E3`. `alto`, não `ALTO`.

## Quem escreve o quê

| Campo | Dono |
|---|---|
| `trabalho`, `ferramenta`, `titulo_curto`, `fase` | sprintx e runx, nas transições |
| `task`, `tasks_concluidas`, `tasks_total` | sprintx e runx, ao abrir e fechar task |
| `raio`, `orcamento_arquivos`, `orcamento_linhas` | legadox |
| `branch`, `pr_estado` | mergex |
| `bloqueios` | quem registrar bloqueio |

**Os campos que a runx mantém são exatamente estes oito:**

```
trabalho  ferramenta  titulo_curto  fase  task  tasks_concluidas  tasks_total  bloqueios
```

**Todo o resto pertence a outra ferramenta e precisa sobreviver à sua gravação.** `raio`, `orcamento_arquivos` e `orcamento_linhas` são do `legadox`; `branch` e `pr_estado` são do `mergex`. Ler, alterar o que é seu, gravar. **Nunca sobrescreva o arquivo inteiro com um objeto novo** — isso apaga o trabalho das outras ferramentas em silêncio, e ninguém percebe porque o arquivo continua com JSON válido.

## O procedimento de gravação

Sempre estes cinco passos, nesta ordem:

1. **Verifique `.expx/`.** Não existe → pare aqui, sem erro e sem aviso.
2. **Leia o `.expx/estado.json` atual.** Não existe, está vazio ou tem JSON inválido → parta do objeto padrão abaixo, com as quinze chaves presentes.
3. **Altere apenas os campos que são seus**, mais `atualizado_em`.
4. **Grave em `.expx/estado.json.tmp` e renomeie** para `.expx/estado.json`. Nunca grave direto no destino.
5. **Falhou? Registre no rastro e siga.** Nunca interrompa o trabalho por causa da barra de status.

O objeto padrão, quando não há arquivo anterior:

```json
{
  "expx_estado": 1,
  "atualizado_em": null,
  "trabalho": null,
  "ferramenta": "runx",
  "titulo_curto": null,
  "fase": null,
  "task": null,
  "tasks_concluidas": 0,
  "tasks_total": 0,
  "raio": null,
  "orcamento_arquivos": null,
  "orcamento_linhas": null,
  "branch": null,
  "pr_estado": null,
  "bloqueios": 0
}
```

### O comando

Use este comando, ajustando só os `--campo valor` da gravação em questão. Ele faz os cinco passos: sai calado sem `.expx/`, preserva os campos das outras ferramentas, grava em temporário e renomeia.

```bash
python3 - <<'PY' --trabalho OC-2026-0142 --fase e3 --task T-01.02
import json, os, sys, tempfile, datetime

BASE = ".expx"
ALVO = os.path.join(BASE, "estado.json")
MEUS = {"trabalho", "ferramenta", "titulo_curto", "fase", "task",
        "tasks_concluidas", "tasks_total", "bloqueios"}
PADRAO = {"expx_estado": 1, "atualizado_em": None, "trabalho": None,
          "ferramenta": "runx", "titulo_curto": None, "fase": None, "task": None,
          "tasks_concluidas": 0, "tasks_total": 0, "raio": None,
          "orcamento_arquivos": None, "orcamento_linhas": None,
          "branch": None, "pr_estado": None, "bloqueios": 0}

# 1. Sem .expx/ o CLI nao instalou o ecossistema aqui: sai calado.
if not os.path.isdir(BASE):
    sys.exit(0)

try:
    # 2. Le o que ja existe; arquivo ausente ou corrompido cai no padrao.
    estado = dict(PADRAO)
    try:
        with open(ALVO, encoding="utf-8") as f:
            anterior = json.load(f)
        if isinstance(anterior, dict):
            estado.update(anterior)
    except (FileNotFoundError, ValueError):
        pass

    # 3. Altera apenas os campos proprios, vindos da linha de comando.
    args = sys.argv[1:]
    for i in range(0, len(args) - 1, 2):
        chave = args[i].lstrip("-")
        valor = args[i + 1]
        if chave not in MEUS:
            continue
        if valor == "null":
            valor = None
        elif chave in ("tasks_concluidas", "tasks_total", "bloqueios"):
            valor = int(valor)
        elif chave == "titulo_curto":
            valor = " ".join(valor.split())[:30]  # 30 caracteres, sem quebra de linha
        estado[chave] = valor

    estado["expx_estado"] = 1
    estado["ferramenta"] = "runx"
    estado["atualizado_em"] = datetime.datetime.now(
        datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    # 4. Escrita atomica: temporario no mesmo diretorio, depois rename.
    fd, tmp = tempfile.mkstemp(dir=BASE, prefix="estado.json.", suffix=".tmp")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(estado, f, ensure_ascii=False)
    os.replace(tmp, ALVO)
except Exception as e:
    # 5. A barra de status nunca interrompe o trabalho.
    print(f"estado.json nao gravado: {e}", file=sys.stderr)
    sys.exit(0)
PY
```

`os.replace` é o rename atômico: a barra ou lê o arquivo antigo inteiro, ou o novo inteiro, nunca um pedaço dos dois.

O `titulo_curto` é cortado em 30 caracteres pelo próprio comando, e as quebras de linha são colapsadas em espaço antes do corte — passe o título da ocorrência inteiro sem se preocupar com o tamanho.

Quando a gravação falhar, registre no rastro e siga:

```bash
python3 .claude/runx-hooks/comum/rastro.py --evento estado_nao_gravado --fase <e1..e5> \
  --resultado falha --detalhe "estado.json nao gravado: <motivo em uma linha>"
```

## Quando gravar

| Momento | Campos gravados |
|---|---|
| Ao abrir a ocorrência (E1, Passo 0) | `trabalho`, `ferramenta`, `titulo_curto`, `fase: e1`, `task: null`, `tasks_concluidas: 0`, `tasks_total: 0`, `bloqueios: 0` |
| A cada transição de estágio | `fase` |
| Ao gerar o plano (E2) | `tasks_total` |
| Ao abrir uma task (E3) | `task` |
| Ao fechar uma task (E3) | `tasks_concluidas`, e `task` com a próxima ou `null` se não houver |
| Ao registrar ou resolver bloqueio (E3) | `bloqueios` |
| QA reprovou e volta ao E3 (E4) | `fase: e3` |
| Ao fechar a ocorrência (E5) | `trabalho: null`, `fase: null`, `task: null` |

Duas observações sobre a tabela:

- **A volta do E4 para o E3 precisa aparecer na barra.** É exatamente o momento em que o dev perde o fio — a ocorrência parecia fechada e voltou para correção. Gravar `fase: e3` no retorno é tão obrigatório quanto gravar `fase: e4` na entrada do QA.
- **No fechamento, o arquivo continua existindo.** `trabalho`, `fase` e `task` viram `null`; as contagens e `bloqueios` ficam como estavam. Não apague o `estado.json`.

## De onde vem cada valor

| Campo | Origem |
|---|---|
| `trabalho` | o `<OC-ID>` da ocorrência, o mesmo `trabalho_id` do frontmatter |
| `ferramenta` | sempre `runx` |
| `titulo_curto` | o **título** da ocorrência (`titulo` do `00-OCORRENCIA.md`), cortado em 30 caracteres — **nunca o relato do cliente inteiro** |
| `fase` | o estágio da máquina de estados, em minúscula: `e1`, `e2`, `e3`, `e4`, `e5` — o mesmo valor de `estagio` do `ORQUESTRADOR.md` |
| `task` | o `id` da task em `em_andamento`, no formato `T-NN.MM`; `null` quando nenhuma está aberta |
| `tasks_concluidas` | quantas tasks estão com `status: concluida` em todos os `tasks.md` da ocorrência |
| `tasks_total` | quantas tasks o plano tem no total, somando todas as sprints |
| `bloqueios` | quantos bloqueios estão **em aberto** em `BLOQUEIOS.md` (`resolvido_em: null`) |

`titulo_curto` é o título, não o relato. "Cálculo do frete divergente acima de 50kg" vira `Cálculo do frete divergente aci` — o relato de três parágrafos do cliente nunca entra aqui.

## Verificação antes de dar a gravação por feita

- [ ] `.expx/` existe — se não existe, nada foi criado e nada foi avisado.
- [ ] As quinze chaves estão presentes; nenhuma foi omitida.
- [ ] `raio`, `orcamento_arquivos`, `orcamento_linhas`, `branch` e `pr_estado` estão **como estavam antes** desta gravação.
- [ ] `fase` está em minúscula (`e3`, não `E3`).
- [ ] `titulo_curto` tem no máximo 30 caracteres e está em uma linha só.
- [ ] O arquivo ficou abaixo de 1 KB.
- [ ] A gravação passou por temporário e rename, não por escrita direta no destino.
- [ ] Nenhum caminho absoluto em nenhum valor.
