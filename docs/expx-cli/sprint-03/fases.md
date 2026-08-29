---
expx_schema: 1
expx_tool: sprintx
kind: fases
trabalho_id: expx-cli
sprint_id: sprint-03
atualizado_em: 2026-08-29
fases:
  - id: F-03.1
    titulo: Montagem do plugin
    status: concluido
    criterio_saida: Monta plugin e marketplace validos e troca a pasta por rename ao final
    paralelizavel: false
    paralela_com: []
    tasks: [T-03.01, T-03.02, T-03.03]
  - id: F-03.2
    titulo: Merge do settings.json
    status: concluido
    criterio_saida: Mescla preservando chaves alheias, faz backup datado e recusa JSON invalido
    paralelizavel: true
    paralela_com: [F-03.3]
    tasks: [T-03.04, T-03.05]
  - id: F-03.3
    titulo: Harness OpenCode
    status: concluido
    criterio_saida: Copia skills para .claude/skills e comandos para .opencode/commands sem prefixo
    paralelizavel: true
    paralela_com: [F-03.2]
    tasks: [T-03.06]
---

# Fases — Sprint 03

---

## F-03.1 — Montagem do plugin

**Objetivo:** produzir em `.expx/` a árvore de marketplace e plugin que o Claude Code aceita.

**Tasks que a compõem:** T-03.01, T-03.02, T-03.03

**Critério de saída:** monta plugin e marketplace válidos e troca a pasta por rename ao final.

**Roda em paralelo com:** nenhuma

---

## F-03.2 — Merge do settings.json

**Objetivo:** alterar o `settings.json` do projeto sem jamais perder conteúdo do usuário.

**Tasks que a compõem:** T-03.04, T-03.05

**Critério de saída:** mescla preservando chaves alheias, faz backup datado e recusa JSON inválido.

**Roda em paralelo com:** F-03.3

---

## F-03.3 — Harness OpenCode

**Objetivo:** deixar as skills e os comandos onde o OpenCode os encontra.

**Tasks que a compõem:** T-03.06

**Critério de saída:** copia skills para `.claude/skills/` e comandos para `.opencode/commands/` sem prefixo.

**Roda em paralelo com:** F-03.2
