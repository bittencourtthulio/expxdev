# Contrato `expx-eventos` v1 — hooks, agentes e rastro

Documento compartilhado pelas cinco skills e pelo painel. Guarde no repositório do painel e referencie nos outros.

---

## Por que hooks

Toda regra inviolável das skills é hoje uma instrução que o modelo pode esquecer numa execução longa. Hook é script determinístico: roda sempre, porque quem executa é o harness, não o modelo.

Mecânica que o desenho assume:

- Hooks ficam em `.claude/settings.json`, aninhados em evento → matcher → handler
- O hook recebe o evento em JSON no stdin
- `PreToolUse` é o único que barra a chamada: **exit 2 bloqueia e o stderr volta ao modelo como o motivo**
- `PostToolUse` roda depois do sucesso e não desfaz nada. **Atenção:** ali o exit 2 NÃO bloqueia e o **stderr não volta ao modelo** — verificado na documentação oficial. O único canal que chega ao modelo é JSON no stdout: `{"hookSpecificOutput":{"hookEventName":"PostToolUse","additionalContext":"..."}}`. Todo hook de aviso em `PostToolUse` precisa usar esse formato; escrever em stderr ali é falha silenciosa
- Exit 0 permite; qualquer outro não-zero é erro não bloqueante, registrado e ignorado
- Hooks apertam permissão, nunca afrouxam

**Paridade com o OpenCode — verificada no binário v1.18.23 e testada de ponta a ponta.** Hooks são mecanismo do Claude Code; o OpenCode tem sistema próprio, de plugins JS auto-carregados de `.opencode/plugin/*.ts`, com os hooks `tool.execute.before` e `tool.execute.after`. O que a verificação encontrou:

| Capacidade | Claude Code | OpenCode |
|---|---|---|
| Bloquear a chamada | `exit 2` no `PreToolUse`, stderr vira o motivo | **lançar exceção** em `tool.execute.before` — testado: a ação não acontece e o modelo lê a mensagem |
| Avisar sem bloquear | JSON no stdout (`additionalContext`) | **não existe no `before`** — só passar em silêncio ou lançar |

A lacuna real é o **modo aviso**, que é justamente o modo em que todo hook de método nasce. O contorno adotado pela `sprintx`: anexar o aviso ao resultado da ferramenta em `tool.execute.after`, sempre prefixado por `[sprintx/hooks — aviso, a ação NÃO foi bloqueada]`, para o modelo não confundir o aviso com a saída da própria ferramenta.

Recomendação para as demais skills: a lógica de cada hook mora **uma vez só**, em script de shell, e o plugin do OpenCode é uma ponte que o invoca e traduz a saída. Duplicar a lógica cria duas fontes divergindo com o tempo. Ao traduzir o payload, note que as ferramentas do OpenCode usam `filePath` (camelCase), e que os argumentos vêm em `output.args` no `before` e em `input.args` no `after`.

## Princípio de adoção — leia antes de implementar

Hook que dá falso positivo é desinstalado, e junto com ele vão os que funcionavam. Por isso todo hook nasce em modo `aviso` e só é promovido depois.

| Modo | Comportamento | Quando usar |
|---|---|---|
| `aviso` | Registra no rastro, não bloqueia | Estado inicial de todo hook de método |
| `bloqueio` | Exit 2, barra a ação | Só depois de rodar semanas sem falso positivo |
| `desligado` | Não roda, não registra | Escape explícito, quando o hook atrapalha mais que ajuda |

Exceção: os hooks de segurança nascem em `bloqueio`. Segredo commitado não tem volta, e o falso positivo ali é raro.

**Os três modos são obrigatórios em toda implementação.** Um hook que reconhece só dois e trata o terceiro como valor inválido continua rodando quando alguém pediu para desligá-lo — a intenção do operador some em silêncio.

### `.expx/hooks.json`

```json
{
  "expx_hooks": 1,
  "hooks": {
    "segredo":       { "modo": "bloqueio", "tipo": "seguranca" },
    "escopo-da-task":{ "modo": "aviso",    "tipo": "metodo" }
  }
}
```

`tipo` é `seguranca` ou `metodo`, e não é decorativo: **hook de segurança nunca é rebaixado por ausência de configuração.** Arquivo ausente, ilegível ou sem a entrada do hook ⇒ o hook de segurança assume `bloqueio`, o de método assume `aviso`. Só um `desligado` explícito desliga um hook de segurança.

O `doctor` mostra em que modo cada um está.

## O rastro de eventos

