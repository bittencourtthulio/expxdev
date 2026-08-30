# P3 — Verificação de existência

Produz `02-existencia.md`. **A etapa mais valiosa e a mais ignorada.**

Cliente pede "relatório de vendas por região" e o sistema tem isso há três anos numa tela que ninguém achou.

## Pré-requisitos

- `01-pedido.md` existe, com o problema separado da solução.
- Se o P2 parou por falta de informação essencial, **não rode o P3**: você procuraria a coisa errada.

Também roda isolada, via `/prodx-existe`, como consulta rápida de "isso já existe?". Nesse modo produz resposta no chat, não arquivo.

## O que você está procurando

Não o artefato pedido. **O problema resolvido.**

O cliente pediu "relatório por região". Você não procura um arquivo chamado `relatorio_regiao`. Você procura: existe alguma forma, hoje, de o usuário ver vendas separadas por região? Um filtro numa tela existente conta. Uma exportação para Excel que tem a coluna conta. Um relatório com outro nome conta.

## Passo a passo — procure nesta ordem

A ordem importa: começa barato e específico, termina caro e amplo.

### 1. O mapa de funcionalidades do `PRODUTO.md`

Busque pelos substantivos do problema, não do pedido. Para "relatório de vendas por região": `venda`, `regiao`, `relatorio`, `gerencial`, e os sinônimos que a casa usa (`faturamento`, `praça`, `território`, `filial`).

Barato e frequentemente suficiente.

### 2. O índice do memox, por termo e por módulo

O memox sabe o que foi construído e onde. Busque por termo e depois liste o módulo inteiro que fizer sentido — funcionalidade antiga costuma estar com nome que ninguém mais usa.

### 3. As telas, rotas e relatórios do sistema

A evidência mais dura. Procure em:

- arquivos de rota / definição de menu
- controllers, views, templates
- diretório de relatórios, se houver
- migrações e schema: uma coluna `regiao` na tabela de vendas é forte indício de que alguém já resolveu isso

Nomes em inglês no código e em português na tela é a armadilha mais comum. Busque nos dois.

### 4. Os relatórios de uso de ocorrências anteriores (runx)

Descrevem o sistema na linguagem do cliente — exatamente a linguagem do pedido. Se existe funcionalidade obscura, é aqui que ela aparece descrita como o usuário a entende.

### 5. Os pedidos já recusados no `INDICE.md`

O mesmo pedido pode ter sido avaliado antes. Busque por `nao_fazer` e por `ja_existe` com termos próximos.

- Se foi recusado: **o motivo continua valendo?** O motivo é datado. "Não fazemos porque só um cliente usa" envelhece quando três clientes passam a pedir.
- Se foi `ja_existe`: você acabou de achar a resposta, e ela já tem texto de cliente escrito.

## O que conta como evidência

Regra 5: "acho que já tem" não é resposta. Toda afirmação vem com **uma dessas**:

| Tipo | Formato da evidência |
|------|---------------------|
| Tela | Nome da tela + caminho no menu: `Vendas > Relatórios > Análise gerencial` |
| Rota | Caminho da rota + arquivo que a define: `/vendas/relatorios/gerencial` em `routes/vendas.rb:44` |
| Arquivo | Caminho relativo + linha: `app/reports/sales_summary.py:120` |
| Relatório de uso | ID da ocorrência + trecho citado: `OC-2025-0087, "o usuário filtra por praça no topo da tela"` |
| Registro no índice | PD-ID + veredito: `PD-2025-0014, ja_existe` |

**Não conta como evidência:** memória, nome parecido sem abrir o arquivo, existência de tabela sem tela que a exponha, ou funcionalidade que existe mas está desligada por configuração sem confirmar que o cliente pode ligar.

Sempre escreva **onde procurou e não achou**, não só onde achou. Isso é o que impede a próxima pessoa de repetir a busca.

## Os três desfechos

### EXISTE

Faz o que o cliente quer, hoje, acessível para o perfil dele.

