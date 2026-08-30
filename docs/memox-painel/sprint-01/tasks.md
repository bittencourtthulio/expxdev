---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: memox-painel
sprint_id: sprint-01
atualizado_em: 2026-08-29
tasks:
  - id: T-01.01
    titulo: Fixture de projeto com indice de memoria
    fase: F-01.1
    status: concluida
    objetivo: Criar um projeto de fixture com indice.json valido copiado do exemplo do motor
    arquivos:
      cria: [fixtures/projeto-memoria/.expx/memoria/indice.json, fixtures/projeto-memoria/docs/relatorios/2026-08-29-OC-2026-0142-arredondamento/tecnico.md]
      altera: []
    teste_integracao: Le o indice da fixture e faz JSON.parse esperando sucesso e versao igual a 1
    teste_funcional: Dado o indice da fixture, sinais.arquivo de src/frete/calculo.ts tem regressoes com um item e reprovacoes_qa igual a 1
    criterio_aceite: JSON.parse nao lanca, versao vale 1, totais.regressoes vale 1 e src/frete/calculo.ts tem regressao e reprovacao de QA
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-01.02
    titulo: Fixture de indice corrompido
    fase: F-01.1
    status: concluida
    objetivo: Criar um projeto de fixture cujo indice.json e JSON invalido
    arquivos:
      cria: [fixtures/projeto-memoria-corrompida/.expx/memoria/indice.json, fixtures/projeto-memoria-corrompida/docs/relatorios/2026-08-29-OC-2026-0142-arredondamento/tecnico.md]
      altera: []
    teste_integracao: Le o arquivo da fixture e espera que JSON.parse lance
    teste_funcional: Dado o arquivo truncado da fixture, JSON.parse lanca e a mensagem contem JSON
    criterio_aceite: JSON.parse do arquivo da fixture lanca excecao e o arquivo nao esta vazio
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-01.03
    titulo: Schema e tipo da memoria no servidor
    fase: F-01.2
    status: concluida
    objetivo: Declarar o schema zod da projecao enxuta e derivar dele o tipo Memoria
    arquivos:
      cria: [src/parser/memoria/tipos.ts, src/parser/memoria/tipos.test.ts]
      altera: []
    teste_integracao: Valida com o schema um objeto de memoria montado a partir da fixture e espera sucesso
    teste_funcional: Dado um objeto sem a chave gerado_em, o parse do schema falha apontando gerado_em
    criterio_aceite: MemoriaSchema.safeParse aceita a projecao valida e rejeita a que nao tem gerado_em, apontando o campo
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-01.04
    titulo: Espelhar o tipo da memoria na UI
    fase: F-01.2
    status: concluida
    objetivo: Espelhar Memoria em ui/src/tipos.ts e acrescentar a chave memoria ao Estado
    arquivos:
      cria: []
      altera: [ui/src/tipos.ts]
    teste_integracao: Valida com MemoriaSchema um objeto tipado como Memoria da UI, montado do indice da fixture
    teste_funcional: Dado memoria null, o valor e aceito pelo tipo Estado da UI e o schema rejeita objeto sem gerado_em
    criterio_aceite: MemoriaSchema aceita o objeto tipado pela UI e a chave memoria do Estado aceita Memoria ou null
    depende_de: [T-01.03]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
---

# Tasks — Sprint 01

> Um bloco por task. Na execução (F6), a linha `status` é atualizada em cada transição; ao concluir, acrescente data e resultado da suíte.

> **Nota das rodadas 2 a 4 (pós-auditoria).** As duas tasks de tipo desta sprint foram refeitas: os testes originais afirmavam sobre o compilador, e `tsconfig.json` exclui `**/*.test.ts` enquanto o vitest não faz typecheck — nada faria a asserção negativa falhar. Agora a validação é em runtime, por schema zod (D-27), contra a fixture real. A ordem das fases também mudou: a fixture vem antes do tipo, porque o tipo é validado contra ela. Na rodada 4, o `altera` de T-01.04 foi reduzido a `ui/src/tipos.ts`, porque o cast da fixture absorve a chave nova. Na rodada 3, T-01.04 deixou de testar `montarProjeto` — que só ganha a chave `memoria` em T-02.04, na sprint seguinte — e as duas tasks de fixture passaram a `paralelizavel: false`, alinhadas à fase que as contém.

---

