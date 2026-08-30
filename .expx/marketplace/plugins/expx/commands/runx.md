---
name: runx
description: runx — detecta o estágio atual da ocorrência e continua de onde parou
argument-hint: "[ocorrência: texto do chamado, id do ticket ou caminho de arquivo]"
---

Invoque a skill `runx` e siga-a integralmente.

Ocorrência: $ARGUMENTS

Se `$ARGUMENTS` estiver vazio, **liste as ocorrências abertas** em `docs/manutencao/` com o estágio atual de cada uma (detectado pela máquina de estados do SKILL.md) e peça que o usuário escolha qual continuar. Se não houver nenhuma aberta, diga isso e peça a ocorrência.

Com a ocorrência definida, aplique a máquina de estados do SKILL.md: inspecione `docs/manutencao/<OC-ID>-<slug>/` no disco, anuncie o estágio detectado em uma linha e execute esse estágio seguindo o reference correspondente. Não pule estágio.