Arquivo append-only, uma linha JSON por evento:

```
docs/eventos/<trabalho_id>.jsonl
```

Escrito por hooks e pelas próprias skills nas transições de fase. Lido pelo painel. Ninguém edita à mão.

### Formato da linha

```json
{
  "ts": "2026-08-29T14:32:10Z",
  "expx_eventos": 1,
  "trabalho_id": "OC-2026-0142",
  "ferramenta": "runx",
  "origem": "hook",
  "evento": "task_concluida",
  "fase": "e3",
  "task": "T-01.02",
  "agente": "implementador",
  "resultado": "ok",
  "detalhe": "suite verde, 14 testes",
  "arquivos": ["src/frete/calculo.ts"]
}
```

Valem as convenções do documento raiz `CONVENCOES.md` — em particular R2 (chave em `snake_case` sem acento), R3 (enum minúsculo sem acento), R4 (data ISO, obtida do sistema), R6 (chave nunca omitida) e R10 (nenhum caminho absoluto).

Não repita aqui o texto das convenções: cite pelo identificador. Este parágrafo já foi, numa versão anterior, um resumo em prosa que citava quatro das nove regras e perdia as outras cinco.

### As doze chaves obrigatórias, e as extras

A linha tem **doze chaves obrigatórias**, sempre todas, nesta ordem:

`ts` · `expx_eventos` · `trabalho_id` · `ferramenta` · `origem` · `evento` · `fase` · `task` · `agente` · `resultado` · `detalhe` · `arquivos`

Por R6, nenhuma delas é omitida: sem valor, escreva `null` (ou `[]` em `arquivos`).

**Chaves extras são permitidas**, desde que declaradas aqui e posicionadas **depois** das doze, antes do fim do objeto. Uma skill que tem informação real a registrar não deve perdê-la nem espremê-la em `detalhe`.

| Chave extra | Quem grava | O que é |
|---|---|---|
| `hook` | mergex, legadox | nome do hook que decidiu, quando `origem: hook` |
| `faixa` | legadox | faixa de atenção do arquivo tocado |

Quem valida uma linha verifica que as doze estão **contidas** nela — nunca igualdade exata de conjunto. Um validador de igualdade estrita reprova as skills que usam extras legítimas, e foi assim que a verificação da `runx` passou a reprovar toda linha da `mergex` e da `legadox`.

### Valores de `ferramenta`

`sprintx` · `runx` · `mergex` · `legadox` · `stackx` · `memox`

**Não confundir com `expx_tool`**, do `expx-schema`, que aceita só `sprintx` e `runx`. São campos de domínios diferentes: `expx_tool` diz que skill *escreveu um artefato de estado* — e só essas duas escrevem; `ferramenta` diz que skill *emitiu um evento* — e todas emitem. Um leitor que trate os dois como o mesmo enum rejeita o rastro de quatro skills.

### Vocabulário de `evento`

| Evento | Quem grava |
|---|---|
| `fase_iniciada` · `fase_concluida` | skill |
| `task_iniciada` · `task_concluida` · `task_bloqueada` | skill |
| `suite_executada` | hook `PostToolUse` |
| `arquivo_alterado` | hook `PostToolUse` |
| `regra_violada` | hook, em modo aviso |
| `acao_bloqueada` | hook, em modo bloqueio |
| `agente_iniciado` · `agente_concluido` | hook `SubagentStop` e skill |
| `veredito_emitido` | agente auditor ou QA |
| `commit_criado` · `pr_aberto` | mergex |

### Valores de `agente`

`principal` · `auditor-plano` · `revisor-testes` · `qa` · `investigador` · `cartografo` · `revisor-diff` · `analista-de-conflito` · `avaliador-de-raio`

`principal` é o valor quando não há subagente — o modelo principal executando. Nunca `null`: por R6 a chave está sempre lá, e "foi o principal" é informação, não ausência.

Os três últimos existiam em disco e já eram gravados no rastro antes de constarem aqui. Um agente novo entra nesta lista **no mesmo commit** em que passa a emitir evento.

### Decisão de versionamento

O rastro é **ignorado pelo versionador** por padrão. É local da máquina de quem executou, cresce rápido, e o painel roda local. Quem quiser rastro compartilhado troca isso conscientemente — e aí precisa lidar com conflito de merge em arquivo append-only, que é chato.

Rotação: acima de 5 MB, o arquivo vira `<trabalho_id>.1.jsonl` e um novo começa. O painel lê os dois.

