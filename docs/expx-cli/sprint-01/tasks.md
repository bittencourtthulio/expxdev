---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: expx-cli
sprint_id: sprint-01
atualizado_em: 2026-08-29
tasks:
  - id: T-01.01
    titulo: Fixtures de projeto limpo e com expx existente
    fase: F-01.1
    status: concluida
    objetivo: Criar os dois cenarios base de projeto que init e reconfiguracao usam
    arquivos:
      cria: [fixtures/cli/projeto-limpo/.gitkeep, fixtures/cli/projeto-com-expx/.expx/expx-lock.json, fixtures/cli/projeto-com-expx/.claude/settings.json]
      altera: []
    teste_integracao: Le as duas fixtures do disco e confirma que projeto-limpo nao tem .expx e projeto-com-expx tem
    teste_funcional: Dado fixtures/cli/projeto-com-expx, o lock e JSON valido com a chave skills
    criterio_aceite: As duas pastas existem e o lock de projeto-com-expx faz JSON.parse sem lancar
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
  - id: T-01.02
    titulo: Fixtures de settings.json ausente, valido e invalido
    fase: F-01.1
    status: concluida
    objetivo: Cobrir os tres estados de settings.json que o merge precisa tratar
    arquivos:
      cria: [fixtures/cli/settings-ausente/.gitkeep, fixtures/cli/settings-valido/.claude/settings.json, fixtures/cli/settings-invalido/.claude/settings.json]
      altera: []
    teste_integracao: Le as tres fixtures e confirma ausencia, JSON valido com outras chaves, e JSON que lanca ao parsear
    teste_funcional: Dado settings-valido, o objeto tem chaves alheias ao expx que precisam sobreviver ao merge
    criterio_aceite: settings-valido faz parse e tem chave nao-expx; settings-invalido lanca em JSON.parse
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
  - id: T-01.03
    titulo: Fixtures de projeto quebrado para o doctor
    fase: F-01.1
    status: concluida
    objetivo: Criar os cenarios defeituosos que o doctor precisa diagnosticar
    arquivos:
      cria: [fixtures/cli/quebrado-skill-fora/.expx/marketplace/plugins/expx/skills/x/SKILL.md, fixtures/cli/quebrado-lock-futuro/.expx/expx-lock.json, fixtures/cli/quebrado-gitignore/.gitignore]
      altera: []
    teste_integracao: Le as tres fixtures e confirma que cada uma contem exatamente o defeito que nomeia
    teste_funcional: Dado quebrado-skill-fora, o SKILL.md contem uma referencia com ../ para fora da pasta da skill
    criterio_aceite: quebrado-skill-fora tem ../ no SKILL.md, quebrado-lock-futuro tem cli_version maior que a atual, quebrado-gitignore ignora .expx
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
  - id: T-01.04
    titulo: Script que cria repositorio git local de skill
    fase: F-01.2
    status: concluida
    objetivo: Gerar em pasta temporaria um repositorio git com commits e tags, sem rede
    arquivos:
      cria: [src/teste/repo-fixture.ts, src/teste/repo-fixture.test.ts]
      altera: []
    teste_integracao: Cria um repositorio com duas tags e confirma que git tag lista as duas
    teste_funcional: Dado criarRepoSkill com tags v1.0.0 e v1.1.0, git ls-remote devolve as duas referencias
    criterio_aceite: git ls-remote no repositorio criado lista exatamente as tags pedidas
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
  - id: T-01.05
    titulo: Fixtures dos dois layouts de skill e do repositorio sem tag
    fase: F-01.2
    status: concluida
    objetivo: Cobrir layout com harness embutido, layout de raiz plana e repositorio sem nenhuma tag
    arquivos:
      cria: [src/teste/layouts-fixture.ts, src/teste/layouts-fixture.test.ts]
      altera: []
    teste_integracao: Cria os tres repositorios e confirma que cada um tem o SKILL.md no caminho esperado do seu layout
    teste_funcional: Dado o layout embutido, SKILL.md esta em .claude/skills/<nome>/; dado o plano, esta em skill/
    criterio_aceite: Os tres repositorios existem e o sem-tag tem zero tags em git ls-remote
    depende_de: [T-01.04]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-01.06
    titulo: Harness de projeto temporario
    fase: F-01.3
    status: concluida
    objetivo: Dar aos testes uma pasta isolada criada e removida automaticamente
    arquivos:
      cria: [src/teste/projeto-temporario.ts, src/teste/projeto-temporario.test.ts]
      altera: []
    teste_integracao: Cria projeto temporario, escreve um arquivo, descarta e confirma que a pasta sumiu
    teste_funcional: Dado projetoTemporario com uma fixture de origem, a copia existe e e independente da origem
    criterio_aceite: Apos descartar, existsSync da pasta devolve false e a fixture de origem permanece intacta
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-01.07
    titulo: Projeto vitest para os testes do CLI
    fase: F-01.3
    status: concluida
    objetivo: Registrar os testes do CLI na suite existente sem afetar os projetos servidor e ui
    arquivos:
      cria: []
      altera: [vitest.config.ts]
    teste_integracao: Roda npm test e confirma que os tres projetos vitest sao executados
    teste_funcional: Dado o config alterado, vitest lista o projeto cli junto de servidor e ui
    criterio_aceite: npm test termina com 0 failed e a saida cita os projetos servidor, ui e cli
    depende_de: [T-01.01, T-01.02, T-01.03, T-01.05, T-01.06]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
