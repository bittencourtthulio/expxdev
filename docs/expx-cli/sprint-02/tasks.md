---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: expx-cli
sprint_id: sprint-02
atualizado_em: 2026-08-29
tasks:
  - id: T-02.01
    titulo: Catalogo das cinco skills
    fase: F-02.1
    status: concluida
    objetivo: Declarar nome, repositorio e papel de cada skill em um unico lugar tipado
    arquivos:
      cria: [src/nucleo/catalogo.ts, src/nucleo/catalogo.test.ts]
      altera: []
    teste_integracao: Confirma que o catalogo tem as cinco skills e nenhuma URL duplicada
    teste_funcional: Dado o nome legadox, o catalogo devolve a URL do repositorio correspondente
    criterio_aceite: O catalogo tem exatamente cinco entradas e buscar por nome invalido devolve undefined
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.02
    titulo: Resolucao de versao alvo
    fase: F-02.1
    status: concluida
    objetivo: Escolher a maior tag semver de um repositorio ou cair para a branch padrao avisando
    arquivos:
      cria: [src/nucleo/versao.ts, src/nucleo/versao.test.ts]
      altera: []
    teste_integracao: Resolve a versao alvo contra o repositorio de fixture com tags e contra o sem tag
    teste_funcional: Dadas as tags v1.0.0 v1.2.0 e v1.10.0, resolve v1.10.0 e nao v1.2.0
    criterio_aceite: Repositorio com tags resolve a maior semver e repositorio sem tag devolve travado false
    depende_de: [T-02.01]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.03
    titulo: Busca da skill por clone raso
    fase: F-02.1
    status: concluida
    objetivo: Trazer os arquivos da skill na referencia alvo para uma pasta temporaria
    arquivos:
      cria: [src/nucleo/busca.ts, src/nucleo/busca.test.ts]
      altera: []
    teste_integracao: Clona o repositorio de fixture na tag alvo e confirma que SKILL.md existe no destino
    teste_funcional: Dado um repositorio inexistente, devolve falha nomeando a skill sem lancar excecao
    criterio_aceite: Clone bem sucedido devolve ok true com caminho existente e repositorio invalido devolve ok false
    depende_de: [T-02.02]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.04
    titulo: Deteccao da raiz da skill e dos comandos
    fase: F-02.2
    status: concluida
    objetivo: Localizar SKILL.md e a pasta de comandos nos dois layouts reais
    arquivos:
      cria: [src/nucleo/layout.ts, src/nucleo/layout.test.ts]
      altera: []
    teste_integracao: Roda a deteccao sobre as fixtures dos dois layouts e compara o resultado normalizado
    teste_funcional: Dado o layout de raiz plana, devolve skill em skill/ e comandos em commands/
    criterio_aceite: Os dois layouts produzem o mesmo formato de saida com raiz e comandos preenchidos
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.05
    titulo: Verificacao de referencia para fora da pasta
    fase: F-02.2
    status: concluida
    objetivo: Recusar skill que aponte para caminho fora da propria raiz
    arquivos:
      cria: [src/nucleo/caminhos.ts, src/nucleo/caminhos.test.ts]
      altera: []
    teste_integracao: Roda a verificacao sobre a fixture quebrado-skill-fora e sobre uma skill sadia
    teste_funcional: Dado um SKILL.md que cita ../fora.md, devolve a lista com esse arquivo e essa referencia
    criterio_aceite: Skill sadia devolve lista vazia e skill com ../ devolve pelo menos uma ocorrencia
    depende_de: [T-02.04]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.06
    titulo: Leitura e escrita do lock
    fase: F-02.3
    status: concluida
    objetivo: Persistir nome, repositorio, referencia, commit, data e versao do CLI por skill
    arquivos:
      cria: [src/nucleo/lock.ts, src/nucleo/lock.test.ts]
      altera: []
    teste_integracao: Grava um lock, le de volta e compara campo a campo com o original
    teste_funcional: Dado um lock com cli_version maior que a atual, a leitura devolve incompativel true
    criterio_aceite: Ida e volta preserva todos os campos e lock de versao mais nova e sinalizado como incompativel
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
  - id: T-02.07
    titulo: Deteccao de modificacao local por hash
    fase: F-02.3
    status: concluida
    objetivo: Comparar o hash de cada arquivo em disco com o registrado no lock
    arquivos:
      cria: [src/nucleo/integridade.ts, src/nucleo/integridade.test.ts]
      altera: []
    teste_integracao: Grava o lock de uma pasta, altera um arquivo e confirma que so ele e apontado
    teste_funcional: Dado um arquivo alterado entre tres, devolve exatamente o caminho desse arquivo
    criterio_aceite: Pasta intacta devolve lista vazia e pasta com um arquivo alterado devolve exatamente esse caminho
    depende_de: [T-02.06]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
