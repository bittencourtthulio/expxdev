---
name: runx-fix
description: "runx E3 — fix: implementa o plano sob TDD estrito, de forma autônoma"
argument-hint: "[ocorrência: texto do chamado, id do ticket ou caminho de arquivo]"
---

Invoque a skill `runx` e execute o E3 FIX seguindo `references/03-fix.md`.

Ocorrência: $ARGUMENTS (se vazio, use a ocorrência em andamento; se houver mais de uma aberta, liste-as com o estágio de cada uma e peça que o usuário escolha).

Antes de executar, confirme pela máquina de estados do SKILL.md que o estágio atual é de fato o E3. **Recuse a execução fora de ordem:**

- Se `base/` não existe, falta o E1: diga "Falta o E1 (investigação). Vou executá-lo primeiro." e execute `references/01-investigacao.md`. Não se implementa fix sem base mapeada e causa comprovada.
- Se `ORQUESTRADOR.md` não existe, falta o E2: diga "Falta o E2 (plano). Vou executá-lo primeiro." e execute `references/02-plano.md`.

Durante o E3 não pergunte nada: dúvida nova vira registro em `BLOQUEIOS.md`, a task é marcada `bloqueada` e a próxima paralelizável assume.
