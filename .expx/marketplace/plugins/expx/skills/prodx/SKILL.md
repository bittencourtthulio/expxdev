---
name: prodx
description: Use ao receber qualquer pedido cru — chamado de suporte, solicitação de cliente, reclamação, ideia de funcionalidade, "seria bom se o sistema fizesse X", pedido de tela, relatório ou campo novo — e sempre que a pergunta for se vale a pena fazer algo, se algo já existe no sistema, ou se um pedido deve virar trabalho. Decide SE há trabalho antes de qualquer planejamento: roda antes do sprintx e do runx, faz a triagem do pedido, verifica se o que foi pedido já existe, avalia e emite um veredito com evidência para assinatura humana. Use mesmo sem a palavra prodx.
---

# prodx

A camada de produto do ecossistema Expx: o portão entre o pedido do cliente e o planejamento técnico.

## Princípio central

O cliente pede solução, não problema. O trabalho do prodx é achar o problema por trás do pedido, verificar se ele já está resolvido, e só então decidir se vale construir alguma coisa.

## A realidade desta casa

Hoje o pedido vai **direto do suporte para o desenvolvedor**. Não existe papel de produto formalizado. Três consequências que governam todo o desenho desta skill:

1. **Quem roda o prodx é o próprio desenvolvedor** que recebeu o chamado, normalmente com outros na fila. Um processo de cinco etapas por ticket não sobrevive a isso — por isso existe a triagem.
2. **A skill é o processo que não existe**, não a ferramenta de um processo existente. Ela ensina enquanto roda (modo didático).
3. **Não há quem assine hoje.** A skill ajuda a estabelecer isso, não presume que já está resolvido.

## O indicador de que está funcionando

**A taxa de pedidos que NÃO viram trabalho.** Se tudo que entra sai como "fazer", o prodx é burocracia e será pulado na segunda semana. Este é o critério honesto de utilidade da skill. Quando perguntada sobre o estado, ela reporta essa proporção a partir do `INDICE.md`.

## O que o prodx NÃO faz

- **Não decide sozinho.** Ele recomenda com evidência; **quem assina é humano**. Esta é a diferença mais importante em relação às skills irmãs: dizer "não" a um cliente tem consequência comercial, e cliente que ouve não e não deveria ter ouvido é cliente perdido.
- **Não planeja implementação.** Isso é sprintx e runx.
- **Não estima esforço.** Isso é a F3.5 do sprintx, e depende do plano.
- **Não fala com o cliente.** Ele produz o texto; quem envia é o atendimento.
- **Não substitui conversa.** Quando a informação não está em lugar nenhum, ele diz o que perguntar a quem, em vez de supor.

## P0 — Triagem

Primeira etapa de todo pedido, e a que decide quanto processo aplicar. Dura segundos e **não gera pasta**.

A maioria dos chamados de uma software house é trivial: rótulo errado, campo desalinhado, dúvida de uso, erro óbvio. Esses passam direto, com registro de uma linha no `INDICE.md` e o veredito imediato.

A avaliação completa só é acionada quando um destes **gatilhos** disparar:

| # | Gatilho |
|---|---------|
| G1 | O pedido é do tipo `novo`, ou pede tela, relatório ou fluxo novo |
| G2 | O pedido descreve uma solução, não um problema |
| G3 | O pedido serve a um cliente só, num produto multi-cliente |
| G4 | O pedido cheira a algo que já existe no sistema |
| G5 | O pedido chegou rotulado como bug mas descreve regra de negócio |
| G6 | O pedido toca zona de risco declarada no `PERFIL.md` do legadox |
| G7 | O mesmo pedido já foi recusado antes |
| G8 | O esforço aparente é maior que alguns dias |

- **Nenhum gatilho disparou** → veredito direto, uma linha no `INDICE.md`, segue para o runx.
- **Um gatilho ou mais** → avaliação completa, P2 a P5.

### Regra de proporcionalidade

A estrutura é sempre a mesma; a profundidade é proporcional ao pedido. **Proibido** rodar avaliação completa em pedido trivial, e **proibido** pular a avaliação quando um gatilho disparou.

Se a triagem estiver mandando quase tudo para avaliação completa, os gatilhos estão largos demais e isso precisa ser ajustado.

A triagem é a diferença entre uma ferramenta que o dev usa e uma que ele contorna.

Roteiro completo: `references/00-triagem.md`.

## Estágios em resumo

