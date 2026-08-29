---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: expx-cli
sprint_id: sprint-02
titulo: Nucleo - busca, lock e normalizacao
status: concluido
criterio_saida: Buscar uma skill de repositorio local, normalizar os dois layouts e gravar o lock com hash por arquivo
fases: [F-02.1, F-02.2, F-02.3]
riscos: [Nenhuma skill real tem tag entao a resolucao por maior tag so e testada contra fixture]
atualizado_em: 2026-08-29
---

# Sprint 02 — Núcleo: busca, lock e normalização

## Objetivo

Entregar as camadas isoladas e testáveis que o `promptcli2.md:128-134` exige: resolução de versão, busca de skill, normalização de layout e o lock com detecção de modificação local. Nenhuma delas conhece linha de comando.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-02.1 | Resolução de versão e busca | nenhuma |
| F-02.2 | Normalização de layout | F-02.3 |
| F-02.3 | Lock e integridade | F-02.2 |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

A suíte busca uma skill de um repositório git local, normaliza os dois layouts para uma forma única e grava um lock com hash SHA-256 por arquivo; `npm test` termina com 0 failed.

## Riscos conhecidos

- Nenhuma skill real tem tag (`base/08-repositorios-reais.md`), então a resolução por maior tag semântica só é exercitada contra a fixture da T-01.04 — L-17 em `base/00-LACUNAS.md`.
- O layout dos repositórios pode mudar sem aviso; o normalizador depende de encontrar `SKILL.md`, não de caminho fixo (D-12).
