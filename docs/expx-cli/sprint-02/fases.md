---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: expx-cli
sprint_id: sprint-02
atualizado_em: 2026-08-29
fases:
  - id: F-02.1
    titulo: Resolucao de versao e busca
    status: concluido
    criterio_saida: Resolve a maior tag semver de um repositorio de fixture e clona a referencia escolhida
    paralelizavel: false
    paralela_com: []
    tasks: [T-02.01, T-02.02, T-02.03]
  - id: F-02.2
    titulo: Normalizacao de layout
    status: concluido
    criterio_saida: Os dois layouts reais produzem a mesma estrutura normalizada
    paralelizavel: true
    paralela_com: [F-02.3]
    tasks: [T-02.04, T-02.05]
  - id: F-02.3
    titulo: Lock e integridade
    status: concluido
    criterio_saida: Grava e le o lock e detecta arquivo alterado em disco
    paralelizavel: true
    paralela_com: [F-02.2]
    tasks: [T-02.06, T-02.07]
---

# Fases — Sprint 02

---

## F-02.1 — Resolução de versão e busca

**Objetivo:** descobrir a versão alvo de uma skill e trazer os arquivos dela para disco, sem rede real.

**Tasks que a compõem:** T-02.01, T-02.02, T-02.03

**Critério de saída:** resolve a maior tag semver de um repositório de fixture e clona a referência escolhida.

**Roda em paralelo com:** nenhuma

---

## F-02.2 — Normalização de layout

**Objetivo:** converter os dois layouts reais de repositório em uma forma única.

**Tasks que a compõem:** T-02.04, T-02.05

**Critério de saída:** os dois layouts produzem a mesma estrutura normalizada.

**Roda em paralelo com:** F-02.3

---

## F-02.3 — Lock e integridade

**Objetivo:** gravar o estado instalado e detectar quando o disco divergiu dele.

**Tasks que a compõem:** T-02.06, T-02.07

**Critério de saída:** grava e lê o lock, e detecta arquivo alterado em disco.

**Roda em paralelo com:** F-02.2
