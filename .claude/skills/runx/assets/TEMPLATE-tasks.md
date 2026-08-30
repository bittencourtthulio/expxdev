---
expx_schema: 1
expx_tool: runx
kind: tasks
trabalho_id: {{OC-ID}}
sprint_id: sprint-{{NN}}
atualizado_em: {{AAAA-MM-DD}}
tasks:
  - id: T-{{NN}}.01
    titulo: {{titulo curto da task}}
    fase: F-{{NN}}.{{M}}
    status: pendente
    objetivo: {{uma frase}}
    arquivos:
      cria: [{{caminho/relativo/novo_teste.ext}}]
      altera: []
    teste_regressao: {{o teste que reproduz o problema e hoje falha; null nas demais tasks}}
    teste_integracao: {{o que valida, contra o que — obrigatorio, nao vazio}}
    teste_funcional: {{o que valida, com qual entrada e saida — obrigatorio, nao vazio}}
    criterio_aceite: {{condicao verificavel, binaria, sem adjetivo}}
    depende_de: []
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
  - id: T-{{NN}}.{{MM}}
    titulo: {{titulo curto da task}}
    fase: F-{{NN}}.{{M}}
    status: pendente
    objetivo: {{uma frase}}
    arquivos:
      cria: []
      altera: [{{caminho/relativo/existente.ext}}]
    teste_regressao: null
    teste_integracao: {{o que valida, contra o que — obrigatorio, nao vazio}}
    teste_funcional: {{o que valida, com qual entrada e saida — obrigatorio, nao vazio}}
    criterio_aceite: {{condicao verificavel, binaria, sem adjetivo}}
    depende_de: [T-{{NN}}.01]
    paralelizavel: {{true | false}}
    concluida_em: null
    suite: nao_executada
---

> Os campos da lista `tasks:` sao EXATAMENTE os do Contrato da Task do SKILL.md, mais `fase`, `concluida_em` e `suite`. `teste_regressao` so e preenchido na primeira task da primeira fase quando o tipo e `bug`; nas demais e `null`, com a chave presente. YAML e prosa carregam a mesma verdade e sao atualizados juntos.

> Frontmatter obrigatorio (expx-schema v1). Formato completo em `references/00-schema.md`. Substitua os marcadores; NUNCA omita uma chave — ausente e `null`, lista vazia e `[]`. Sem acento em chave nem em valor de enum. `atualizado_em` e reescrito a cada gravacao.

# Tasks — Sprint {{NN}}

> Um bloco por task. Repita o bloco abaixo para cada task da sprint, preenchendo TODOS os campos — nenhum é opcional, qualquer que seja o tamanho da ocorrência. O único campo condicional é `teste_regressao`, que existe apenas na PRIMEIRA task da PRIMEIRA fase. Na execução (E3), a linha `status` é atualizada em cada transição; ao concluir, acrescente data e resultado da suíte.

---

## Primeira task da primeira fase — sempre o teste, antes de qualquer implementação

```yaml
id: T-{{NN}}.01
titulo: {{título curto da task}}
objetivo: {{uma frase}}
arquivos:
  cria: [{{caminho/relativo/novo_teste.ext}}]
  altera: []
teste_regressao: {{o teste que reproduz o problema e HOJE FALHA (bug), ou que fixa o comportamento esperado (demais tipos) — com a entrada e a saída esperada}}
teste_integracao: {{o que valida, contra o quê — em uma frase}}
teste_funcional: {{o que valida, com qual entrada e qual saída — em uma frase}}
criterio_aceite: {{condição verificável, binária, sem adjetivo}}
depende_de: []
paralelizavel: false
status: pendente
```

---

## Demais tasks

```yaml
id: T-{{NN}}.{{MM}}
titulo: {{título curto da task}}
objetivo: {{uma frase}}
arquivos:
  cria: [{{caminho/relativo/novo.ext}}]
  altera: [{{caminho/relativo/existente.ext}}]
teste_integracao: {{o que valida, contra o quê — em uma frase}}
teste_funcional: {{o que valida, com qual entrada e qual saída — em uma frase}}
criterio_aceite: {{condição verificável, binária, sem adjetivo}}
depende_de: [{{T-NN.MM, ...}}]   # ou []
paralelizavel: {{true | false}}
status: pendente
```

---

```yaml
id: T-{{NN}}.{{MM}}
titulo: {{título curto da task}}
objetivo: {{uma frase}}
arquivos:
  cria: []
  altera: []
teste_integracao: {{o que valida, contra o quê}}
teste_funcional: {{o que valida, com qual entrada e qual saída}}
criterio_aceite: {{condição verificável, binária, sem adjetivo}}
depende_de: []
paralelizavel: {{true | false}}
status: pendente
```
