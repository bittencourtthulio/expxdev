---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: memox-painel
sprint_id: sprint-03
atualizado_em: 2026-08-29
tasks:
  - id: T-03.01
    titulo: Acrescentar memox ao catalogo
    fase: F-03.1
    status: concluida
    objetivo: Registrar memox como sexta skill instalavel marcada como camada
    arquivos:
      cria: []
      altera: [src/nucleo/catalogo.ts, src/nucleo/catalogo.test.ts]
    teste_integracao: Le o CATALOGO e espera seis entradas sem URL repetida
    teste_funcional: Dado o nome memox, buscarNoCatalogo devolve a entrada com a URL do MemoX e ehCamada devolve true
    criterio_aceite: CATALOGO tem seis entradas, memox aponta para github.com/bittencourtthulio/MemoX e ehCamada de memox devolve true
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-03.02
    titulo: Fixture de repositorio com hooks e assets
    fase: F-03.1
    status: concluida
    objetivo: Ensinar criarRepoSkill a montar hooks e assets no repo de fixture
    arquivos:
      cria: []
      altera: [src/teste/repo-fixture.ts, src/teste/repo-fixture.test.ts]
    teste_integracao: Cria um repo de fixture com hooks e assets e lista os arquivos gravados
    teste_funcional: Dado hooks memox-injetar.sh e asset memox.py, os dois existem no repo criado e o hook e executavel
    criterio_aceite: criarRepoSkill com hooks e assets grava os arquivos pedidos e o hook fica com bit de execucao
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-03.03
    titulo: Detectar os hooks da skill
    fase: F-03.1
    status: concluida
    objetivo: Fazer detectarLayout devolver tambem os arquivos de hook da skill
    arquivos:
      cria: []
      altera: [src/nucleo/layout.ts, src/nucleo/layout.test.ts, src/plugin/montagem.ts, src/cli/init.ts]
    teste_integracao: Detecta o layout de um repo de fixture com hooks e espera a lista preenchida
    teste_funcional: Dado um repo com memox-injetar.sh, o layout devolve esse caminho em hooks e devolve lista vazia num repo sem hooks
    criterio_aceite: detectarLayout devolve hooks com os arquivos que comecam com o nome da skill, e lista vazia quando nao ha
    depende_de: [T-03.02]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-03.04
    titulo: Copiar hooks e skill para o harness
    fase: F-03.1
    status: concluida
    objetivo: Materializar hooks em .claude/hooks e a skill em .claude/skills antes de descartar os clones
    arquivos:
      cria: [src/harness/hooks.ts, src/harness/hooks.test.ts]
      altera: [src/cli/init.ts, src/harness/opencode.ts]
    teste_integracao: Roda executarInit com um repo de fixture e espera hook e motor presentes apos o retorno
    teste_funcional: Apos executarInit, .claude/hooks/memox-injetar.sh e executavel e .claude/skills/memox/assets/memox.py existe
    criterio_aceite: Apos executarInit retornar, o hook existe com bit de execucao e o motor existe no caminho DIR_HOOK/../skills/memox/assets/memox.py
    depende_de: [T-03.03]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-03.05
    titulo: Registrar os hooks em settings.json
    fase: F-03.2
    status: concluida
    objetivo: Dar a mesclarSettings um terceiro parametro de hooks e registrar os dois eventos
    arquivos:
      cria: []
      altera: [src/harness/settings.ts, src/harness/settings.test.ts, src/harness/backup.test.ts, src/cli/init.ts]
    teste_integracao: Mescla num settings existente com hooks e espera as chaves anteriores preservadas
    teste_funcional: Sem hooks o arquivo mantem as duas chaves de hoje e com hooks ganha uma entrada em UserPromptSubmit e uma em Stop
    criterio_aceite: Sem hooks settings tem exatamente enabledPlugins e extraKnownMarketplaces, e com hooks ganha os dois eventos sem perder chave preexistente
    depende_de: [T-03.04]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-03.06
    titulo: Tornar o registro de hook idempotente
    fase: F-03.2
    status: concluida
    objetivo: Impedir entrada duplicada de hook quando o init roda duas vezes
    arquivos:
      cria: []
      altera: [src/harness/settings.ts, src/harness/settings.test.ts]
    teste_integracao: Chama mesclarSettings duas vezes com os mesmos hooks e compara o arquivo resultante
    teste_funcional: Dado o mesmo comando ja registrado, a segunda chamada mantem exatamente uma entrada por evento
    criterio_aceite: Duas execucoes seguidas produzem uma unica entrada por evento em settings.json
    depende_de: [T-03.05]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-03.07
    titulo: Diagnosticar instalacao do memox
    fase: F-03.3
    status: concluida
    objetivo: Fazer o doctor acusar hook do memox sem o motor irmao
    arquivos:
      cria: []
      altera: [src/doctor/verificadores.ts, src/doctor/verificadores.test.ts]
    teste_integracao: Diagnostica uma pasta com hook e sem motor e espera achado de severidade erro
    teste_funcional: Sobre a fixture cli/projeto-com-expx, hook sem motor produz achado memox-sem-motor e com o motor esse id some
    criterio_aceite: Sobre a fixture cli/projeto-com-expx, ha achado com id memox-sem-motor quando falta o motor e nenhum achado com esse id quando ele existe
    depende_de: [T-03.04]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-03.08
    titulo: Atualizar a contagem de skills na documentacao
    fase: F-03.3
    status: concluida
    objetivo: Corrigir o texto que diz cinco skills agora que sao seis
    arquivos:
      cria: []
      altera: [README.md, src/nucleo/catalogo.ts, src/nucleo/catalogo.test.ts]
    teste_integracao: Varre README.md, catalogo.ts e catalogo.test.ts procurando cinco skills e espera nenhuma ocorrencia
    teste_funcional: Dados os dois arquivos, cinco skills devolve zero linhas, seis skills devolve ao menos uma no README, e cinco estagios continua presente
    criterio_aceite: Nenhuma ocorrencia de cinco skills nos tres arquivos, treze verificadores vira quatorze, e cinco estagios permanece intacto
    depende_de: [T-03.01]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