---

# Tasks — Sprint 01

> Um bloco por task. Nenhum campo é opcional.

---

```yaml
id: T-01.01
titulo: Fixtures de projeto limpo e com .expx existente
objetivo: Criar os dois cenários base de projeto que init e reconfiguração usam
arquivos:
  cria: [fixtures/cli/projeto-limpo/.gitkeep, fixtures/cli/projeto-com-expx/.expx/expx-lock.json, fixtures/cli/projeto-com-expx/.claude/settings.json]
  altera: []
teste_integracao: Lê as duas fixtures do disco e confirma que projeto-limpo não tem .expx e projeto-com-expx tem
teste_funcional: Dado fixtures/cli/projeto-com-expx, o lock é JSON válido com a chave skills
criterio_aceite: As duas pastas existem e o lock de projeto-com-expx faz JSON.parse sem lançar
depende_de: []
paralelizavel: true
status: concluida
```

---

```yaml
id: T-01.02
titulo: Fixtures de settings.json ausente, válido e inválido
objetivo: Cobrir os três estados de settings.json que o merge precisa tratar
arquivos:
  cria: [fixtures/cli/settings-ausente/.gitkeep, fixtures/cli/settings-valido/.claude/settings.json, fixtures/cli/settings-invalido/.claude/settings.json]
  altera: []
teste_integracao: Lê as três fixtures e confirma ausência, JSON válido com outras chaves, e JSON que lança ao parsear
teste_funcional: Dado settings-valido, o objeto tem chaves alheias ao expx que precisam sobreviver ao merge
criterio_aceite: settings-valido faz parse e tem chave não-expx; settings-invalido lança em JSON.parse
depende_de: []
paralelizavel: true
status: concluida
```

---

```yaml
id: T-01.03
titulo: Fixtures de projeto quebrado para o doctor
objetivo: Criar os cenários defeituosos que o doctor precisa diagnosticar
arquivos:
  cria: [fixtures/cli/quebrado-skill-fora/.expx/marketplace/plugins/expx/skills/x/SKILL.md, fixtures/cli/quebrado-lock-futuro/.expx/expx-lock.json, fixtures/cli/quebrado-gitignore/.gitignore]
  altera: []
teste_integracao: Lê as três fixtures e confirma que cada uma contém exatamente o defeito que nomeia
teste_funcional: Dado quebrado-skill-fora, o SKILL.md contém uma referência com ../ para fora da pasta da skill
criterio_aceite: quebrado-skill-fora tem ../ no SKILL.md, quebrado-lock-futuro tem cli_version maior que a atual, quebrado-gitignore ignora .expx
depende_de: []
paralelizavel: true
status: concluida
```

---

```yaml
id: T-01.04
titulo: Script que cria repositório git local de skill
objetivo: Gerar em pasta temporária um repositório git com commits e tags, sem rede
arquivos:
  cria: [src/teste/repo-fixture.ts, src/teste/repo-fixture.test.ts]
  altera: []
teste_integracao: Cria um repositório com duas tags e confirma que git tag lista as duas
teste_funcional: Dado criarRepoSkill com tags v1.0.0 e v1.1.0, git ls-remote devolve as duas referências
criterio_aceite: git ls-remote no repositório criado lista exatamente as tags pedidas
depende_de: []
paralelizavel: true
status: concluida
```

---

```yaml
id: T-01.05
titulo: Fixtures dos dois layouts de skill e do repositório sem tag
objetivo: Cobrir layout com harness embutido, layout de raiz plana e repositório sem nenhuma tag
arquivos:
  cria: [src/teste/layouts-fixture.ts, src/teste/layouts-fixture.test.ts]
  altera: []
teste_integracao: Cria os três repositórios e confirma que cada um tem o SKILL.md no caminho esperado do seu layout
teste_funcional: Dado o layout embutido, SKILL.md está em .claude/skills/<nome>/; dado o plano, está em skill/
criterio_aceite: Os três repositórios existem e o sem-tag tem zero tags em git ls-remote
depende_de: [T-01.04]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-01.06
titulo: Harness de projeto temporário
objetivo: Dar aos testes uma pasta isolada criada e removida automaticamente
arquivos:
  cria: [src/teste/projeto-temporario.ts, src/teste/projeto-temporario.test.ts]
  altera: []
teste_integracao: Cria projeto temporário, escreve um arquivo, descarta e confirma que a pasta sumiu
teste_funcional: Dado projetoTemporario com uma fixture de origem, a cópia existe e é independente da origem
criterio_aceite: Após descartar, existsSync da pasta devolve false e a fixture de origem permanece intacta
depende_de: []
paralelizavel: false
status: concluida
```

---

```yaml
id: T-01.07
titulo: Projeto vitest para os testes do CLI
objetivo: Registrar os testes do CLI na suíte existente sem afetar os projetos servidor e ui
arquivos:
  cria: []
  altera: [vitest.config.ts]
teste_integracao: Roda npm test e confirma que os três projetos vitest são executados
teste_funcional: Dado o config alterado, vitest lista o projeto cli junto de servidor e ui
criterio_aceite: npm test termina com 0 failed e a saída cita os projetos servidor, ui e cli
depende_de: [T-01.01, T-01.02, T-01.03, T-01.05, T-01.06]
paralelizavel: false
status: concluida
```
