---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: expx-cli
sprint_id: sprint-03
titulo: Montagem do plugin e harness
status: concluido
criterio_saida: Monta o plugin em pasta temporaria com troca atomica e mescla settings.json sem perder chave alheia
fases: [F-03.1, F-03.2, F-03.3]
riscos: [Declarar o marketplace no settings do projeto nao instala o plugin, comprovado em base/09]
atualizado_em: 2026-08-29
---

# Sprint 03 — Montagem do plugin e configuração de harness

## Objetivo

Montar o plugin local `expx` na estrutura que **funciona de fato** (plugin dentro do marketplace, D-02), com escrita atômica, e configurar os dois harnesses: `settings.json` mesclado sem perder nada e cópia para os diretórios que o OpenCode lê.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-03.1 | Montagem do plugin | nenhuma |
| F-03.2 | Merge do settings.json | F-03.3 |
| F-03.3 | Harness OpenCode | F-03.2 |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

O CLI monta o plugin em pasta temporária e troca por rename ao final, e mescla `settings.json` preservando todas as chaves alheias; `npm test` termina com 0 failed.

## Riscos conhecidos

- Declarar o marketplace no `settings.json` do projeto **não instala** o plugin — comprovado em `base/09-validacao-marketplace-local.md`. A instalação de fato fica na sprint-04 (D-03).
- O `marketplace add` grava caminho **absoluto** no settings do usuário, o que não é commitável; quem clona precisa rodar o init na própria máquina (`base/09`).
- `enabledPlugins` real é objeto, não o array documentado (D-04): ler as duas formas.