Teste antes de declarar: o usuário que pediu **tem permissão** de acessar? Está no plano/módulo que o cliente dele contratou? Se não, não é EXISTE — é EXISTE PARCIAL (falta liberar) ou é outro problema.

→ Vai direto para o P5, veredito `ja_existe`. **O P4 não roda.**

### EXISTE PARCIAL

Faz parte, e **falta um pedaço menor que o pedido**.

Este é o desfecho mais comum e o mais valioso: normalmente transforma um pedido grande num ajuste pequeno. "O relatório existe mas não tem a coluna de região" é meio dia de trabalho, não três semanas.

→ Vai para o P4, e o pedaço que falta vira a base do **escopo mínimo**.

### NÃO EXISTE

Procurou nos cinco lugares, com termos e sinônimos, e não achou.

→ Vai para o P4.

## Como distinguir EXISTE de EXISTE PARCIAL

A pergunta é sobre o **problema**, não sobre o artefato:

| Situação | Desfecho |
|----------|----------|
| O usuário consegue resolver o problema hoje, mesmo que por caminho diferente do pedido | EXISTE |
| O usuário consegue resolver, mas por caminho que ele não conhece | EXISTE — e o produto tem problema de descoberta, registre isso |
| O usuário resolve 80% e faz o resto no Excel | EXISTE PARCIAL |
| O usuário resolve, mas só o perfil administrador consegue | EXISTE PARCIAL (falta permissão) |
| A funcionalidade existe mas está quebrada | **Não é existência** — é `correcao`. Reclassifique o pedido no P2 e mande para o runx. |
| Existe a tabela/dado, mas nenhuma tela expõe | NÃO EXISTE (para o usuário, não existe) |

Regra prática: se o esforço para completar é **menor que o esforço do pedido original**, é PARCIAL e vale muito registrar. Se é do mesmo tamanho, trate como NÃO EXISTE e não force.

## Formato da saída

`assets/TEMPLATE-existencia.md`, frontmatter `kind: existencia`. Seções:

1. O que foi procurado — os termos e sinônimos usados
2. Onde foi procurado — os cinco lugares, cada um com achado ou "nada encontrado"
3. Desfecho: `existe` | `existe_parcial` | `nao_existe`
4. Evidência principal, no formato da tabela acima
5. Se PARCIAL: o que falta exatamente, e o tamanho relativo ao pedido
6. Se EXISTE: onde está, como se chega, e em que perfil — insumo do texto ao cliente
7. Pedidos anteriores relacionados, com PD-ID e se o motivo ainda vale

## Critério de saída

- Os cinco lugares foram consultados **ou** está registrado por que um deles não existe (sem memox, sem legadox — nunca bloqueia).
- O desfecho está declarado.
- Há pelo menos uma evidência no formato exigido, ou o registro explícito de onde se procurou sem achar.
- Se PARCIAL: o que falta está descrito em termos de trabalho, não de desejo.

## Quando falha

| Falha | O que fazer |
|-------|-------------|
| Sem memox e sem relatórios de uso | Registre a ausência e siga com os três lugares restantes. Nunca bloqueia. Marque a confiança do desfecho como reduzida. |
| Achou algo parecido mas não consegue confirmar se resolve | Não declare EXISTE. Escreva a pergunta a fazer a quem conhece a tela, e marque como pendente. Um `ja_existe` errado devolvido pelo cliente custa mais que o pedido. |
| A busca no código não retorna nada por causa de nomenclatura | Tente: sinônimos em português, termos em inglês, o nome do módulo inteiro, e o menu da aplicação. Registre os termos tentados. |
| Existe em outro cliente/instalação mas não neste | Isso é EXISTE PARCIAL com natureza de configuração ou de contrato. Leve ao P4 — é decisão comercial, não técnica. |
| O desfecho é EXISTE mas o cliente já disse que não serve | Volte ao P2: o problema foi mal capturado. Não force `ja_existe` contra a evidência do usuário. |