---

# Tasks — Sprint 03

> Um bloco por task. Na execução (F6), a linha `status` é atualizada em cada transição.

> **Nota das rodadas 2 a 4 (pós-auditoria).** Após o veredito SIM da rodada 4, foram aplicados os ajustes de texto dos achados MÉDIA/BAIXA: enumeração completa das ocorrências de "cinco skills" (a linha 544 faltava), campo `hooks` declarado opcional, e a prosa do filtro corrigida (hooks são `.sh`). Na rodada 4: T-03.03 declarou que altera `montagem.ts` e `init.ts` (o campo `hooks` precisa trafegar até a cópia), T-03.04 declarou que a cópia para `.claude/skills/` é incondicional para skill com hooks e listou `opencode.ts`, e T-03.08 passou a proteger "cinco estágios". Na rodada 3: T-03.07 troca "nenhum achado" por "nenhum achado com id `memox-sem-motor`" e nomeia a fixture, e T-03.08 passa a varrer também `src/nucleo/catalogo.ts`. Na rodada 2, cinco correções: a URL do repositório passou a ser explícita (D-21); a fixture de repositório com hooks virou task própria, T-03.02, porque `criarRepoSkill` não sabia criar hooks nem assets (D-25); `mesclarSettings` ganhou assinatura declarada e os call sites entraram no `altera` (D-22); o comportamento sem hooks foi fixado para não quebrar o teste de chaves exatas (D-23); e o ponto de inserção no `init` passou a ser declarado (D-26). A contagem "cinco skills" na documentação virou T-03.08.

---

```yaml
id: T-03.01
titulo: Acrescentar memox ao catálogo
objetivo: Registrar memox como sexta skill instalável, marcada como camada
arquivos:
  cria: []
  altera: [src/nucleo/catalogo.ts, src/nucleo/catalogo.test.ts]
teste_integracao: Lê o CATALOGO e espera seis entradas sem URL repetida
teste_funcional: Dado o nome memox, buscarNoCatalogo devolve a entrada com a URL do MemoX e ehCamada devolve true
criterio_aceite: CATALOGO tem seis entradas, memox aponta para github.com/bittencourtthulio/MemoX e ehCamada de memox devolve true
depende_de: []
paralelizavel: false
status: concluida  # 2026-08-29 · suite: 294 passed, 0 failed
```

URL conferida com `git ls-remote` (D-21). `camada: true` porque o memox não tem fluxo próprio (D-13).

---

