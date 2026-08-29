---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: expx-cli
sprint_id: sprint-01
titulo: Capacidade de testar
status: concluido
criterio_saida: npm test roda as fixtures do CLI e termina com 0 failed sem acessar a rede
fases: [F-01.1, F-01.2, F-01.3]
riscos: [Nenhuma das cinco skills tem tag hoje entao o caminho de maior tag so e exercitado por fixture sintetica]
atualizado_em: 2026-08-29
---

# Sprint 01 — Capacidade de testar

## Objetivo

Entregar a infraestrutura que torna o TDD das sprintsseguintes executável: as fixtures de projeto e de repositório de skill, o harness que monta e descarta projeto temporário, e o repositório git local que substitui a rede. Nenhuma funcionalidade de negócio.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Fixtures de projeto | F-01.2 |
| F-01.2 | Fixtures de repositório de skill | F-01.1 |
| F-01.3 | Harness de teste | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`npm test` roda a suíte incluindo os testes das fixtures do CLI e termina com 0 failed, sem nenhum acesso de rede.

## Riscos conhecidos

- Nenhuma das cinco skills tem tag hoje (`base/08-repositorios-reais.md`), então o caminho principal de resolução de versão só é exercitado por fixture sintética — registrado como L-17 em `base/00-LACUNAS.md`.
- Os repositórios reais têm dois layouts distintos (`base/08-repositorios-reais.md`); as fixtures precisam cobrir os dois, ou o normalizador da sprint-02 nasce sem cobertura.