| Estágio | Nome | Saída | Quando roda |
|---------|------|-------|-------------|
| P0 | Triagem | linha no `INDICE.md` | todo pedido |
| P1 | Contexto de produto | `docs/produto/PRODUTO.md` | uma vez, atualizado sob demanda |
| P2 | Entendimento do pedido | `01-pedido.md` | avaliação completa |
| P3 | Verificação de existência | `02-existencia.md` | avaliação completa |
| P4 | Avaliação | `03-avaliacao.md` | quando não for EXISTE |
| P5 | Veredito e briefing | `VEREDITO.md`, `BRIEFING.md` | avaliação completa |

## Os quatro vereditos

Três dos quatro **não geram trabalho**:

| Veredito | Significado |
|----------|-------------|
| `ja_existe` | O sistema já faz. Sai um texto para o cliente explicando onde e como, na linguagem dele. |
| `nao_fazer` | Com o motivo registrado. Este arquivo é **ativo permanente**: quando o pedido voltar, a avaliação já está feita. |
| `fazer_outra_coisa` | O problema real reformulado, que costuma ser menor e diferente do pedido. |
| `fazer` | E aí sai o briefing. |

O `VEREDITO.md` sempre traz: a recomendação, o raciocínio em três linhas, a evidência principal, o que muda a recomendação se for descoberto, e um campo de **assinatura humana** — quem aprovou e quando, preenchido pela pessoa, **nunca pela skill**.

## Modo didático

Padrão nesta casa. Como não existe papel de produto formalizado, a skill explica o raciocínio de cada etapa enquanto trabalha, mostra o que considerou e descartou, e diz por que aquela pergunta importa. Ela está ensinando um método que ninguém no time pratica ainda.

- Vale **apenas na avaliação completa**. Na triagem a skill é seca: ninguém quer aula para aprovar a correção de um rótulo.
- Quando o `PRODUTO.md` declarar um signatário **não provisório** e o `INDICE.md` tiver **mais de trinta** pedidos avaliados, a skill passa a ser concisa também na avaliação: o método já pegou.

## Estrutura em disco

```
docs/produto/
  PRODUTO.md
  LACUNAS.md
  INDICE.md                append-only, uma linha por pedido
  pedidos/
    <PD-ID>-<slug>/        criada apenas em avaliação completa
      01-pedido.md
      02-existencia.md
      03-avaliacao.md
      VEREDITO.md
      BRIEFING.md          só quando o veredito for fazer
```

- Pedido que passa na triagem **não gera pasta**: entra só como linha no `INDICE.md`, com o veredito e o motivo.
- `PD-ID` no formato `PD-<AAAA>-<NNNN>`, sequencial.
- `slug` do título: minúsculo, sem acento, hifens, no máximo 6 palavras.
- Pedido recusado **nunca é apagado**: a avaliação vale para a próxima vez.

### Frontmatter

Todos os arquivos usam o padrão **expx-schema v1**: chaves em `snake_case` sem acento, enums minúsculos sem acento, datas em ISO, chave nunca omitida.

Kinds do prodx: `produto`, `pedido`, `existencia`, `avaliacao`, `veredito`, `briefing`, `produto_indice`.

O kind `veredito` carrega: `veredito`, `via`, `gatilhos_disparados`, `aprovado_por`, `aprovado_em`, `provisorio`, `trabalho_gerado`, `recorrencia`.

## Máquina de estados

| Situação | Próximo passo |
|----------|---------------|
| `docs/produto/PRODUTO.md` não existe | P1 |
| pedido novo | P0 triagem |
| triagem sem gatilho | veredito direto, fim |
| triagem com gatilho, pasta não existe | P2 |
| `01-pedido.md` existe, `02-existencia.md` não | P3 |
| `02-existencia.md` diz EXISTE | P5, veredito `ja_existe` |
| `02-existencia.md` existe, `03-avaliacao.md` não | P4 |
| `03-avaliacao.md` existe, `VEREDITO.md` não | P5 |
| `VEREDITO.md` sem assinatura | aguarda humano |
| `VEREDITO.md` assinado como `fazer`, sem briefing | gera o briefing |

- **Etapa adiantada**: a skill explica o que falta e executa a pendente.
- **Vários pedidos abertos sem indicação de qual**: lista com o estágio de cada um.

## As 12 regras invioláveis

