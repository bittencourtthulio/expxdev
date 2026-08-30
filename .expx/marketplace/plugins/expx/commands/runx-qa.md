---
name: runx-qa
description: "runx E4 — QA: valida a entrega contra o plano e o escopo, sem corrigir nada"
argument-hint: "[ocorrência: texto do chamado, id do ticket ou caminho de arquivo]"
---

Invoque a skill `runx` e execute o E4 QA seguindo `references/04-qa.md`.

Ocorrência: $ARGUMENTS (se vazio, use a ocorrência em andamento; se houver mais de uma aberta, liste-as com o estágio de cada uma e peça que o usuário escolha).

Antes de executar, confirme pela máquina de estados do SKILL.md que o estágio atual é de fato o E4. **Recuse a execução fora de ordem:** se restam tasks `pendente` ou `em_andamento` executáveis, o E3 não terminou — diga "Falta concluir o E3 (fix)." e execute `references/03-fix.md`.

Neste estágio você valida, não implementa: **não corrija nada** do que encontrar. Achado ALTA manda voltar ao E3, que corrige o que ele mesmo escreveu.
