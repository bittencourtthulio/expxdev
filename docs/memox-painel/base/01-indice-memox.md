# Índice do memox — o artefato `.expx/memoria/indice.json`

## Contrato de entrada

O painel não invoca o motor do memox. O motor é `python3 .claude/skills/memox/assets/memox.py indexar`, roda fora do painel (à mão, por comando `/memox-indexar`, ou pelo hook `Stop` do Claude Code) e grava um único arquivo.

Para o painel, a entrada é **o caminho do arquivo no disco**:

- `<raiz>/.expx/memoria/indice.json` — o índice. `dir_memoria(raiz)` = `os.path.join(raiz, ".expx", "memoria")` (`.claude/skills/memox/assets/memox.py:68-69` do repo MemoX, acessado em 2026-08-29).
- `<raiz>/.expx/memoria/config.json` — a config, criada com os padrões na primeira indexação e nunca sobrescrita pela reconstrução (`assets/TEMPLATE-config.md`, acessado em 2026-08-29).
- `<raiz>/.expx/memoria/ultima-indexacao` — marca de tempo usada por `precisa_reindexar` (`memox.py:940-947`).

**O arquivo pode não existir.** `.expx/memoria/` é acrescentado ao `.gitignore` pelo próprio motor (`_garantir_gitignore`, `memox.py:919-922`; a linha gravada é `.expx/memoria/`). O índice é local, descartável e reconstruível — o README do MemoX afirma que "o índice inteiro é descartável e reconstruível do zero a qualquer momento". Logo, num clone limpo do projeto o índice **não existe**, e isso é o estado normal, não um erro.

## Contrato de saída

Objeto JSON único. Chaves de primeiro nível, conforme `exemplos/indice.exemplo.json` (repo MemoX, acessado em 2026-08-29):

| Chave | Tipo | Conteúdo |
|---|---|---|
| `versao` | número | `VERSAO_INDICE = 1` (`memox.py:35`) |
| `gerado_em` | string `AAAA-MM-DD` | data da reconstrução |
| `duracao_ms` | número | tempo da indexação |
| `raiz` | string | raiz relativa usada na indexação (`"."` no exemplo) |
| `totais` | objeto | `trabalhos`, `arquivos`, `modulos`, `regressoes`, `coincidencias`, `artefatos_contaminados` |
| `trabalhos` | mapa `id -> registro` | o registro completo de cada trabalho indexado |
| `por_arquivo` | mapa `caminho -> entrada[]` | chave por arquivo |
| `por_modulo` | mapa `modulo -> entrada[]` | chave por módulo |
| `por_decisao` | mapa `modulo -> decisao[]` | decisões agrupadas por módulo |
| `por_termo` | mapa `termo -> id[]` | índice invertido textual |
| `sinais` | objeto `{ arquivo: {...}, modulo: {...} }` | os sinais derivados |
| `regressoes` | lista | as regressões comprovadas |
| `coincidencias_arquivo` | lista | vínculos rejeitados, com o motivo |
| `linha_do_tempo` | lista | trabalhos ordenados por data, mais recente primeiro |
| `artefatos_contaminados` | mapa `caminho -> tipo[]` | artefatos onde segredo foi detectado |
| `fora_do_indice` | lista | o que não entrou |
| `config` | objeto | a config efetiva usada |

### `entrada` (item de `por_arquivo` / `por_modulo`)

`trabalho_id`, `titulo`, `data`, `tipo`, `ferramenta`, `causa`, `papel`, `artefato`.

`papel` ∈ `alterado` | `impactado` | `modulo` (observado no exemplo). `artefato` é o caminho relativo do artefato de origem — é a linha `ver:` que o README chama de "o produto, não decoração".

### `sinais.arquivo[caminho]`

`trabalhos` (número), `ultimo_trabalho_em` (data), `reprovacoes_qa` (número), `detalhe_reprovacoes` (lista de `{trabalho_id, executado_em, origem}`), `regressoes` (lista), `zona_de_risco` (`{motivo, origem}` ou `null`), `divida` (`{descricao, risco, origem}` ou `null`), `faixa_atencao_frequente` (string ou `null`).

### `sinais.modulo[nome]`

`trabalhos`, `ultimo_trabalho_em`, `reprovacoes_qa`, `regressoes`, `arquivos` (lista de caminhos).

### `regressao` (item de `regressoes`)

