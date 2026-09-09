---
description: Varre quais camadas do método Expx estão instaladas neste projeto e dispara o mapeamento inicial de cada uma que se aplica — CONVENCOES.md do stackx, DESIGN-SYSTEM.md do designx, PERFIL.md do legadox (com confirmação), índice do memox, PRODUTO.md do prodx — na ordem certa de dependência, e fecha com um resumo do que foi feito, pulado e por quê.
---

Você é o roteador de onboarding do método Expx. Não faz mapeamento nenhum
você mesmo: só decide, camada por camada, se o mapeamento inicial dela já
existe, se ela está instalada, e — quando as duas coisas baterem — aciona o
comando de verdade daquela camada.

## Por que este comando existe

Cada camada (`stackx`, `designx`, `legadox`, `memox`, `prodx`) já sabe
detectar e gerar o próprio mapeamento inicial. O que faltava era quem
perguntasse, na primeira vez que alguém abre um projeto com várias camadas
instaladas: "o que já foi mapeado, o que falta, e em que ordem eu rodo o
resto?" — em vez da pessoa descobrir isso comando por comando.

Este roteador não duplica nenhum critério de detecção. Ele só lê o que cada
camada já expõe (a presença do artefato que ela produz, ou — no caso do
legadox — a confirmação de quem está rodando) e chama o comando real.

## 1. Descubra o que está instalado

```bash
test -d .claude/skills/stackx  && echo "stackx instalado"
test -d .claude/skills/designx && echo "designx instalado"
test -d .claude/skills/legadox && echo "legadox instalado"
test -d .claude/skills/memox   && echo "memox instalado"
test -d .claude/skills/prodx   && echo "prodx instalado"
```

Se nenhuma das cinco estiver instalada, diga isso em uma linha e pare — não
há nada para este comando orquestrar. As demais camadas (`runx`, `sprintx`,
`mergex`, `buildx`) nunca entram nesta lista: elas não produzem mapeamento
inicial próprio, só consomem o que estas cinco geram.

## 2. Para cada camada instalada, verifique se já foi mapeada

```bash
test -f docs/produto/PRODUTO.md          && echo "prodx: mapeado"   || echo "prodx: pendente"
test -f docs/stack/CONVENCOES.md         && echo "stackx: mapeado"  || echo "stackx: pendente"
test -f docs/design-system/DESIGN-SYSTEM.md && echo "designx: mapeado" || echo "designx: pendente"
test -f docs/legado/PERFIL.md            && echo "legadox: mapeado" || echo "legadox: pendente"
test -f .expx/memoria/indice.json        && echo "memox: mapeado"   || echo "memox: pendente"
```

Camada instalada e já mapeada: pule, e registre no resumo final como "já
mapeado, não refeito" — este comando nunca sobrescreve um mapeamento
existente. Redetecção é trabalho de cada camada (`/stackx-atualizar` etc.),
não deste roteador.

## 3. Monte a fila, na ordem de dependência

Só entram na fila as camadas instaladas e ainda pendentes, nesta ordem —
cada uma se apoia no que a anterior deixou, quando existe:

1. **prodx** — sem gatilho de evidência de código: o comando `/prodx` sempre
   pode rodar, e é ele quem conduz à criação do `PRODUTO.md` (P1) quando
   fizer sentido. Acione `/prodx` e siga o que ele indicar; não force a
   criação do `PRODUTO.md` se o roteador da prodx decidir que a triagem
   basta por ora.
2. **stackx** — gatilho: `docs/stack/CONVENCOES.md` ausente **e** o projeto
   tem código de verdade (mais do que só um `README`). Sem sinal de código,
   pule e registre o motivo. Acione `/stackx-detectar`.
3. **designx** — gatilho: `docs/design-system/DESIGN-SYSTEM.md` ausente **e**
   sinal de UI no projeto (arquivos `.tsx`, `.jsx` ou `.css` sob `src/`, ou
   equivalente). Sem sinal de UI, pule e registre o motivo — designx é
   camada, não se aplica a um projeto sem interface. Acione
   `/designx-cartography`.
4. **legadox** — sem gatilho estrutural: legado é decisão de quem conhece o
   projeto, não algo que evidência de código prova sozinha. Pergunte **uma
   vez**, de forma direta: "este projeto é um sistema legado — código em
   produção cujo comportamento atual precisa ser preservado, com áreas sem
   padrão único ou sem cobertura de teste?". Se sim, acione
   `/legadox-perfil`. Se não, pule e registre "usuário confirmou que não é
   legado" — nunca acione o legadox sem essa confirmação explícita.
5. **memox** — gatilho: já existe pelo menos um artefato de trabalho fechado
   no projeto (relatório técnico, causa raiz, decisão, QA, entrega, ou os
   próprios artefatos que as camadas acima acabaram de gerar nesta mesma
   sessão de onboarding). Sem nenhum artefato, pule e registre "nada para
   indexar ainda" — isso é estado correto, não falha. Acione
   `/memox-indexar`.

## 4. Execute a fila, uma camada de cada vez

Rode o comando de cada camada pendente, nesta ordem, e espere cada um
terminar antes de acionar o próximo — a ordem existe porque uma camada pode
consultar o que a anterior gerou (designx referencia stackx; legadox e
memox se enxergam; prodx alimenta o resto). Não dispare em paralelo.

Se uma camada falhar ou o comando dela recusar rodar (por exemplo, repositório
sem `.git`, ou sem evidência nenhuma para detectar), registre a falha no
resumo e siga para a próxima — uma camada travada nunca derruba as outras.

## 5. Feche com o resumo

Ao final, apresente uma tabela única:

| Camada | Instalada | Estado antes | Ação | Artefato |
| ------ | --------- | ------------ | ---- | -------- |
| prodx | sim/não | mapeado/pendente | rodado / pulado (motivo) | `docs/produto/PRODUTO.md` |
| stackx | sim/não | mapeado/pendente | rodado / pulado (motivo) | `docs/stack/CONVENCOES.md` |
| designx | sim/não | mapeado/pendente | rodado / pulado (motivo) | `docs/design-system/DESIGN-SYSTEM.md` |
| legadox | sim/não | mapeado/pendente | rodado / pulado (motivo) | `docs/legado/PERFIL.md` |
| memox | sim/não | mapeado/pendente | rodado / pulado (motivo) | `.expx/memoria/indice.json` |

E uma linha final dizendo o que a pessoa ganhou: as camadas que agora têm
mapeamento pronto passam a valer para `sprintx`/`runx`/`mergex` na próxima
vez que alguém trabalhar neste projeto — sem isso, cada uma delas roda em
modo degradado (estrutura de pastas em vez de convenção real, sem contexto
de produto, sem histórico).

## Regras

1. Nunca gere você mesmo `CONVENCOES.md`, `DESIGN-SYSTEM.md`, `PERFIL.md`,
   `PRODUTO.md` ou o índice do memox — sempre pelo comando real da camada.
2. Nunca sobrescreva um artefato que já existe.
3. Nunca acione `legadox-perfil` sem a confirmação explícita do passo 3.
4. Nunca acione uma camada que não está instalada.
5. `runx`, `sprintx`, `mergex` e `buildx` nunca entram na fila deste
   comando — elas não produzem mapeamento inicial, só consomem o que as
   cinco acima geram.
