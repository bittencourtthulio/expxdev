---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: expx-cli
sprint_id: sprint-03
atualizado_em: 2026-08-29
tasks:
  - id: T-03.01
    titulo: Geracao de plugin.json e marketplace.json
    fase: F-03.1
    status: concluida
    objetivo: Produzir os dois manifestos com name expx e o plugin dentro do marketplace
    arquivos:
      cria: [src/plugin/manifestos.ts, src/plugin/manifestos.test.ts]
      altera: []
    teste_integracao: Gera os dois manifestos e valida cada um contra um esquema zod
    teste_funcional: Dado o nome expx, o marketplace aponta source ./plugins/expx sem subir de diretorio
    criterio_aceite: plugin.json tem name expx e o source do marketplace nao contem ..
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-03.02
    titulo: Copia das skills e comandos selecionados
    fase: F-03.1
    status: concluida
    objetivo: Levar para o plugin apenas as skills escolhidas e seus comandos
    arquivos:
      cria: [src/plugin/montagem.ts, src/plugin/montagem.test.ts]
      altera: []
    teste_integracao: Monta o plugin com duas de tres skills e confirma que a terceira nao aparece
    teste_funcional: Dado sprintx selecionado, skills/sprintx/SKILL.md e commands/sprintx.md existem no plugin
    criterio_aceite: O plugin contem exatamente as skills selecionadas e nenhuma outra
    depende_de: [T-03.01]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-03.03
    titulo: Escrita atomica com troca por rename
    fase: F-03.1
    status: concluida
    objetivo: Garantir que .expx nunca fique inconsistente se a montagem falhar no meio
    arquivos:
      cria: [src/plugin/atomico.ts, src/plugin/atomico.test.ts]
      altera: []
    teste_integracao: Interrompe a montagem no meio e confirma que o .expx anterior permanece intacto
    teste_funcional: Dada uma falha durante a montagem, a pasta temporaria e removida e nada e trocado
    criterio_aceite: Apos falha simulada nao existe pasta .tmp residual e o .expx anterior esta integro
    depende_de: [T-03.02]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-03.04
    titulo: Merge preservando chaves alheias
    fase: F-03.2
    status: concluida
    objetivo: Acrescentar as chaves do expx sem tocar no restante do settings.json
    arquivos:
      cria: [src/harness/settings.ts, src/harness/settings.test.ts]
      altera: []
    teste_integracao: Mescla sobre a fixture settings-valido e confirma que as chaves alheias sobrevivem
    teste_funcional: Dado enabledPlugins como array, le e escreve como objeto sem perder as entradas antigas
    criterio_aceite: Toda chave presente antes do merge continua presente e com o mesmo valor depois
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
  - id: T-03.05
    titulo: Backup datado e recusa de JSON invalido
    fase: F-03.2
    status: concluida
    objetivo: Proteger o arquivo do usuario antes de qualquer escrita
    arquivos:
      cria: [src/harness/backup.ts, src/harness/backup.test.ts]
      altera: []
    teste_integracao: Roda o merge sobre settings-invalido e confirma que nada foi escrito
    teste_funcional: Dado um settings valido, existe uma copia com a data no nome antes da escrita
    criterio_aceite: settings-invalido devolve erro sem escrever e settings-valido gera arquivo de backup datado
    depende_de: [T-03.04]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-03.06
    titulo: Materializacao para o OpenCode
    fase: F-03.3
    status: concluida
    objetivo: Copiar skills e comandos para os diretorios que o OpenCode le
    arquivos:
      cria: [src/harness/opencode.ts, src/harness/opencode.test.ts]
      altera: []
    teste_integracao: Materializa duas skills e confirma os caminhos em .claude/skills e .opencode/commands
    teste_funcional: Dado o comando sprintx-sprints, o arquivo em .opencode/commands nao tem prefixo expx
    criterio_aceite: As skills aparecem so em .claude/skills e os comandos em .opencode/commands sem prefixo
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
---

# Tasks — Sprint 03

---

```yaml
id: T-03.01
titulo: Geração de plugin.json e marketplace.json
objetivo: Produzir os dois manifestos com name expx e o plugin dentro do marketplace
arquivos:
  cria: [src/plugin/manifestos.ts, src/plugin/manifestos.test.ts]
  altera: []
teste_integracao: Gera os dois manifestos e valida cada um contra um esquema zod
teste_funcional: Dado o nome expx, o marketplace aponta source ./plugins/expx sem subir de diretório
criterio_aceite: plugin.json tem name expx e o source do marketplace não contém ..
depende_de: []
paralelizavel: false
status: concluida
```

---

```yaml
id: T-03.02
titulo: Cópia das skills e comandos selecionados
objetivo: Levar para o plugin apenas as skills escolhidas e seus comandos
arquivos:
  cria: [src/plugin/montagem.ts, src/plugin/montagem.test.ts]
  altera: []
teste_integracao: Monta o plugin com duas de três skills e confirma que a terceira não aparece
teste_funcional: Dado sprintx selecionado, skills/sprintx/SKILL.md e commands/sprintx.md existem no plugin
criterio_aceite: O plugin contém exatamente as skills selecionadas e nenhuma outra
depende_de: [T-03.01]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-03.03
titulo: Escrita atômica com troca por rename
objetivo: Garantir que .expx nunca fique inconsistente se a montagem falhar no meio
arquivos:
  cria: [src/plugin/atomico.ts, src/plugin/atomico.test.ts]
  altera: []
teste_integracao: Interrompe a montagem no meio e confirma que o .expx anterior permanece intacto
teste_funcional: Dada uma falha durante a montagem, a pasta temporária é removida e nada é trocado
criterio_aceite: Após falha simulada não existe pasta .tmp residual e o .expx anterior está íntegro
depende_de: [T-03.02]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-03.04
titulo: Merge preservando chaves alheias
objetivo: Acrescentar as chaves do expx sem tocar no restante do settings.json
arquivos:
  cria: [src/harness/settings.ts, src/harness/settings.test.ts]
  altera: []
teste_integracao: Mescla sobre a fixture settings-valido e confirma que as chaves alheias sobrevivem
teste_funcional: Dado enabledPlugins como array, lê e escreve como objeto sem perder as entradas antigas
criterio_aceite: Toda chave presente antes do merge continua presente e com o mesmo valor depois
depende_de: []
paralelizavel: true
status: concluida
```

---

```yaml
id: T-03.05
titulo: Backup datado e recusa de JSON inválido
objetivo: Proteger o arquivo do usuário antes de qualquer escrita
arquivos:
  cria: [src/harness/backup.ts, src/harness/backup.test.ts]
  altera: []
teste_integracao: Roda o merge sobre settings-invalido e confirma que nada foi escrito
teste_funcional: Dado um settings válido, existe uma cópia com a data no nome antes da escrita
criterio_aceite: settings-invalido devolve erro sem escrever e settings-valido gera arquivo de backup datado
depende_de: [T-03.04]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-03.06
titulo: Materialização para o OpenCode
objetivo: Copiar skills e comandos para os diretórios que o OpenCode lê
arquivos:
  cria: [src/harness/opencode.ts, src/harness/opencode.test.ts]
  altera: []
teste_integracao: Materializa duas skills e confirma os caminhos em .claude/skills e .opencode/commands
teste_funcional: Dado o comando sprintx-sprints, o arquivo em .opencode/commands não tem prefixo expx
criterio_aceite: As skills aparecem só em .claude/skills e os comandos em .opencode/commands sem prefixo
depende_de: []
paralelizavel: true
status: concluida
```
