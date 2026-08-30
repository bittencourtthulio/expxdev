# Auditoria — memox-painel

Data: 2026-08-29
Rodada: 1 (auditoria do plano gerado na F3/F4) — SUPERADA pela rodada 2

Auditoria executada em contexto separado do autor do plano, conforme a regra 14 do método.

## Achados

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| ALTA | sprint-01/tasks.md | T-01.01 e T-01.02 não têm teste executável pela suíte: os `teste_integracao` são "compila o tsconfig" e os `teste_funcional` são asserções sobre o compilador. `tsconfig.json` exclui `**/*.test.ts` e o vitest não faz typecheck, então nada faz a asserção negativa falhar. `npm test` passaria com o tipo errado ou ausente | Substituir por testes de vitest reais que validem em runtime, contra a fixture, o formato da projeção |
| ALTA | sprint-01/tasks.md | T-01.02 não discrimina: `ui/src/telas/fixture.ts` faz `lerEstado(...) as unknown as Estado`, e o cast apaga qualquer divergência entre o `Projeto` do servidor e o `Estado` da UI | Asserção em runtime sobre `estado.memoria` lida pelo parser real, sem depender do cast |
| ALTA | sprint-03/tasks.md | T-03.04 quebra teste existente não declarado: `src/harness/settings.test.ts:49` afirma `Object.keys(d).sort()` = `["enabledPlugins","extraKnownMarketplaces"]`. Escrever a chave `hooks` faz esse teste falhar sem que a task o preveja | Declarar o ajuste do teste e explicitar que `hooks` só é escrita quando memox está entre as skills instaladas |
| ALTA | sprint-03/tasks.md | T-03.04/T-03.05 alteram `mesclarSettings(raizProjeto, caminhoMarketplace)`, que não tem como saber que memox foi instalada. A mudança de assinatura implica alterar `src/cli/init.ts:130` e `src/harness/backup.test.ts:20,34`, não listados em `arquivos.altera` | Declarar a nova assinatura e acrescentar os call sites ao `altera` |
| ALTA | sprint-03/tasks.md | T-03.02/T-03.03 exigem repo de fixture com hooks e `assets/memox.py`, mas `criarRepoSkill` (`src/teste/repo-fixture.ts`) só cria `SKILL.md`, `references/01.md` e um comando. O pré-requisito do teste não existe em disco | Acrescentar `src/teste/repo-fixture.ts` ao `altera` de T-03.02, com opção de hooks e assets |
| ALTA | sprint-03/tasks.md | T-03.01 registra `memox` no `CATALOGO`, cujo `repositorio` é a URL usada pelo `init` real. Nenhum arquivo do plano ou da base declara essa URL | Declarar a URL do repositório memox em `00-DECISOES.md` e registrá-la na base |
| MÉDIA | sprint-02/tasks.md | T-02.02 afirma que o primeiro arquivo de risco é `src/frete/calculo.ts`, mas o critério de T-01.03 só garante `versao` e `totais.regressoes`. T-02.02 pode falhar por fixture, não por implementação | Declarar em T-01.03 que a fixture deriva de `exemplos/indice.exemplo.json` e exigir `sinais.arquivo["src/frete/calculo.ts"].regressoes` não vazio |
| MÉDIA | sprint-02/tasks.md | T-02.04 lista `src/parser/projeto/montar.test.ts` em `altera`, mas o arquivo não existe (há `src/parser/projeto/sprints.test.ts`) | Mover para `cria` ou apontar para o arquivo existente |
| MÉDIA | sprint-02/tasks.md, ORQUESTRADOR.md | D-20 (exportação CSV) e D-12 (contaminação em destaque) não têm task nem teste que os cubram | Acrescentar task de exportação CSV com teste de cabeçalho e separador, e cobrir contaminação no teste de T-02.07 |
| MÉDIA | sprint-02/tasks.md | T-02.07 diz "as três tabelas" enquanto o objetivo e a definição de pronto listam quatro coisas. O critério não é binário | Nomear as tabelas esperadas no teste |
| MÉDIA | sprint-02/tasks.md | T-02.03 exige que "gravar em `docs` continua disparando", mas os testes só cobrem `.expx`. Implementação que ignore tudo passaria | Declarar as duas metades no `teste_funcional` |
| MÉDIA | sprint-02/tasks.md | T-02.05 exige `POST` respondendo `405`, mas nenhum teste declarado cobre o POST | Acrescentar a asserção do 405 ao `teste_integracao` |
| MÉDIA | sprint-01/fases.md, ORQUESTRADOR.md | F-01.1 e F-01.2 são declaradas paralelas, mas T-01.02 depende da fixture criada por T-01.03 | Tornar T-01.02 independente da fixture, ou declarar a dependência e ajustar o paralelismo |
| MÉDIA | sprint-03/tasks.md | T-03.03 altera `src/cli/init.ts`, que faz `rmSync` dos clones temporários na linha 136. A cópia tem que ocorrer antes dessa limpeza, e o plano não declara o ponto de inserção | Declarar que a cópia ocorre antes do descarte, e afirmar no teste que o motor existe após `executarInit` retornar |
| BAIXA | 00-DECISOES.md, sprint-02/sprint.md | D-03 registra "rota `/api/memoria` separada" como alternativa descartada, mas o plano exige exatamente essa rota | Reescrever a alternativa como "servir SOMENTE por rota sob demanda, fora do EstadoPainel" |
| BAIXA | sprint-02/tasks.md | T-02.06 não discrimina: o componente `Svg` já garante o `width` para os 12 ícones existentes | Afirmar que o ícone tem nós de traço próprios |
| BAIXA | sprint-01/sprint.md, sprint-01/fases.md | O critério fala em "as três fixtures", mas só duas são criadas; a terceira é a `projeto-ok` preexistente | Escrever "as duas fixtures novas mais `fixtures/projeto-ok`" |
| BAIXA | ORQUESTRADOR.md | A definição de pronto exige seis skills no catálogo, mas o README e o comentário "as cinco skills" não são tocados por task nenhuma | Acrescentar `README.md` e o comentário de `catalogo.ts` ao `altera` de T-03.01 |
| BAIXA | ORQUESTRADOR.md | O caminho crítico omite T-02.06, que é `depende_de` de T-02.07 | Incluir T-02.06 no caminho crítico ou marcá-la `paralelizavel: false` |