## O que o painel mostra com isso

- Linha do tempo do trabalho: cada fase, cada task, quanto tempo levou
- **Quem fez o quê**: filtro por agente, com o que cada um tocou e que veredito emitiu
- Violações de regra em modo aviso, que é a lista que decide quais hooks promover a bloqueio
- Ações bloqueadas, para ver se algum hook está atrapalhando mais que ajudando
- Duração real por task, que alimenta a calibração de estimativa do `sprintx`

Esse último item é um ganho que não estava previsto: o rastro dá o esforço real por task sem ninguém anotar nada.

## Convenção de agentes

Subagentes rodam em contexto próprio e com ferramentas restritas. É isso que torna estrutural a regra "quem implementa não aprova" — hoje ela é uma promessa que o mesmo modelo faz a si mesmo, tendo visto o próprio raciocínio.

Um arquivo por agente, com frontmatter declarando nome, descrição e as ferramentas permitidas. **Os campos diferem entre os dois harnesses** — verificado na documentação oficial e no binário do OpenCode v1.18.23:

| | Claude Code (`.claude/agents/<nome>.md`) | OpenCode (`.opencode/agent/<nome>.md`) |
|---|---|---|
| Restringir ferramentas | `tools: Read, Glob, Grep` (string separada por vírgula) | `permission:` com `edit: deny`, `write: deny`, `bash: deny` |
| Campo `tools:` | existe | **não existe** — campo desconhecido vai silenciosamente para `options` |
| Se omitir a restrição | **herda TODAS as ferramentas** | herda a permissão do nível acima |
| Outros campos | `name`, `description`, `model` | `description`, `mode: subagent`, `model` |

A linha "se omitir, herda todas" é a mais perigosa da tabela: um agente de veredito sem o campo `tools:` nasce com permissão de escrita, o que destrói exatamente a garantia que justifica o agente existir. Confirme os nomes na documentação vigente antes de implementar — não escreva de memória.

### Os agentes do ecossistema

| Agente | Usado por | Ferramentas | Papel |
|---|---|---|---|
| `auditor-plano` | sprintx F5 | leitura apenas | Fura o plano antes de virar código |
| `revisor-testes` | sprintx, runx | leitura apenas | Responde: esse teste passaria com a implementação errada? |
| `qa` | runx E4 | leitura + rodar suíte | Valida contra os critérios, não corrige |
| `investigador` | runx E1, legadox | leitura + busca | Monta a base e prova a causa raiz |
| `cartografo` | stackx, legadox | leitura + histórico | Varre o repositório e extrai convenção ou perfil |

**Regra que dá sentido a tudo:** os agentes de veredito — `auditor-plano`, `revisor-testes`, `qa` — têm acesso **somente de leitura**. Isso transforma "aponta, não corrige" de instrução em impossibilidade técnica.

## Estrutura no plugin

```
plugin/
├── hooks/
│   ├── hooks.json
│   ├── comum/          segredo, git, rastro
│   ├── sprintx/
│   ├── runx/
│   ├── legadox/
│   ├── stackx/
│   └── mergex/
├── agents/
│   ├── auditor-plano.md
│   ├── revisor-testes.md
│   ├── qa.md
│   ├── investigador.md
│   └── cartografo.md
└── skills/
```

Os hooks são instalados pelo CLI conforme a seleção de skills: quem não instalou o `legadox` não recebe os hooks dele.

## Regras que todo hook obedece

1. **Rápido.** Roda em toda chamada de ferramenta. Acima de 200 ms, o dev sente.
2. **Silencioso quando passa.** Só fala quando barra ou avisa.
3. **Falha aberta, exceto segurança.** Hook de método que quebra não pode travar o trabalho: registra o erro e sai com 0. Hook de segurança falha fechada.
4. **Sem rede.** Nada de chamada externa no caminho de uma chamada de ferramenta.
5. **Mensagem acionável.** O stderr vai para o modelo: diga o que fazer, não só o que está errado.
6. **Sem estado próprio.** Toda decisão sai de arquivo já existente — `tasks.md`, `PERFIL.md`, `CONVENCOES.md`, o lock.
7. **Sempre grava no rastro**, inclusive quando permite.

## Ordem de implementação sugerida

1. Rastro e os hooks de segurança, em bloqueio
2. Hooks de método, todos em modo aviso
3. Agentes de veredito
4. Promoção a bloqueio, guiada pela lista de violações que o painel acumulou

O passo 4 é o único que não dá para acelerar: ele depende de evidência de uso real.