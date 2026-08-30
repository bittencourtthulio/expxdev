---
name: runx-plano
description: "runx E2 — plano: converte a investigação em sprints, fases e tasks, e escreve o ORQUESTRADOR"
argument-hint: "[ocorrência: texto do chamado, id do ticket ou caminho de arquivo]"
---

Invoque a skill `runx` e execute o E2 PLANO seguindo `references/02-plano.md`.

Ocorrência: $ARGUMENTS (se vazio, use a ocorrência em andamento; se houver mais de uma aberta, liste-as com o estágio de cada uma e peça que o usuário escolha).

Antes de executar, confirme pela máquina de estados do SKILL.md que o estágio atual é de fato o E2. **Recuse a execução fora de ordem:**

- Se `01-CAUSA-RAIZ.md` não existe, falta o E1: diga "Falta o E1 (investigação). Vou executá-lo primeiro." e execute `references/01-investigacao.md`.
- Se `01-CAUSA-RAIZ.md` contém `STATUS: NÃO COMPROVADO`, o E2 está bloqueado: anuncie o que falta para comprovar a causa e volte ao E1.
- Se houver lacuna bloqueante em `base/00-LACUNAS.md`, pare e resolva-a antes de planejar.

Aplique a regra de proporcionalidade: a estrutura é sempre a mesma, o tamanho é proporcional à ocorrência. Nem inflar, nem enxugar campos.
