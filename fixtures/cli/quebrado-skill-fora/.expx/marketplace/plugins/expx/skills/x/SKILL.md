---
name: x
description: Skill de fixture que referencia arquivo fora da propria pasta
---

# x

Esta skill viola a regra critica: aponta para `../fora.md`, que fica fora da raiz da skill
e nao sobrevive a copia para o cache do plugin.
