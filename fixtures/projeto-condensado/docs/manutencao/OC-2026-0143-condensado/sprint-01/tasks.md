---
expx_schema: 1
expx_tool: runx
kind: plano
trabalho_id: OC-2026-0143
sprint_id: sprint-01
atualizado_em: 2026-09-02
sprint:
  titulo: Corrigir o tooltip do badge
  status: em_andamento
  criterio_saida: O tooltip aparece ao passar o mouse no badge
  riscos: [O componente de badge e usado em quatro telas]
  fora_de_escopo: [Redesenhar o componente de badge]
fases:
  - id: F-01.1
    titulo: Corrigir o tooltip
    status: em_andamento
    criterio_saida: O tooltip aparece em viewport 1280x800 com o mouse sobre o badge
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02]
tasks:
  - id: T-01.01
    titulo: Teste que reproduz o tooltip ausente
    fase: F-01.1
    status: concluida
    objetivo: Fixar o comportamento errado antes de corrigir
    arquivos:
      cria: [src/ui/badge.test.tsx]
      altera: []
    teste_regressao: Com o mouse sobre o badge o tooltip nao aparece e o teste espera que apareca
    teste_integracao: Renderiza o badge na tela de analise e dispara o hover
    teste_funcional: Dado hover no badge, o texto do tooltip fica visivel
    criterio_aceite: O teste falha antes do fix e passa depois
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-09-02
    suite: parcial
  - id: T-01.02
    titulo: Corrigir o z-index do tooltip
    fase: F-01.1
    status: pendente
    objetivo: Fazer o tooltip aparecer acima do container
    arquivos:
      cria: []
      altera: [src/ui/badge.tsx]
    teste_integracao: Renderiza o badge dentro do container com overflow e dispara o hover
    teste_funcional: Dado hover no badge, o tooltip fica visivel acima do container
    criterio_aceite: O tooltip fica visivel em viewport 1280x800 com o mouse sobre o badge
    depende_de: [T-01.01]
    paralelizavel: false
    concluida_em: null
    suite: nao_executada
---

# Plano — Sprint 01 — Corrigir o tooltip do badge

Formato condensado: uma sprint, uma fase, um arquivo. Os mesmos contratos.
