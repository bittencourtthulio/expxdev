# Auditoria — expx-watch-terminal

Data: 2026-08-30
Rodada: 1
Auditora: agente `auditor-plano`, em contexto separado de quem gerou o plano (regra 14).

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| ALTA | sprint-01/*, sprint-02/*, sprint-03/sprint.md | As "dez fixtures" são unidade de medida de 12 critérios de saída e testes, mas nenhum arquivo do plano enumera quais são. T-01.01/02/03 criam sete diretórios; dois itens da lista não são fixtures de disco e um mora em `fixtures/projeto-ruim/`. A DoD do ORQUESTRADOR exige "as dez em `fixtures/watch/`", o que o plano não entrega. | Tabela nominal das dez fixtures em `sprint-01/sprint.md`, com o caminho de cada uma, declarando quais são reaproveitadas e quais são modos de teste, não diretórios |
| ALTA | sprint-02/tasks.md | T-02.08 usa "a fixture sem rastro" e nenhuma task a cria nem a nomeia. `base/fixtures-e-testes.md` (risco 3) registra que rastro ausente é o estado de toda fixture atual — o teste é indistinguível de rodar sobre qualquer fixture. | Nomear `fixtures/watch/sem-rastro/` e declará-la em `arquivos.cria` de T-01.02 |
| ALTA | sprint-02/tasks.md | Ciclo de fato entre T-02.06/T-02.08 e T-02.09: os testes das duas dizem "na saída completa", que é o entregável de T-02.09, e T-02.09 depende das duas. T-02.06 também depende da árvore de T-02.07, com quem está declarada paralela. | Testes de T-02.06 e T-02.08 asseveram sobre a saída da própria seção; a ordem entre seções migra para T-02.09 |
| ALTA | sprint-03/tasks.md, ORQUESTRADOR.md | `src/cli/subcomandos.test.ts:6` afirma `expect([...SUBCOMANDOS]).toEqual([...seis nomes])`. Acrescentar `watch` reprova esse teste existente, e T-03.07 proíbe alterá-lo pela regra 8 do ORQUESTRADOR — o `criterio_aceite` "a suíte do CLI segue verde" é inatingível. `base/cli-e-subcomandos.md` (risco 4) marcou isso como NÃO DOCUMENTADO e o plano não resolveu. | Acrescentar `src/cli/subcomandos.test.ts` a `arquivos.altera` de T-03.07 e ajustar a regra 8 do ORQUESTRADOR |
| ALTA | sprint-03/tasks.md, 00-DECISOES.md | D-16 (`--todos`) e D-19 (sem trabalho aberto segue observando) estão decididas e nenhuma task as implementa ou testa. T-03.05 só interpreta a flag; a fixture `sem-trabalho` nunca é consumida por teste de comportamento. | Task nova em F-03.3 com teste sobre `fixtures/watch/sem-trabalho` e teste funcional de `--todos` |
| MÉDIA | sprint-03/tasks.md | T-03.08: o teste por mtime não discrimina (o próprio ORQUESTRADOR §5 admite). O teste funcional testa o arnês, não o watch, e não enumera funções nem módulo — escrita por `fs/promises` passaria despercebida. | Interceptação nomeada de sete funções em `node:fs` e `node:fs/promises`, afirmando zero chamadas |
| MÉDIA | sprint-02/tasks.md | T-02.09 não discrimina a metade que D-07 decide ("sessão = desde que o watch subiu"): implementação que conte o arquivo inteiro passa. | Dois eventos `regra_violada`, um antes e um depois da subida, esperando contagem 1 |
| MÉDIA | sprint-01/tasks.md | Rotação do rastro (`base/rastro-de-eventos.md` risco 5): T-01.07 cita no objetivo mas nenhum teste exercita dois arquivos, e T-01.01 não cria `.1.jsonl`. O critério de saída de F-01.3 diz "inclusive com arquivo rotacionado" sem teste que cubra. | Criar o `.1.jsonl` em T-01.01 e trocar o teste de integração de T-01.07 |
| MÉDIA | sprint-03/tasks.md | Escrita atômica gera `unlink`+`add`, não `change` (`base/estado-json.md` risco 5). O teste de T-03.02 passa com observador só de `change` se usar `writeFileSync` direto. | Especificar o teste com `renameSync` sobre `.expx/estado.json` |
| MÉDIA | ORQUESTRADOR.md, sprint-02/tasks.md, sprint-03/tasks.md | Nenhuma task de sprint-02/03 declara dependência de sprint-01, embora consumam suas fixtures e leitores. O §8 é puramente `depende_de`-driven e permitiria iniciar T-02.03 com sprint-01 incompleta. | Declarar as dependências cruzadas reais, ou acrescentar ao §8 a verificação do critério de saída da sprint anterior |
| MÉDIA | sprint-02/sprint.md | A tabela diz que F-02.1 roda em paralelo com "nenhuma"; `fases.md` diz `paralela_com: [F-02.2]`. Contradição direta sobre paralelismo, que a regra 5 manda seguir literalmente. | Corrigir a linha de F-02.1 em `sprint-02/sprint.md` |
| MÉDIA | sprint-01/tasks.md | T-01.02: a fixture `sem-trabalho` é só um `.gitkeep`; pasta sem ORQUESTRADOR é ignorada em silêncio, então o teste passaria com qualquer diretório vazio ou inexistente. | Complementar o critério: `trabalhos: []` **e** `rejeicoes: []`, diferenciando "nenhum trabalho" de "trabalho que falhou ao ler" |
| BAIXA | sprint-02/tasks.md | `status` de task e de trabalho/sprint/fase não são intercambiáveis (`base/schema-v1-e-kinds.md` risco 4); T-02.07 desenha os três níveis sem teste que cubra a distinção. | Teste funcional de T-02.07 cobre sprint `concluido` e task `concluida` |
| BAIXA | sprint-02/tasks.md | `progresso` é fração 0..1 e o par concluídas/total é contagem nova (`base/parser-de-artefatos.md` risco 4); no modo degradado precisa ser derivado e T-02.05 não cobre. | Acrescentar o par derivado ao critério de aceite de T-02.05 |
| BAIXA | sprint-03/* | T-03.05 é parser puro com `depende_de: []` mas está em F-03.3, depois de F-03.1/F-03.2. Sequencialidade sem dependência real. | Mover T-03.05 para fase paralela com F-03.1/F-03.2 |
| BAIXA | sprint-01/tasks.md | T-01.07 consome a fixture de T-01.01 mas só declara `depende_de: [T-01.06]`. | Acrescentar `T-01.01` ao `depende_de` de T-01.07 |
| BAIXA | sprint-03/tasks.md | A terceira forma (`expx watch <trabalho_id>`) só é testada como parsing; nenhum teste verifica que o id posicional seleciona aquele trabalho. | Teste funcional de T-03.06 com dois trabalhos, nomeando um |

VEREDITO: NÃO — o plano não está pronto para execução autônoma.

## Verificação independente do achado mais grave

O achado ALTA sobre `src/cli/subcomandos.test.ts` foi conferido no código real após a auditoria:

```
src/cli/subcomandos.test.ts:6
expect([...SUBCOMANDOS]).toEqual(["init", "panel", "add", "remove", "update", "doctor"]);
```

Confirmado. O critério de aceite de T-03.07 era de fato inatingível como escrito.


---

# Rodada 2

Data: 2026-08-30
Auditora: agente `auditor-plano`, contexto novo.

**Parte A — os 17 achados da rodada 1:** 16 endereçados, 1 parcialmente (ALTA-5: a task T-03.09 foi criada e cobre D-16 e D-19, mas exigia uma fixture com trabalhos `nao_iniciado`/`bloqueado`/`concluido` que não existia).

A auditora julgou explicitamente **não ser achado** a declaração do caminho crítico no §3 do ORQUESTRADOR, por nomear a cadeia real de sete tasks e admitir que os dois últimos elos são portão de sprint, não `depende_de`.

## Achados novos da rodada 2

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| ALTA | sprint-01/tasks.md, sprint-02/tasks.md | Quatro fixtures nasciam só com `.expx/estado.json`, sem nenhum arquivo de plano. Como pasta sem `ORQUESTRADOR.md` é ignorada em silêncio, `montarProjeto` devolveria zero trabalhos, tornando inatingíveis os testes de T-02.03, T-02.05, T-02.07 e T-03.06. | Plano completo em `com-estado`, `legado-raio-alto` e `estado-invalido`; declarar na tabela nominal quais têm plano |
| ALTA | sprint-03/tasks.md | T-03.09 exigia fixture com trabalhos `nao_iniciado`, `bloqueado` e `concluido`, e nenhuma fixture do repositório tem esses status. O mesmo para a "fixture com dois trabalhos" de T-03.06, não nomeada. | Criar `fixtures/watch/varios-trabalhos/` com os quatro status e citá-la por nome |
| MÉDIA | vários | A tabela nominal produzia oito diretórios, mas onze critérios diziam "as sete fixtures". | Uniformizar a contagem |
| MÉDIA | sprint-01/fases.md | O critério de saída de F-01.1 ainda dizia "as dez fixtures existem em disco", contradizendo a tabela, que declara duas como modos de teste exercitados em T-02.09. | Reescrever para "as nove fixtures de disco" |
| MÉDIA | sprint-03/tasks.md | T-03.09 exigia comportamento do loop (`src/watch/watch.ts`) sem declará-lo em `arquivos.altera`, e rodava paralela a T-03.08, que lê esse mesmo loop. | Declarar o arquivo e marcar `paralelizavel: false` |
| MÉDIA | sprint-03/tasks.md | T-03.01 exigia "fixture com `.git`", e nenhuma existe nem pode ser commitada como subdiretório git. | Pasta temporária com `mkdirSync(".git")` |
| BAIXA | sprint-01/tasks.md | As três tasks de fixture seguiriam o padrão de `src/fixtures.test.ts`, arquivo único, e colidiriam. | Testes de fixture do watch em `src/watch/fixtures-watch.test.ts` |
| BAIXA | sprint-02/tasks.md | T-02.02 assertava sobre "linhas desenhadas", entregável de T-02.09 — mesma classe do ALTA-3. | Assertar sobre `pintar` |

VEREDITO: NÃO — o plano não está pronto para execução autônoma.

## Correções aplicadas após a rodada 2

Todos os oito achados acima foram endereçados na regeneração:

- As fixtures `com-estado`, `legado-raio-alto` e `estado-invalido` passaram a criar plano completo; `estado-versao-futura` e `sem-trabalho` seguem sem plano **de propósito**, e a tabela nominal de `sprint-01/sprint.md` agora declara quais têm e quais não têm, com o motivo.
- Criada `fixtures/watch/varios-trabalhos/` com quatro `ORQUESTRADOR.md`, um por status, citada por nome em T-03.06 e T-03.09.
- A contagem foi uniformizada em **nove fixtures de disco** em todos os critérios; F-01.1 deixou de cobrar as duas que são modo de teste.
- T-03.09 declara `src/watch/watch.ts` e `watch.test.ts` em `arquivos.altera` e passou a `paralelizavel: false`.
- T-03.01 testa sobre pasta temporária com `.git` criado por `mkdirSync`.
- Os testes de fixture do watch nascem em `src/watch/fixtures-watch.test.ts`.
- T-02.02 asserta sobre `pintar`, não sobre a saída composta.


---

# Rodada 3

Data: 2026-08-30
Auditora: agente `auditor-plano`, contexto novo.

**Parte A — os oito achados da rodada 2:** sete plenamente endereçados com evidência textual; o oitavo (BAIXA sobre `fixtures-watch.test.ts`) endereçado de forma incompleta, virando o achado N-01 abaixo.

## Achados novos da rodada 3

| severidade | arquivo | problema | status |
|---|---|---|---|
| MÉDIA | sprint-01/tasks.md | N-01 — T-01.01/02/03 são paralelas e as três precisavam escrever em `src/watch/fixtures-watch.test.ts`, mas só T-01.03 o declarava | **corrigido**: um arquivo por task — `fixtures-fontes.test.ts`, `fixtures-borda.test.ts`, `fixtures-bloqueio.test.ts` |
| MÉDIA | sprint-02/tasks.md | N-02 — T-02.05 e T-02.09 desenham o cabeçalho de `estado-versao-futura` e `sem-trabalho`, que não têm fonte alguma, e o critério "sem exceder a largura" é satisfeito por uma implementação que devolva `[]` | **corrigido**: o critério de T-02.05 passa a exigir a linha "nenhum trabalho aberto" nesse caso |
| MÉDIA | sprint-02/tasks.md | N-03 — o critério de T-02.04 definia `degradado` só pela *ausência* do `estado.json`, enquanto D-12 manda tratar versão ≠ 1 e JSON inválido também como degradado; uma implementação com `existsSync` passaria e violaria a decisão | **corrigido**: o critério enumera as nove fixtures, seis com `degradado: true` e três com `false` |
| BAIXA | sprint-01/tasks.md | N-04 — `progressoDe` devolve 0 sem tasks (`src/parser/projeto/montar.ts:107-111`), então "progresso 1" só discrimina se a fixture tiver tasks concluídas | **corrigido**: o critério exige três tasks, todas `concluida` |
| BAIXA | sprint-03/tasks.md | N-05 — T-03.08 lia `watch.ts` em paralelo com T-03.09, que o reescreve | **corrigido**: T-03.08 passa a `depende_de: [T-03.06, T-03.09]` e `paralelizavel: false` |
| BAIXA | sprint-01/sprint.md | N-06 — a tabela numerada de 1 a 10 tinha onze linhas por causa do "7b" | **corrigido**: `varios-trabalhos` sai da numeração e vira linha de apoio |

VEREDITO: SIM — o plano está pronto para execução autônoma.

Nenhum achado ALTA. Os seis achados MÉDIA/BAIXA acima foram corrigidos após o veredito, por serem baratos e reduzirem o risco de teste não discriminante — nenhum deles bloqueava a execução.

## Resumo das três rodadas

| Rodada | ALTA | MÉDIA | BAIXA | Veredito |
|---|---|---|---|---|
| 1 | 5 | 7 | 5 | NÃO |
| 2 | 2 | 4 | 2 | NÃO |
| 3 | 0 | 3 | 3 | **SIM** |

Os cinco ALTA da rodada 1 e os dois da rodada 2 eram todos defeitos reais que teriam parado a execução autônoma — em especial a asserção de lista exata em `src/cli/subcomandos.test.ts:6`, que tornava o critério de aceite de T-03.07 inatingível, e as fixtures que nasciam sem plano em disco, que tornariam inatingíveis quatro testes da sprint-02.