```yaml
id: T-03.02
titulo: Fixture de repositório com hooks e assets
objetivo: Ensinar criarRepoSkill a montar hooks e assets no repo de fixture
arquivos:
  cria: []
  altera: [src/teste/repo-fixture.ts, src/teste/repo-fixture.test.ts]
teste_integracao: Cria um repo de fixture com hooks e assets e lista os arquivos gravados
teste_funcional: Dado hooks memox-injetar.sh e asset memox.py, os dois existem no repo criado e o hook é executável
criterio_aceite: criarRepoSkill com hooks e assets grava os arquivos pedidos e o hook fica com bit de execução
depende_de: []
paralelizavel: false
status: concluida  # 2026-08-29 · suite: 294 passed, 0 failed
```

Sem isso as tasks seguintes não têm o que testar: hoje `criarRepoSkill` só cria `SKILL.md`, `references/01.md` e um comando.

---

```yaml
id: T-03.03
titulo: Detectar os hooks da skill
objetivo: Fazer detectarLayout devolver também os arquivos de hook da skill
arquivos:
  cria: []
  altera: [src/nucleo/layout.ts, src/nucleo/layout.test.ts, src/plugin/montagem.ts, src/cli/init.ts]
teste_integracao: Detecta o layout de um repo de fixture com hooks e espera a lista preenchida
teste_funcional: Dado um repo com memox-injetar.sh, o layout devolve esse caminho em hooks; num repo sem hooks devolve lista vazia
criterio_aceite: detectarLayout devolve hooks com os arquivos que começam com o nome da skill, e lista vazia quando não há
depende_de: [T-03.02]
paralelizavel: false
status: concluida  # 2026-08-29 · suite: 294 passed, 0 failed
```

Mesmo **prefixo** dos comandos (`<nome>` ou `<nome>-*`), sem o filtro de extensão `.md`: hooks são `.sh`.

**Só arquivo é hook.** A sprintx real tem `.claude/hooks/sprintx/` como DIRETÓRIO, e tratá-lo
como hook faz o `cp` do `init` falhar com `EISDIR`, derrubando a instalação inteira — defeito
encontrado na verificação de ponta a ponta contra os repositórios reais, não pelos testes de
fixture. A pasta já viaja junto na cópia da própria skill.

O campo `hooks` precisa trafegar do layout até a cópia: `SkillMontavel` (`src/plugin/montagem.ts`) ganha o campo e `src/cli/init.ts` o preenche a partir do layout detectado. Por isso os dois entram no `altera`.

**O campo é opcional (`hooks?: readonly string[]`)**: `src/plugin/montagem.test.ts` e `src/harness/opencode.test.ts` constroem `SkillMontavel` por literal, e o `tsconfig` exclui `**/*.test.ts` — um campo obrigatório não seria acusado pelo typecheck e quebraria em runtime.

---

```yaml
id: T-03.04
titulo: Copiar hooks e skill para o harness
objetivo: Materializar hooks em .claude/hooks e a skill em .claude/skills antes de descartar os clones
arquivos:
  cria: [src/harness/hooks.ts, src/harness/hooks.test.ts]
  altera: [src/cli/init.ts, src/harness/opencode.ts]
teste_integracao: Roda executarInit com um repo de fixture e espera hook e motor presentes após o retorno
teste_funcional: Após executarInit, .claude/hooks/memox-injetar.sh é executável e .claude/skills/memox/assets/memox.py existe
criterio_aceite: Após executarInit retornar, o hook existe com bit de execução e o motor existe no caminho DIR_HOOK/../skills/memox/assets/memox.py
depende_de: [T-03.03]
paralelizavel: false
status: concluida  # 2026-08-29 · suite: 294 passed, 0 failed
```

A cópia acontece **antes** do `rmSync` dos clones temporários no final do `init` (D-26). O teste afirma depois do retorno de `executarInit` justamente para pegar cópia feita tarde demais.

**A cópia da skill para `.claude/skills/<nome>` é incondicional para skill que tem hooks**, independentemente do harness escolhido: hoje `.claude/skills/` só é materializado quando o harness inclui `opencode` (`src/harness/opencode.ts`), mas o hook do memox resolve o motor como `DIR_HOOK/../skills/memox/assets/memox.py` e ficaria inerte num projeto só-Claude-Code (D-15). `src/harness/opencode.ts` entra no `altera` porque a lógica de materialização é compartilhada.

---

