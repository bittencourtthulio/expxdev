---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: expx-watch-terminal
sprint_id: sprint-03
titulo: Loop ao vivo e subcomando do CLI
status: concluido
criterio_saida: expx watch roda nas nove fixtures, redesenha ao mudar arquivo, restaura o terminal na saida e nunca escreve em disco
fases: [F-03.1, F-03.2, F-03.3]
riscos: [O observador do painel ignora .expx e o painel observa docs, entao o watch precisa de observador proprio com duas raizes, Restauracao do terminal precisa cobrir excecao nao capturada alem dos dois sinais]
atualizado_em: 2026-08-30
---

# Sprint 03 — Loop ao vivo e subcomando do CLI

## Objetivo

Ligar o desenho puro às fontes reais: observador com duas raízes, redesenho sem piscar, restauração do terminal, e o subcomando `watch` no CLI existente com suas três formas de invocação.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-03.1 | Observador de duas raizes | F-03.2 |
| F-03.2 | Terminal: redesenho, restauracao e opcoes | F-03.1 |
| F-03.3 | Subcomando watch no CLI | nenhuma |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## Critério de saída

`expx watch` roda nas nove fixtures de disco, redesenha ao mudar arquivo, restaura o terminal na saída, e um teste afirma que nenhuma chamada de escrita em disco parte do caminho de código do watch.

## Riscos conhecidos

- O observador do painel ignora `.expx` e o painel observa `docs/`: o watch precisa de observador próprio com duas raízes (`base/observador-de-arquivos.md`, riscos 1 e 3; decidido em D-06).
- Escrita atômica do `estado.json` gera `unlink`+`add`, não `change`: um observador que só escute `change` perderia toda atualização (`base/estado-json.md`, risco 5).
- Restauração do terminal precisa cobrir exceção não capturada além dos dois sinais (D-21).