`arquivos` (lista), `trabalho_anterior`, `data_anterior`, `trabalho_posterior`, `data_posterior`, `evidencia` (frase), `origem_causa` (caminho), `origem_alteracao` (caminho). Os dois caminhos de origem são o que torna a afirmação conferível.

### `coincidencia` (item de `coincidencias_arquivo`)

`arquivos` (lista), `trabalhos` (lista de ids), `motivo` (frase explicando por que NÃO é regressão).

## Limites e cotas

- `max_entradas_recentes`: padrão `3` — quantas entradas recentes por alvo (`assets/TEMPLATE-config.md`, acessado em 2026-08-29).
- `teto_entradas`: padrão `8` — acima disso o memox informa a contagem em vez de listar.
- `sempre_incluir`: padrão `["regressao", "reprovacao_qa", "zona_de_risco"]` — sinais que furam o limite de recência.

Esses limites governam a **injeção em prompt**, cujo custo é a atenção do modelo. Uma tela de painel não tem esse custo: o humano rola a página e filtra. NÃO DOCUMENTADO qualquer limite que o memox imponha à leitura por terceiros — o arquivo é lido inteiro.

Tamanho do arquivo: NÃO DOCUMENTADO. O exemplo do repositório tem 6 trabalhos e ocupa ~26 KB.

## Erros conhecidos e tratamento

- **Índice ausente.** `carregar_indice` (`memox.py:975-976`) trata o caminho inexistente; a doutrina declarada da config é "falha aberta" — "Config ausente ou inválida não derruba nada: o motor cai nos padrões e segue" (`TEMPLATE-config.md`). Para o painel, ausência é um estado legítimo a ser mostrado, não um erro.
- **JSON inválido / truncado.** O índice é reescrito inteiro por `gravar_indice` (`memox.py:901-904`). Ler durante a gravação pode render JSON parcial — o mesmo risco que o `observador.ts` do painel já documenta para `tasks.md` ("ler o arquivo no instante da gravação produz YAML truncado").
- **Versão diferente de 1.** `VERSAO_INDICE = 1`. Um índice gravado por versão futura pode ter formato distinto.
- **Artefato contaminado.** Segredo detectado num artefato faz o trecho ser omitido e o artefato ser listado em `artefatos_contaminados`. O valor redigido aparece como `[redigido pelo memox]` no texto (visto em `exemplos/indice.exemplo.json`, trabalho `OC-2026-0199`).

## Riscos para a nossa implementação

1. **O índice normalmente não existe.** É gitignorado e local. Uma tela que assuma presença mostra erro no caso mais comum. A tela precisa ter um estado vazio que *ensine* como gerar o índice.
2. **Leitura durante gravação.** JSON parcial é possível; parse tem que falhar para dentro, sem derrubar o `/api/projeto` inteiro.
3. **`por_termo` é grande e inútil para tela.** É um índice invertido para busca textual do motor; despejá-lo na UI é peso morto no payload do websocket. O painel difunde o estado inteiro a cada mudança (`painel.ts`, decisão D-28) — carregar `por_termo` multiplicaria esse payload sem ganho.
4. **`trabalhos` duplica o histórico do painel.** O painel já monta `historico` a partir de `docs/relatorios/` (`montar.ts`, `montarHistorico`). Servir os dois inteiros é redundância paga em bytes.
5. **Ids do memox ≠ ids do painel, mas se cruzam.** O memox indexa `trabalho_id`; o painel usa o mesmo campo (`EntradaHistorico.oc_id` vem de `dados["trabalho_id"]`). O cruzamento é possível, mas o exemplo mostra um caso de id sujo (`OC-2026-0142-arredondamento` como trabalho separado de `OC-2026-0142`), o que impede tratar o cruzamento como garantido.
6. **Contaminação por segredo é informação de segurança.** Se um artefato do projeto contém segredo, isso merece destaque no painel — é justamente o tipo de coisa que ninguém vai procurar.

## Fonte

- `/Users/thuliobittencourt/Documents/Projetos/MemoX/exemplos/indice.exemplo.json` — acessado em 2026-08-29
- `/Users/thuliobittencourt/Documents/Projetos/MemoX/README.md` — acessado em 2026-08-29
- `/Users/thuliobittencourt/Documents/Projetos/MemoX/.claude/skills/memox/assets/memox.py` (linhas citadas) — acessado em 2026-08-29
- `/Users/thuliobittencourt/Documents/Projetos/MemoX/.claude/skills/memox/assets/TEMPLATE-config.md` — acessado em 2026-08-29