```yaml
id: T-03.05
titulo: Registrar os hooks em settings.json
objetivo: Dar a mesclarSettings um terceiro parâmetro de hooks e registrar os dois eventos
arquivos:
  cria: []
  altera: [src/harness/settings.ts, src/harness/settings.test.ts, src/harness/backup.test.ts, src/cli/init.ts]
teste_integracao: Mescla num settings existente com hooks e espera as chaves anteriores preservadas
teste_funcional: Sem hooks o arquivo mantém as duas chaves de hoje; com hooks ganha uma entrada em UserPromptSubmit e uma em Stop
criterio_aceite: Sem hooks settings tem exatamente enabledPlugins e extraKnownMarketplaces; com hooks ganha os dois eventos sem perder chave preexistente
depende_de: [T-03.04]
paralelizavel: false
status: concluida  # 2026-08-29 · suite: 294 passed, 0 failed
```

O parâmetro é necessário porque a função não conhece a lista de skills (D-22). Sem hooks o arquivo não muda de forma, o que preserva o teste `settings.test.ts:49` (D-23). Os call sites `src/cli/init.ts` e `src/harness/backup.test.ts` acompanham a assinatura.

---

```yaml
id: T-03.06
titulo: Tornar o registro de hook idempotente
objetivo: Impedir entrada duplicada de hook quando o init roda duas vezes
arquivos:
  cria: []
  altera: [src/harness/settings.ts, src/harness/settings.test.ts]
teste_integracao: Chama mesclarSettings duas vezes com os mesmos hooks e compara o arquivo resultante
teste_funcional: Dado o mesmo comando já registrado, a segunda chamada mantém exatamente uma entrada por evento
criterio_aceite: Duas execuções seguidas produzem uma única entrada por evento em settings.json
depende_de: [T-03.05]
paralelizavel: false
status: concluida  # 2026-08-29 · suite: 294 passed, 0 failed
```

Comparação pelo `command` (D-16): hook duplicado faria o memox rodar duas vezes por prompt.

---

```yaml
id: T-03.07
titulo: Diagnosticar instalação do memox
objetivo: Fazer o doctor acusar hook do memox sem o motor irmão
arquivos:
  cria: []
  altera: [src/doctor/verificadores.ts, src/doctor/verificadores.test.ts]
teste_integracao: Diagnostica uma pasta com hook e sem motor e espera achado de severidade erro
teste_funcional: Sobre a fixture cli/projeto-com-expx, hook sem motor produz achado memox-sem-motor e com o motor esse id some
criterio_aceite: Sobre a fixture cli/projeto-com-expx, há achado com id memox-sem-motor quando falta o motor e nenhum achado com esse id quando ele existe
depende_de: [T-03.04]
paralelizavel: false
status: concluida  # 2026-08-29 · suite: 294 passed, 0 failed
```

O hook sai `0` em silêncio em qualquer erro, então sem o doctor a instalação quebrada é invisível (D-17).

O critério fala em **ausência do id `memox-sem-motor`**, não em "nenhum achado": `diagnosticar` emite achados independentes do memox (`sem-expx` faz `return` antecipado, `lock-ilegivel` e afins disparam em pasta improvisada), então exigir zero achados seria falso para quase toda fixture. Por isso a fixture de partida é nomeada.

---

```yaml
id: T-03.08
titulo: Atualizar a contagem de skills na documentação
objetivo: Corrigir o texto que diz cinco skills agora que são seis
arquivos:
  cria: []
  altera: [README.md, src/nucleo/catalogo.ts, src/nucleo/catalogo.test.ts]
teste_integracao: Varre README.md, catalogo.ts e catalogo.test.ts procurando cinco skills e espera nenhuma ocorrência
teste_funcional: Dados os dois arquivos, cinco skills devolve zero linhas, seis skills devolve ao menos uma no README, e cinco estágios continua presente
criterio_aceite: Nenhuma ocorrência de cinco skills nos três arquivos, treze verificadores vira quatorze, e cinco estágios permanece intacto
depende_de: [T-03.01]
paralelizavel: false
status: concluida  # 2026-08-29 · suite: 294 passed, 0 failed
```

Ocorrências de **"cinco skills"** a trocar, conferidas por `grep`: `README.md` linhas **44, 89, 213 e 544**, `src/nucleo/catalogo.ts:2` e o título do teste em `src/nucleo/catalogo.test.ts:5`. A varredura exige zero ocorrências, então a enumeração precisa ser completa — a linha 544 está dentro de um bloco de código e é fácil de esquecer.

Trocar também `README.md:538` — "os treze verificadores" vira "os quatorze", porque T-03.07 acrescenta um.

As linhas que dizem **"cinco estágios"** (95 e 140) falam dos estágios E1–E5 da runx e **permanecem como estão** — trocá-las seria erro.
