# P2 — Entendimento do pedido

Produz `01-pedido.md` na pasta do pedido. Só roda em avaliação completa.

## Pré-requisitos

- Triagem feita, com pelo menos um gatilho disparado.
- Pasta `docs/produto/pedidos/<PD-ID>-<slug>/` criada.
- `PRODUTO.md` existe (se não, rode o P1 antes — ou avise e siga com o que der, marcando a dependência).

## Passo a passo

### 1. Preserve o pedido original, literalmente

Copie o texto como chegou, com os erros, a pressa e a informalidade. Não limpe, não resuma, não traduza para "linguagem técnica". O original é evidência: daqui a seis meses ele responde "foi isso mesmo que pediram?".

Registre também: quem pediu, por qual canal, quando.

### 2. Separe as três coisas que chegam misturadas

| Camada | Pergunta que a revela |
|--------|----------------------|
| **Solução** | O que o cliente pediu, literalmente, em termos de artefato? |
| **Problema** | O que dói? O que ele não consegue fazer hoje? |
| **Motivação** | Por que isso dói agora? O que mudou? Quem cobra isso dele? |

A motivação frequentemente não é obtível — está na cabeça de quem pediu. Quando não der, marque `NAO DETERMINADO` e escreva a pergunta a fazer. Não invente.

### 3. Aplique a pergunta que estrutura a etapa

> **Se isso fosse resolvido de outro jeito, o cliente ficaria satisfeito?**

- **Sim** → a solução pedida **não é o requisito**. O problema é. Registre isso explicitamente; é o insumo do veredito `fazer_outra_coisa`.
- **Não** → o cliente quer aquele artefato específico. Pergunte por quê — normalmente há uma restrição não dita (auditoria, um cliente dele, um processo externo).

Exemplo canônico:

> Pedido: "Coloca um campo de observação na tela de pedido."
> Se o sistema registrasse automaticamente o motivo do desconto concedido, o cliente ficaria satisfeito? **Provavelmente sim.**
> Então o requisito não é o campo. É registrar o motivo do desconto — e isso talvez já exista, talvez seja menor, talvez precise ser estruturado e não texto livre.

### 4. Classifique

| Classificação | Quando |
|---------------|--------|
| `correcao` | Algo funciona diferente do especificado |
| `duvida` | O cliente não sabe usar o que já existe |
| `melhoria` | Algo funciona, mas poderia ser melhor |
| `novo` | Não existe |
| `fora_de_escopo` | Não é o que este produto faz |

A classificação é provisória até o P3: um `novo` vira `duvida` com frequência quando a verificação de existência acha a tela.

### 5. Pergunte densidade e forma de construção — só se o veredito puder ser `fazer`

Estas duas perguntas abrem toda avaliação completa que pode terminar em trabalho. Pule-as quando a classificação já aponta claramente para `duvida` ou `fora_de_escopo` — não vale perguntar isso a quem talvez nem vá construir nada.

| Pergunta | Opções | O que registra |
|----------|--------|-----------------|
| **Densidade** | `mvp` \| `padrao` \| `completo` \| `profundo` | Quanto investimento o cliente/negócio topa colocar nisto — não é estimativa de esforço (isso é do sprintx), é intenção de escopo. |
| **Forma de construção** | `entrevista` \| `autonomo` | Se quem vai planejar deve entrevistar o solicitante em cada decisão, ou pesquisar e assumir hipóteses sozinho, registrando o raciocínio. |

Pergunte as duas junto do bloco de perguntas em aberto (passo 7), na linguagem de quem pediu:

> "Isso é para resolver rápido e simples (MVP), no padrão normal do sistema, de forma completa, ou você quer que a gente vá fundo nisso (profundo)?"
> "Prefere que a gente vá conversando com você em cada decisão, ou pode pesquisar e decidir sozinho, te mostrando depois o que foi decidido?"

