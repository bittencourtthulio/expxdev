---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: expx-watch-terminal
sprint_id: sprint-02
atualizado_em: 2026-08-30
fases:
  - id: F-02.1
    titulo: Largura, corte e cor
    status: concluido
    criterio_saida: cortar respeita a largura em NFC e NFD e pintar devolve o texto cru quando a cor esta desligada
    paralelizavel: true
    paralela_com: [F-02.2]
    tasks: [T-02.01, T-02.02]
  - id: F-02.2
    titulo: Projecao do estado para a visao do watch
    status: concluido
    criterio_saida: projetar escolhe o trabalho atual pelas duas fontes e devolve a visao completa sem lancar para as nove fixtures
    paralelizavel: true
    paralela_com: [F-02.1]
    tasks: [T-02.03, T-02.04]
  - id: F-02.3
    titulo: As cinco secoes do painel
    status: concluido
    criterio_saida: desenhar devolve cabecalho, bloqueios, arvore, eventos e rodape para as nove fixtures de disco em 80 e em 60 colunas
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.05, T-02.06, T-02.07, T-02.08, T-02.09]
---

# Fases — Sprint 02

---

## F-02.1 — Largura, corte e cor

**Objetivo:** resolver medição de largura, corte elegante e emissão de cor, que não existem no projeto.

**Tasks que a compõem:** T-02.01, T-02.02

**Critério de saída:** `cortar` respeita a largura em NFC e NFD, e `pintar` devolve o texto cru quando a cor está desligada.

**Roda em paralelo com:** F-02.2 — arquivos disjuntos.

---

## F-02.2 — Projeção do estado para a visão do watch

**Objetivo:** transformar as duas fontes na estrutura única que o desenho consome.

**Tasks que a compõem:** T-02.03, T-02.04

**Critério de saída:** `projetar` escolhe o trabalho atual pelas duas fontes e devolve a visão completa sem lançar.

**Roda em paralelo com:** F-02.1 — arquivos disjuntos.

---

## F-02.3 — As cinco seções do painel

**Objetivo:** desenhar cabeçalho, bloqueios, árvore, eventos e rodapé, nessa ordem de prioridade.

**Tasks que a compõem:** T-02.05, T-02.06, T-02.07, T-02.08, T-02.09

**Critério de saída:** `desenhar` devolve as cinco seções para as nove fixtures de disco, em 80 e em 60 colunas.

**Roda em paralelo com:** nenhuma — consome F-02.1 e F-02.2.
