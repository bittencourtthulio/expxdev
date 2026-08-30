---
description: P3 isolada do prodx — consulta rápida de "isso já existe no sistema?", com evidência, sem abrir avaliação completa.
---

Use a skill `prodx`, etapa **P3**, seguindo `references/03-existencia.md`.

O que procurar está em `$ARGUMENTS`. Se vier vazio, pergunte o que se quer verificar e pare.

## Modo consulta

Rodando isolada, esta etapa responde **no chat** e **não cria arquivo**. Só grava `02-existencia.md` quando estiver dentro de uma avaliação completa com pasta já criada.

## Roteiro

Procure o **problema resolvido**, não o artefato pedido. Nesta ordem:

1. Mapa de funcionalidades do `PRODUTO.md`
2. Índice do memox, por termo e por módulo
3. Telas, rotas e relatórios do sistema — busque em português e em inglês
4. Relatórios de uso do runx — descrevem o sistema na linguagem do cliente
5. Pedidos já avaliados no `INDICE.md` — `ja_existe` e `nao_fazer` com termos próximos

## Saída

```
Existencia — "<o que foi procurado>"
Termos: <termos e sinonimos>
Desfecho: <EXISTE | EXISTE PARCIAL | NAO EXISTE>
Evidencia: <tela + caminho | rota + arquivo:linha | ocorrencia + trecho>
Se PARCIAL, falta: <o que falta, e o tamanho relativo ao pedido>
Onde procurei sem achar: <lugares>
```

## Regras

- Regra 5: "acho que já tem" não é resposta. Toda afirmação vem com evidência.
- Registre também **onde procurou e não achou** — é o que impede a próxima pessoa de repetir a busca.
- Antes de declarar EXISTE, confirme que o perfil de quem pediu **tem acesso**. Se não tem, é EXISTE PARCIAL.
- Funcionalidade que existe mas está quebrada não é existência: é `correcao`.
- Dado que existe em tabela sem tela que o exponha é **NÃO EXISTE** para o usuário.
- Sem memox ou sem relatórios do runx: registre a ausência, marque a confiança como reduzida, e siga. Nunca bloqueia.
