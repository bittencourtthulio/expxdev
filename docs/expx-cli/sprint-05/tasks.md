---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: expx-cli
sprint_id: sprint-05
atualizado_em: 2026-08-29
tasks:
  - id: T-05.01
    titulo: Comparacao com o lock e resumo do que mudou
    fase: F-05.1
    status: concluida
    objetivo: Descobrir a versao alvo de cada skill e montar o resumo antes de aplicar
    arquivos:
      cria: [src/update/comparar.ts, src/update/comparar.test.ts]
      altera: []
    teste_integracao: Compara um lock antigo com um repositorio de fixture atualizado e lista a diferenca
    teste_funcional: Dada skill ja na versao alvo, e reportada como em dia e nao entra no plano de aplicacao
    criterio_aceite: Skill em dia nao e tocada e skill desatualizada aparece com versao atual e nova
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-05.02
    titulo: Bloqueio por modificacao local
    fase: F-05.1
    status: concluida
    objetivo: Nunca sobrescrever skill cujo disco divergiu do lock
    arquivos:
      cria: [src/update/modificacao.ts, src/update/modificacao.test.ts]
      altera: []
    teste_integracao: Altera um arquivo de skill instalada e roda o update confirmando que nada foi sobrescrito
    teste_funcional: Dado um arquivo alterado, a saida lista esse caminho e oferece as tres opcoes de decisao
    criterio_aceite: Com modificacao local detectada o arquivo em disco permanece byte a byte igual ao alterado
    depende_de: [T-05.01]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-05.03
    titulo: Bloqueio por schema incompativel
    fase: F-05.1
    status: concluida
    objetivo: Recusar skill que exija versao de expx-schema maior que a suportada
    arquivos:
      cria: [src/update/compatibilidade.ts, src/update/compatibilidade.test.ts]
      altera: [src/index.ts]
    teste_integracao: Roda o update contra uma skill de fixture que declara expx_schema 2 e confirma o bloqueio
    teste_funcional: Dada skill com expx_schema 2 e CLI que suporta 1, a skill nao e aplicada e o motivo e informado
    criterio_aceite: Skill com schema maior nao e aplicada e a saida diz que e preciso atualizar o CLI
    depende_de: [T-05.02]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-05.04
    titulo: Flags do update e aviso de rollback
    fase: F-05.1
    status: concluida
    objetivo: Implementar check to latest e yes e informar que o rollback e pelo versionador
    arquivos:
      cria: [src/update/flags.ts, src/update/flags.test.ts]
      altera: []
    teste_integracao: Roda o update com --check e confirma que nenhum arquivo foi alterado
    teste_funcional: Dado --latest, a skill fica marcada como nao travada no lock e a saida avisa
    criterio_aceite: Com --check nada e escrito e toda execucao que aplica cita o rollback pelo versionador
    depende_de: [T-05.03]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-05.05
    titulo: Verificadores do doctor
    fase: F-05.2
    status: concluida
    objetivo: Implementar os onze verificadores com correcao sugerida em cada achado
    arquivos:
      cria: [src/doctor/verificadores.ts, src/doctor/verificadores.test.ts]
      altera: []
    teste_integracao: Roda o doctor sobre as tres fixtures quebradas e confirma um achado por defeito
    teste_funcional: Dada a fixture quebrado-gitignore, o achado diz que .expx esta sendo ignorado
    criterio_aceite: Cada fixture quebrada produz o achado correspondente e projeto sadio produz zero achados
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
  - id: T-05.06
    titulo: Verificacao de efeito e colisao entre harnesses
    fase: F-05.2
    status: concluida
    objetivo: Conferir se a skill realmente ficou disponivel e se ha copia duplicada
    arquivos:
      cria: [src/doctor/efeito.ts, src/doctor/efeito.test.ts]
      altera: []
    teste_integracao: Monta um projeto com a mesma skill em .claude/skills e .opencode/skills e confirma o achado
    teste_funcional: Dada skill duplicada nos dois diretorios, o achado nomeia a skill e os dois caminhos
    criterio_aceite: Skill presente nos dois diretorios gera achado de colisao e presente em um so nao gera
    depende_de: [T-05.05]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-05.07
    titulo: Renomeacao do pacote e empacotamento
    fase: F-05.3
    status: concluida
    objetivo: Publicar como expx-cli com o binario expx sem quebrar o painel
    arquivos:
      cria: []
      altera: [package.json, README.md, .npmignore]
    teste_integracao: Roda npm pack e confirma que o tarball contem dist e os dois binarios declarados
    teste_funcional: Dado o tarball instalado, expx --ajuda lista os seis subcomandos
    criterio_aceite: O tarball tem name expx-cli com bin expx e bin expx-painel e ambos executam
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
---

