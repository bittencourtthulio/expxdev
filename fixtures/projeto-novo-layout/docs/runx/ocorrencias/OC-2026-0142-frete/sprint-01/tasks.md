---
expx_schema: 1
expx_tool: runx
kind: tasks
trabalho_id: OC-2026-0142
sprint_id: sprint-01
atualizado_em: 2026-08-29
tasks:
  - id: T-01.01
    titulo: Teste que reproduz a divergencia acima de 50kg
    fase: F-01.1
    status: concluida
    objetivo: Fixar o comportamento esperado antes de corrigir
    arquivos:
      cria: [src/frete/calculo.test.ts]
      altera: []
    teste_regressao: Pedido de 51kg deve retornar 42.90 e hoje retorna 41.00
    teste_integracao: Checkout completo com 51kg fecha com o frete correto
    teste_funcional: calcularFrete(51) retorna 42.90
    criterio_aceite: O teste falha antes do fix e passa depois
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-01.02
    titulo: Corrigir o arredondamento da faixa
    fase: F-01.1
    status: concluida
    objetivo: Trocar truncamento por arredondamento na faixa acima de 50kg
    arquivos:
      cria: []
      altera: [src/frete/calculo.ts]
    teste_regressao: null
    teste_integracao: Suite de checkout inteira permanece verde apos o fix
    teste_funcional: calcularFrete(51) retorna 42.90 e calcularFrete(49) nao muda
    criterio_aceite: O teste de regressao passa e nenhum chamador quebra
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
---

# Tasks — Sprint 01

```yaml
id: T-01.01
status: concluida  # 2026-08-29 · suíte: 31 passed, 0 failed
```

```yaml
id: T-01.02
status: concluida  # 2026-08-29 · suíte: 31 passed, 0 failed
```