1. A skill não decide. Ela recomenda com evidência; humano assina.
2. Nenhum trabalho segue para sprintx ou runx sem veredito assinado — inclusive os aprovados na triagem, onde a assinatura é uma confirmação de uma linha, não uma cerimônia.
3. A triagem nunca é pulada, e a avaliação completa nunca roda em pedido sem gatilho disparado.
4. A solução pedida nunca é tratada como o requisito. O requisito é o problema.
5. A verificação de existência é obrigatória na avaliação completa e vem com evidência: tela, rota, arquivo ou relatório. "Acho que já tem" não é resposta.
6. Escopo mínimo é campo obrigatório e nunca fica vazio.
7. Pedido rotulado como bug é verificado contra comportamento intencional antes de virar ocorrência.
8. Informação que falta vira pergunta, nunca suposição.
9. Pedido recusado não é apagado: a avaliação é ativo permanente.
10. O briefing não contém decisão técnica.
11. Nada de invenção no `PRODUTO.md`. O não verificável vira `NAO DETERMINADO` e entra em `LACUNAS.md`.
12. O campo de quem assina nunca fica vazio no `PRODUTO.md`.

## Integração com as outras skills

| Skill | Relação |
|-------|---------|
| **runx** | Caminho mais comum, porque hoje o pedido chega pelo suporte. O `BRIEFING.md` vira o `00-OCORRENCIA.md`, já com o tipo classificado e o comportamento intencional verificado. Pedido aprovado na triagem entrega um briefing de uma linha, não um documento. |
| **sprintx** | Recebe o `BRIEFING.md` como entrada da F1. O plano referencia o `PD-ID` de origem. |
| **memox** | Indexa o `INDICE.md` e os vereditos, e é ele que faz a verificação de existência do P3 melhorar com o tempo. |
| **legadox** | Quando existir `PERFIL.md`, o P1 puxa dele as zonas de risco. Tocar zona de risco é gatilho de avaliação completa (G6). |
| **relatórios de uso do runx** | Melhor descrição existente do que o sistema faz na linguagem do cliente. O P1 e o P3 os consomem. |

**A ausência de qualquer uma nunca bloqueia o prodx.**

## References e templates

| Arquivo | Conteúdo |
|---------|----------|
| `references/00-triagem.md` | P0: os 8 gatilhos verificáveis, com exemplo que dispara e que não dispara; formato da linha do INDICE |
| `references/01-produto.md` | P1: montagem do `PRODUTO.md`, fontes, signatário provisório, `LACUNAS.md` |
| `references/02-pedido.md` | P2: separar solução de problema, classificação, bloco de perguntas |
| `references/03-existencia.md` | P3: onde procurar, em que ordem, o que conta como evidência, EXISTE vs EXISTE PARCIAL |
| `references/04-avaliacao.md` | P4: as sete perguntas da avaliação, escopo mínimo, recorrência |
| `references/05-veredito.md` | P5: os quatro vereditos, modo didático e conciso, resposta ao cliente, assinatura |
| `references/integracao/runx.md` | Como o briefing vira `00-OCORRENCIA.md` |
| `references/integracao/sprintx.md` | Como o briefing entra na F1 |
| `references/integracao/memox.md` | O que é indexado e como o P3 melhora |
| `assets/TEMPLATE-PRODUTO.md` | Template do `PRODUTO.md` |
| `assets/TEMPLATE-pedido.md` | Template do `01-pedido.md` |
| `assets/TEMPLATE-existencia.md` | Template do `02-existencia.md` |
| `assets/TEMPLATE-avaliacao.md` | Template do `03-avaliacao.md` |
| `assets/TEMPLATE-VEREDITO.md` | Template do `VEREDITO.md` |
| `assets/TEMPLATE-BRIEFING.md` | Template do `BRIEFING.md` |
| `assets/TEMPLATE-INDICE.md` | Template do `INDICE.md` |
| `assets/TEMPLATE-resposta-cliente.md` | Texto de resposta para o veredito `ja_existe` |

## Comandos

| Comando | Função |
|---------|--------|
| `/prodx` | Roteador: conduz à criação do `PRODUTO.md` se não existir; senão mostra pedidos abertos, estágio de cada um, e a proporção triagem vs. avaliação completa |
| `/prodx-produto` | P1: cria ou atualiza o `PRODUTO.md` |
| `/prodx-triar` | P0 isolada, sobre um chamado recém-chegado via `$ARGUMENTS` |
| `/prodx-avaliar` | P2 a P5, avaliação completa |
| `/prodx-existe` | P3 isolada: consulta rápida de "isso já existe?" |
| `/prodx-briefing` | Gera o briefing de um veredito já assinado |

## Ambiguidades

Decisões tomadas na ausência de informação estão registradas em `DECISOES-DA-SKILL.md`.
