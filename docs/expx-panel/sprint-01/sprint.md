---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: expx-panel
sprint_id: sprint-01
titulo: Capacidade de testar
status: concluido
criterio_saida: npm test roda com 0 failed e as fixtures cobrem os 13 kinds e os 7 casos ruins
fases: [F-01.1, F-01.2, F-01.3]
riscos:
  - gray-matter carrega js-yaml 3.x e nao devolve posicao de linha (base/10-stack-e-dependencias.md)
  - Fixture com data fixa muda de resultado com o tempo se a regra ler o relogio (resolvido por D-16)
atualizado_em: 2026-08-29
---

# Sprint 01 — Capacidade de testar

## Objetivo

Entregar o andaime do projeto e o corpus de fixtures contra o qual toda a suíte do parser vai rodar. Nenhuma regra de negócio aqui: ao fim desta sprint existe um projeto TypeScript que compila, um `npm test` que roda, e um conjunto de arquivos de exemplo em disco cobrindo os 13 kinds e os casos ruins que o parser precisa rejeitar sem quebrar.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Andaime do projeto | nenhuma |
| F-01.2 | Fixtures boas | F-01.3 |
| F-01.3 | Fixtures ruins | F-01.2 |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`npm test` termina com 0 failed, `npm run build` termina sem erro de tipo, e `fixtures/` contém um projeto-exemplo com trabalhos sprintx e runx misturados mais os sete casos ruins listados no pedido.

## Riscos conhecidos

- `gray-matter` 4.0.3 carrega `js-yaml` 3.x e devolve o YAML já desserializado, sem posições — obter a linha de uma violação exige parse posicional adicional (`base/10-stack-e-dependencias.md`, decisão D-24).
- Fixture com data fixa muda de resultado conforme os dias passam se a regra de "bloqueio antigo" ler o relógio; resolvido por D-16, que injeta "hoje" como parâmetro.