Registre a resposta como **intenção**, não como decisão técnica travada: quem confirma de fato — com mais contexto de código e arquitetura — é o sprintx, na abertura do planejamento (F1/F2). Se quem pediu não souber responder, registre a hipótese mais provável a partir do porte do pedido e do gatilho que disparou (G8 sozinho tende a `padrao`; G1+G2 juntos tendem a `completo`), marcada como hipótese, não como resposta confirmada.

### 6. Verifique comportamento intencional — obrigatório para `correcao`

Regra 7. Se o pedido chegou rotulado como bug e descreve **cálculo, prazo, permissão, bloqueio ou validação**, verifique antes de mandar para o runx:

- Existe comentário, teste, migração ou documento que declare a regra?
- Existe relatório de uso do runx de uma ocorrência anterior que a estabeleceu?
- O `PRODUTO.md` lista isso como restrição que não se negocia?

Achou evidência de que é deliberado → **não é bug**. Reclassifique como `melhoria` ou `fora_de_escopo` e leve isso ao P4 como decisão de produto: mudar a regra afeta os outros clientes.

Não achou evidência → registre que procurou, onde, e que não achou. Isso é diferente de "não verifiquei".

### 7. Quando faltar informação essencial, pare

Regra 8: informação que falta vira pergunta, **nunca suposição**.

Escreva as perguntas, para quem, e **pare de avançar**. Bloco de no máximo cinco perguntas.

Informação é essencial quando sem ela o veredito muda. "Qual o navegador" raramente é essencial; "isso é para um cliente ou para todos" quase sempre é.

## Formato da saída

`assets/TEMPLATE-pedido.md`, com frontmatter `kind: pedido`. Seções:

1. Pedido original (literal) — com autor, canal, data
2. Solução pedida
3. Problema por trás
4. Motivação
5. A pergunta estruturante e a resposta
6. Classificação, com justificativa em uma linha
7. Densidade e forma de construção sugeridas (quando aplicável)
8. Verificação de comportamento intencional (quando `correcao`)
9. Perguntas em aberto — para quem, e o que muda a depender da resposta

## Modo didático

Na avaliação completa, explique enquanto trabalha: mostre a separação solução/problema em voz alta, diga por que a pergunta estruturante importa, e mostre o que você considerou e descartou na classificação.

Exemplo de saída didática no chat:

> O pedido chegou como "campo de observação". Isso é uma solução — um artefato de tela. Removi a solução da frase e perguntei o que sobra: nada. O cliente não disse o que dói.
> Levantei a hipótese, a partir do canal e de quem pediu, de que o problema real é registrar o motivo do desconto concedido, porque a auditoria cobra. Isso é hipótese, não fato — está no bloco de perguntas.
> Classifiquei provisoriamente como `novo`, mas o P3 pode derrubar: se já existe campo de justificativa no fluxo de aprovação de desconto, isso vira `duvida`.

## Critério de saída

- `01-pedido.md` existe, com o original preservado literalmente.
- Solução e problema estão separados, e a pergunta estruturante foi respondida.
- Classificação registrada com justificativa.
- Se a classificação puder terminar em `fazer`: densidade e forma de construção registradas — como resposta confirmada ou como hipótese explícita.
- Se `correcao`: a verificação de comportamento intencional está documentada, com onde se procurou.
- Se há perguntas em aberto essenciais: o pedido está marcado como **aguardando resposta** e o P3 não começou.

## Quando falha

| Falha | O que fazer |
|-------|-------------|
| O pedido não tem problema identificável e ninguém responde | Marque `problema: NAO DETERMINADO`, deixe as perguntas registradas e pare. Não avance para P3 inventando o problema. |
| O pedido tem três problemas dentro | Separe em pedidos distintos, um PD-ID cada, e diga isso ao dev. Avaliar três coisas juntas produz um veredito que não serve para nenhuma. |
| Quem pediu não está acessível (cliente sumiu, ticket antigo) | Registre isso. Avance com a hipótese **marcada como hipótese** e leve para o P4 como risco: "veredito depende de confirmação de X". |
| O cliente insiste na solução e recusa falar do problema | Registre a insistência — ela própria é informação (normalmente há restrição externa). Leve ao P4 como fator. |