VEREDITO: NÃO — o plano não está pronto para execução autônoma.


---

# Auditoria — memox-painel (rodada 2)

Data: 2026-08-29
Rodada: 2 (reauditoria após regeneração do plano na F3) — SUPERADA pela rodada 3

Os seis achados ALTA da rodada 1 foram verificados como **endereçados**, contra o código real: `criarRepoSkill` de fato só cria `SKILL.md`/`references`/comando (T-03.02 o declara); `init.ts:136` faz `rmSync` depois do bloco de harness (D-26 confere); os call sites de `mesclarSettings` estão cobertos; D-21 declara a URL; `settings.test.ts:49` é preservado por D-23; e o schema zod discrimina em runtime.

Dois achados ALTA **novos** foram encontrados.

## Achados

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| ALTA | sprint-01/tasks.md | T-01.04 é inexecutável na ordem declarada: seu teste exige que `montarProjeto` já produza a chave `memoria`, mas quem faz isso é T-02.04, na sprint seguinte | Declarar `depende_de: [T-02.04]` ou reescrever o teste para validar o tipo contra a projeção, sem passar por `montarProjeto` |
| ALTA | sprint-01/tasks.md, sprint-01/sprint.md | Acrescentar `memoria` como chave obrigatória em `ui/src/tipos.ts` sem que o parser a produza faz `estadoFixture()` divergir do servidor, e o cast `as unknown as Estado` impede o typecheck de acusar: a sprint 01 fecharia verde com o contrato entre camadas mentindo | Declarar `memoria` como aceitando `null` até T-02.04, ou reordenar T-01.04 |
| MÉDIA | sprint-03/tasks.md | T-03.07 declara "com os dois presentes não há achado", mas `diagnosticar` emite achados independentes do memox (`sem-expx` faz return antecipado; `lock-ilegivel` e afins disparam em pasta improvisada) | Reescrever o critério como "nenhum achado com id igual a memox-sem-motor" e nomear a fixture |
| MÉDIA | sprint-02/tasks.md | T-02.10 não lista arquivo de teste, mas seus testes renderizam o `App`, cujo `usarEstado` faz `fetch` e abre `WebSocket` — em jsdom isso exige stub que a task não prevê | Acrescentar `ui/src/App.test.tsx` ao `cria` e declarar o stub |
| MÉDIA | sprint-01/tasks.md | T-01.01 e T-01.02 são `paralelizavel: true` numa fase declarada `paralelizavel: false` | Alinhar o flag da fase com o das tasks |
| MÉDIA | sprint-02/tasks.md | T-02.02 tem `altera: []` mas afirma que `MemoriaSchema` aceita a projeção que ela mesma define; divergência entre schema e projeção não tem ajuste declarado | Acrescentar `src/parser/memoria/tipos.ts` ao `altera` de T-02.02 |
| BAIXA | sprint-02/tasks.md | T-02.07 pede "o artefato contaminado do gateway", mas o artefato é `docs/relatorios/2026-08-25-OC-2026-0199-integracao/tecnico.md`; "gateway" é o título do trabalho | Citar o caminho literal no teste |
| BAIXA | sprint-03/tasks.md | T-03.08 varre só o README, mas o comentário "As cinco skills" está em `src/nucleo/catalogo.ts:2` e nenhum teste o cobre | Estender a varredura ao `catalogo.ts` |
| BAIXA | ORQUESTRADOR.md | O caminho crítico omite T-02.09, que é `depende_de` de T-02.10 tanto quanto T-02.08 | Incluir T-02.09 |

