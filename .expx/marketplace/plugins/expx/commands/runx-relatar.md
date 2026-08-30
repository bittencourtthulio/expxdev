---
name: runx-relatar
description: runx E5 — relatórios técnico e de uso, atualização do índice e fechamento da ocorrência
argument-hint: "[ocorrência: texto do chamado, id do ticket ou caminho de arquivo]"
---

Invoque a skill `runx` e execute o E5 RELATÓRIO E FECHAMENTO seguindo `references/05-relatorio.md`.

Ocorrência: $ARGUMENTS (se vazio, use a ocorrência em andamento; se houver mais de uma aberta, liste-as com o estágio de cada uma e peça que o usuário escolha).

Antes de executar, confirme pela máquina de estados do SKILL.md que o estágio atual é de fato o E5. **Recuse a execução fora de ordem:**

- Se `QA.md` não existe, falta o E4: diga "Falta o E4 (QA)." e execute `references/04-qa.md`.
- Se `QA.md` contém `VEREDITO: REPROVADO`, a ocorrência não fecha: volte ao E3 (`references/03-fix.md`).

Lembre-se: o `uso.md` é copiado pelo suporte e enviado ao cliente — sem nome de arquivo, de função ou de tabela, sem jargão técnico, sem stack trace. Nada em `docs/manutencao/` é apagado ou movido.