```yaml
id: T-01.01
titulo: Fixture de projeto com índice de memória
objetivo: Criar um projeto de fixture com indice.json válido copiado do exemplo do motor
arquivos:
  cria: [fixtures/projeto-memoria/.expx/memoria/indice.json, fixtures/projeto-memoria/docs/relatorios/2026-08-29-OC-2026-0142-arredondamento/tecnico.md]
  altera: []
teste_integracao: Lê o índice da fixture e faz JSON.parse esperando sucesso e versao igual a 1
teste_funcional: Dado o índice da fixture, sinais.arquivo de src/frete/calculo.ts tem regressões com um item e reprovacoes_qa igual a 1
criterio_aceite: JSON.parse não lança, versao vale 1, totais.regressoes vale 1, e src/frete/calculo.ts tem regressão e reprovação de QA
depende_de: []
paralelizavel: false
status: concluida  # 2026-08-29 · suite: 254 passed, 0 failed
```

A fixture é cópia de `exemplos/indice.exemplo.json` do repositório MemoX (D-24). O `tecnico.md` existe para o projeto ser descoberto pelo parser como projeto de verdade.

---

```yaml
id: T-01.02
titulo: Fixture de índice corrompido
objetivo: Criar um projeto de fixture cujo indice.json é JSON inválido
arquivos:
  cria: [fixtures/projeto-memoria-corrompida/.expx/memoria/indice.json, fixtures/projeto-memoria-corrompida/docs/relatorios/2026-08-29-OC-2026-0142-arredondamento/tecnico.md]
  altera: []
teste_integracao: Lê o arquivo da fixture e espera que JSON.parse lance
teste_funcional: Dado o arquivo truncado da fixture, JSON.parse lança e a mensagem contém JSON
criterio_aceite: JSON.parse do arquivo da fixture lança exceção e o arquivo não está vazio
depende_de: []
paralelizavel: false
status: concluida  # 2026-08-29 · suite: 254 passed, 0 failed
```

Representa o índice lido durante a gravação — risco documentado em `base/01-indice-memox.md`.

---

```yaml
id: T-01.03
titulo: Schema e tipo da memória no servidor
objetivo: Declarar o schema zod da projeção enxuta e derivar dele o tipo Memoria
arquivos:
  cria: [src/parser/memoria/tipos.ts, src/parser/memoria/tipos.test.ts]
  altera: []
teste_integracao: Valida com o schema um objeto de memória montado a partir da fixture e espera sucesso
teste_funcional: Dado um objeto sem a chave gerado_em, o parse do schema falha apontando gerado_em
criterio_aceite: MemoriaSchema.safeParse aceita a projeção válida e rejeita a que não tem gerado_em, apontando o campo
depende_de: [T-01.01]
paralelizavel: false
status: concluida  # 2026-08-29 · suite: 259 passed, 0 failed
```

`zod` já é dependência de produção do projeto (`package.json`), e `src/plugin/manifestos.ts` é o precedente de schema + tipo derivado.

O objeto de teste é **construído inline** a partir do índice lido da fixture: `projetar.ts` só nasce em T-02.02, na sprint seguinte, e esta task não deve importá-lo.

---

```yaml
id: T-01.04
titulo: Espelhar o tipo da memória na UI
objetivo: Espelhar Memoria em ui/src/tipos.ts e acrescentar a chave memoria ao Estado
arquivos:
  cria: []
  altera: [ui/src/tipos.ts]
teste_integracao: Valida com MemoriaSchema um objeto tipado como Memoria da UI, montado do índice da fixture
teste_funcional: Dado memoria null, o valor é aceito pelo tipo Estado da UI e o schema rejeita objeto sem gerado_em
criterio_aceite: MemoriaSchema aceita o objeto tipado pela UI e a chave memoria do Estado aceita Memoria ou null
status: pendente
depende_de: [T-01.03]
paralelizavel: false
```

**A chave `memoria` do `Estado` aceita `Memoria | null`** — o parser só passa a produzi-la em T-02.04, na sprint 02. Por isso esta task NÃO valida saída de `montarProjeto`: ela valida o tipo espelhado contra a projeção, direto. Validar `montarProjeto` aqui seria testar código que a sprint 01 não entrega.

Só `ui/src/tipos.ts` muda: o cast `as unknown as Estado` em `ui/src/telas/fixture.ts` absorve a chave nova sem erro, e `telas.test.tsx` monta o estado vazio por spread — nenhum dos dois precisa de alteração. A fixture de UI com memória nasce em T-02.07, e a asserção sobre o estado montado é de T-02.04.