VEREDITO: NÃO — o plano não está pronto para execução autônoma.


---

# Auditoria — memox-painel (rodada 3)

Data: 2026-08-29
Rodada: 3 (reauditoria após a segunda regeneração) — SUPERADA pela rodada 4

Os oito achados da rodada 2 foram verificados como **endereçados** contra os arquivos e contra o código real. A auditoria também conferiu as asserções do plano contra o artefato real (`exemplos/indice.exemplo.json`): `sinais.arquivo["src/frete/calculo.ts"]` tem `reprovacoes_qa: 1` e uma regressão, `totais.regressoes` é `1`, e o único artefato contaminado é `docs/relatorios/2026-08-25-OC-2026-0199-integracao/tecnico.md`.

Um achado ALTA **novo**.

## Achados

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| ALTA | sprint-02/tasks.md | T-02.07, T-02.09 e T-02.10 exigem "a fixture com índice" no projeto `ui` do vitest, mas nenhuma task cria esse estado: `ui/src/telas/fixture.ts` só exporta `estadoFixture()` (lê `projeto-ok`, sem índice por D-19) e `estadoRuimFixture()` | Acrescentar `ui/src/telas/fixture.ts` ao `altera` de T-02.07 declarando `estadoMemoriaFixture()` sobre `fixtures/projeto-memoria`, e nomeá-la nos testes de T-02.07, T-02.09 e T-02.10 |
| MÉDIA | sprint-01/tasks.md | T-01.04 declara `altera` de `fixture.ts` e `telas.test.tsx`, mas nada neles precisa mudar: o cast `as unknown as Estado` absorve a chave nova | Remover os dois do `altera` de T-01.04 |
| MÉDIA | sprint-02/tasks.md | T-02.10 não declara que a asserção é assíncrona: `usarEstado` resolve `fetch` depois da primeira renderização, e o `App` mostra "carregando…" até lá | Declarar busca assíncrona no `teste_integracao` |
| MÉDIA | sprint-03/tasks.md | T-03.04 afirma `.claude/skills/memox/assets/memox.py`, mas hoje `executarInit` só materializa `.claude/skills/` quando o harness inclui `opencode`. A task não declara se a cópia é incondicional nem lista `src/harness/opencode.ts` | Declarar que a cópia ocorre para skills com hooks independentemente do harness, e listar o arquivo se a lógica for compartilhada |
| MÉDIA | sprint-03/tasks.md | T-03.03 muda o retorno de `detectarLayout`, consumido por `src/cli/init.ts` para montar `SkillMontavel`, mas nem `init.ts` nem `montagem.ts` estão no `altera` | Acrescentá-los ao `altera` de T-03.03 ou declarar que T-03.04 os toca |
| BAIXA | sprint-02/tasks.md | T-02.06 não distingue `Icone.Memoria` de uma cópia de outro ícone | Afirmar o `viewBox`, ou aceitar por custo/valor |
| BAIXA | sprint-03/tasks.md | T-03.08 não nomeia as linhas do README a alterar, e "cinco estágios" (linhas 95 e 140) não deve ser trocado | Nomear as três linhas e afirmar que "cinco estágios" permanece |
| BAIXA | ORQUESTRADOR.md | A definição de pronto não repete o `405` no POST que T-02.05 exige | Acrescentar o `405` |

