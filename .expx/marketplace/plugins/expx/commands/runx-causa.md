---
name: runx-causa
description: "runx E1 — investigação: mapeia a base de conhecimento e comprova a causa raiz (ou mapeia o impacto)"
argument-hint: "[ocorrência: texto do chamado, id do ticket ou caminho de arquivo]"
---

Invoque a skill `runx` e execute o E1 INVESTIGAÇÃO seguindo `references/01-investigacao.md`.

Ocorrência: $ARGUMENTS (se vazio, use a ocorrência em andamento; se houver mais de uma aberta, liste-as com o estágio de cada uma e peça que o usuário escolha).

Antes de executar, confirme pela máquina de estados do SKILL.md que o estágio atual é de fato o E1. Se `base/` já existe completa e `01-CAUSA-RAIZ.md` também, o E1 já passou: diga isso, aponte o estágio realmente pendente e execute-o. Uma reexecução do E1 só para complementar a base é permitida se o usuário pedir explicitamente, avisando que o plano existente pode ficar desatualizado.

Lembre-se de que o E1 tem duas metades e a ordem é obrigatória: primeiro E1.a (base de conhecimento), só depois E1.b (causa raiz ou análise de impacto).