---

# Tasks — Sprint 02

---

```yaml
id: T-02.01
titulo: Catálogo das cinco skills
objetivo: Declarar nome, repositório e papel de cada skill em um único lugar tipado
arquivos:
  cria: [src/nucleo/catalogo.ts, src/nucleo/catalogo.test.ts]
  altera: []
teste_integracao: Confirma que o catálogo tem as cinco skills e nenhuma URL duplicada
teste_funcional: Dado o nome legadox, o catálogo devolve a URL do repositório correspondente
criterio_aceite: O catálogo tem exatamente cinco entradas e buscar por nome inválido devolve undefined
depende_de: []
paralelizavel: false
status: concluida
```

---

```yaml
id: T-02.02
titulo: Resolução de versão alvo
objetivo: Escolher a maior tag semver de um repositório ou cair para a branch padrão avisando
arquivos:
  cria: [src/nucleo/versao.ts, src/nucleo/versao.test.ts]
  altera: []
teste_integracao: Resolve a versão alvo contra o repositório de fixture com tags e contra o sem tag
teste_funcional: Dadas as tags v1.0.0, v1.2.0 e v1.10.0, resolve v1.10.0 e não v1.2.0
criterio_aceite: Repositório com tags resolve a maior semver e repositório sem tag devolve travado false
depende_de: [T-02.01]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-02.03
titulo: Busca da skill por clone raso
objetivo: Trazer os arquivos da skill na referência alvo para uma pasta temporária
arquivos:
  cria: [src/nucleo/busca.ts, src/nucleo/busca.test.ts]
  altera: []
teste_integracao: Clona o repositório de fixture na tag alvo e confirma que SKILL.md existe no destino
teste_funcional: Dado um repositório inexistente, devolve falha nomeando a skill sem lançar exceção
criterio_aceite: Clone bem sucedido devolve ok true com caminho existente e repositório inválido devolve ok false
depende_de: [T-02.02]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-02.04
titulo: Detecção da raiz da skill e dos comandos
objetivo: Localizar SKILL.md e a pasta de comandos nos dois layouts reais
arquivos:
  cria: [src/nucleo/layout.ts, src/nucleo/layout.test.ts]
  altera: []
teste_integracao: Roda a detecção sobre as fixtures dos dois layouts e compara o resultado normalizado
teste_funcional: Dado o layout de raiz plana, devolve skill em skill/ e comandos em commands/
criterio_aceite: Os dois layouts produzem o mesmo formato de saída com raiz e comandos preenchidos
depende_de: []
paralelizavel: true
status: concluida
```

---

```yaml
id: T-02.05
titulo: Verificação de referência para fora da pasta
objetivo: Recusar skill que aponte para caminho fora da própria raiz
arquivos:
  cria: [src/nucleo/caminhos.ts, src/nucleo/caminhos.test.ts]
  altera: []
teste_integracao: Roda a verificação sobre a fixture quebrado-skill-fora e sobre uma skill sadia
teste_funcional: Dado um SKILL.md que cita ../fora.md, devolve a lista com esse arquivo e essa referência
criterio_aceite: Skill sadia devolve lista vazia e skill com ../ devolve pelo menos uma ocorrência
depende_de: [T-02.04]
paralelizavel: false
status: concluida
```

---

```yaml
id: T-02.06
titulo: Leitura e escrita do lock
objetivo: Persistir nome, repositório, referência, commit, data e versão do CLI por skill
arquivos:
  cria: [src/nucleo/lock.ts, src/nucleo/lock.test.ts]
  altera: []
teste_integracao: Grava um lock, lê de volta e compara campo a campo com o original
teste_funcional: Dado um lock com cli_version maior que a atual, a leitura devolve incompatível true
criterio_aceite: Ida e volta preserva todos os campos e lock de versão mais nova é sinalizado como incompatível
depende_de: []
paralelizavel: true
status: concluida
```

---

```yaml
id: T-02.07
titulo: Detecção de modificação local por hash
objetivo: Comparar o hash de cada arquivo em disco com o registrado no lock
arquivos:
  cria: [src/nucleo/integridade.ts, src/nucleo/integridade.test.ts]
  altera: []
teste_integracao: Grava o lock de uma pasta, altera um arquivo e confirma que só ele é apontado
teste_funcional: Dado um arquivo alterado entre três, devolve exatamente o caminho desse arquivo
criterio_aceite: Pasta intacta devolve lista vazia e pasta com um arquivo alterado devolve exatamente esse caminho
depende_de: [T-02.06]
paralelizavel: false
status: concluida
```