VEREDITO: NÃO — o plano não está pronto para execução autônoma.


---

# Auditoria — memox-painel (rodada 4)

Data: 2026-08-29
Rodada: 4 (reauditoria após a terceira regeneração) — **rodada válida**

Os achados da rodada 3 foram verificados como endereçados. A auditoria conferiu contra o código real: todos os arquivos em `altera` existem; os call sites de `mesclarSettings` estão completos; `init.ts:136` faz `rmSync` depois do bloco de harness; `verificarCaminhos` não rejeitaria a skill memox real; `ehCamada` só avisa, então `camada: true` é seguro; os valores do índice de exemplo batem literalmente; nenhum ciclo de dependência; nenhum paralelismo falso.

## Achados

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | sprint-03/tasks.md | T-03.08 enumera as ocorrências de "cinco skills" no README como as linhas 44, 89 e 213, mas há uma quarta na 544, dentro de bloco de código. A varredura exige zero ocorrências e falharia | Acrescentar a linha 544 à enumeração — **CORRIGIDO na rodada 4** |
| MÉDIA | sprint-03/tasks.md | T-03.03 acrescenta `hooks` a `SkillMontavel`, mas `montagem.test.ts:22` e `opencode.test.ts:23` constroem o objeto por literal e não estão em `altera`; o tsconfig exclui testes, então o typecheck não acusa | Declarar o campo como opcional — **CORRIGIDO na rodada 4** |
| MÉDIA | sprint-01/tasks.md | T-01.03 fala em "objeto montado a partir da fixture", mas `projetar.ts` só nasce em T-02.02: a projeção do teste tem que ser construída inline | Declarar isso no bloco — **CORRIGIDO na rodada 4** |
| BAIXA | sprint-02/tasks.md | T-02.02 não discrimina a regra D-10 completa: `calculo.ts` também tem o maior número de trabalhos, então ordenação só por `trabalhos` passaria igual | Aceito por custo/valor: a ausência de ordenação é capturada |
| BAIXA | sprint-03/tasks.md | T-03.03: a prosa cita o filtro `.md` dos comandos, mas hooks são `.sh`. O `criterio_aceite` está correto | Reescrever a prosa — **CORRIGIDO na rodada 4** |
| BAIXA | sprint-03/tasks.md, README.md | T-03.07 acrescenta um verificador, mas `README.md:538` diz "os treze verificadores" e nenhuma task guarda essa linha | Acrescentar à varredura de T-03.08 — **CORRIGIDO na rodada 4** |
| BAIXA | sprint-03/tasks.md | `src/nucleo/catalogo.test.ts:5` tem o título "tem as cinco skills"; a varredura de T-03.08 não cobre o arquivo | Acrescentar à varredura — **CORRIGIDO na rodada 4** |
| BAIXA | base/02-painel-estado-e-api.md | A base omite a chave `omitidas`, que existe em `montar.ts`. Não afeta task nenhuma | Registrado; a chave nasceu de trabalho paralelo em curso no repositório |

VEREDITO: SIM — o plano está pronto para execução autônoma.

Os achados MÉDIA e as BAIXA acionáveis foram corrigidos após o veredito, por serem ajustes de texto do plano que não alteram sua estrutura. Nenhum achado ALTA existiu nesta rodada.
