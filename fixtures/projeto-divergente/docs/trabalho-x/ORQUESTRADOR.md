---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: trabalho-x
titulo: Trabalho com status concluido mas tasks pendentes
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: concluido
criado_em: 2026-08-20
atualizado_em: 2026-08-28
concluido_em: 2026-08-28
sprints: [sprint-01]
caminho_critico: [T-01.01, T-01.02]
---

# Orquestrador — trabalho-x

Fixture de trabalho com ORQUESTRADOR `status: concluido` mas cujas tasks em
`sprint-01/tasks.md` continuam `pendente` — reproduz a divergência da OC-2026-002.
Serve ao teste do parser; não descreve trabalho real.