# Tasks — Sprint 05

---

```yaml
id: T-05.01
titulo: Comparação com o lock e resumo do que mudou
objetivo: Descobrir a versão alvo de cada skill e montar o resumo antes de aplicar
arquivos:
  cria: [src/update/comparar.ts, src/update/comparar.test.ts]
  altera: []
teste_integracao: Compara um lock antigo com um repositório de fixture atualizado e lista a diferença
teste_funcional: Dada skill já na versão alvo, é reportada como em dia e não entra no plano de aplicação
criterio_aceite: Skill em dia não é tocada e skill desatualizada aparece com versão atual e nova
depende_de: []
paralelizavel: false
status: concluida
```

---

```yaml
id: T-05.02
titulo: Bloqueio por modificação local
objetivo: Nunca sobrescrever skill cujo disco divergiu do lock
arquivos:
  cria: [src/update/modificacao.ts, src/update/modificacao.test.ts]
  altera: []
teste_integracao: Altera um arquivo de skill instalada e roda o update confirmando que nada foi sobrescrito
teste_funcional: Dado um arquivo alterado, a saída lista esse caminho e oferece as três opções de decisão
criterio_aceite: Com modificação local detectada o arquivo em disco permanece byte a byte igual ao alterado
depende_de: [T-05.01]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-05.03
titulo: Bloqueio por schema incompatível
objetivo: Recusar skill que exija versão de expx-schema maior que a suportada
arquivos:
  cria: [src/update/compatibilidade.ts, src/update/compatibilidade.test.ts]
  altera: [src/index.ts]
teste_integracao: Roda o update contra uma skill de fixture que declara expx_schema 2 e confirma o bloqueio
teste_funcional: Dada skill com expx_schema 2 e CLI que suporta 1, a skill não é aplicada e o motivo é informado
criterio_aceite: Skill com schema maior não é aplicada e a saída diz que é preciso atualizar o CLI
depende_de: [T-05.02]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-05.04
titulo: Flags do update e aviso de rollback
objetivo: Implementar check, to, latest e yes, e informar que o rollback é pelo versionador
arquivos:
  cria: [src/update/flags.ts, src/update/flags.test.ts]
  altera: []
teste_integracao: Roda o update com --check e confirma que nenhum arquivo foi alterado
teste_funcional: Dado --latest, a skill fica marcada como não travada no lock e a saída avisa
criterio_aceite: Com --check nada é escrito e toda execução que aplica cita o rollback pelo versionador
depende_de: [T-05.03]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-05.05
titulo: Verificadores do doctor
objetivo: Implementar os onze verificadores com correção sugerida em cada achado
arquivos:
  cria: [src/doctor/verificadores.ts, src/doctor/verificadores.test.ts]
  altera: []
teste_integracao: Roda o doctor sobre as três fixtures quebradas e confirma um achado por defeito
teste_funcional: Dada a fixture quebrado-gitignore, o achado diz que .expx está sendo ignorado
criterio_aceite: Cada fixture quebrada produz o achado correspondente e projeto sadio produz zero achados
depende_de: []
paralelizavel: true
status: concluida
```

---

```yaml
id: T-05.06
titulo: Verificação de efeito e colisão entre harnesses
objetivo: Conferir se a skill realmente ficou disponível e se há cópia duplicada
arquivos:
  cria: [src/doctor/efeito.ts, src/doctor/efeito.test.ts]
  altera: []
teste_integracao: Monta um projeto com a mesma skill em .claude/skills e .opencode/skills e confirma o achado
teste_funcional: Dada skill duplicada nos dois diretórios, o achado nomeia a skill e os dois caminhos
criterio_aceite: Skill presente nos dois diretórios gera achado de colisão e presente em um só não gera
depende_de: [T-05.05]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-05.07
titulo: Renomeação do pacote e empacotamento
objetivo: Publicar como @expx/cli com o binário expx sem quebrar o painel
arquivos:
  cria: []
  altera: [package.json, README.md, .npmignore]
teste_integracao: Roda npm pack e confirma que o tarball contém dist e os dois binários declarados
teste_funcional: Dado o tarball instalado, expx --ajuda lista os seis subcomandos
criterio_aceite: O tarball tem name @expx/cli com bin expx e bin expx-painel e ambos executam
depende_de: []
paralelizavel: true
status: concluida
```
