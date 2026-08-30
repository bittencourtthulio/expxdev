# Decisões da skill

Ambiguidades encontradas na construção do prodx e como foram resolvidas.
Cada uma registra o que estava em aberto, a decisão tomada, e o que faria
revisá-la.

---

## D1 — Numeração dos gatilhos da triagem

**Ambiguidade:** a especificação lista oito gatilhos em prosa, sem
identificadores.

**Decisão:** numerados de `G1` a `G8`, na ordem em que aparecem na
especificação. A numeração é usada no frontmatter (`gatilhos_disparados`)
e na saída da triagem.

**Por quê:** sem identificador, o campo `gatilhos_disparados` teria de
carregar frases inteiras, e a análise da proporção de disparo por gatilho
— necessária para ajustar a largura deles — ficaria impraticável.

---

## D2 — Resposta "talvez" na triagem

**Ambiguidade:** a especificação exige que cada gatilho seja verificável,
mas não diz o que fazer quando o dev não consegue decidir em segundos.

**Decisão:** na dúvida, o gatilho dispara. Registrado em
`references/00-triagem.md`.

**Por quê:** o erro de avaliar demais custa uma conversa; o erro de deixar
passar custa trabalho construído à toa. O contrapeso é o indicador da
proporção: se a avaliação completa passar de 50%, os gatilhos apertam.

---

## D3 — Assinatura no caminho da triagem

**Ambiguidade:** a regra 2 exige veredito assinado para todo trabalho,
inclusive o aprovado na triagem, mas a triagem "dura segundos e não gera
pasta". Onde a assinatura é registrada se não há arquivo?

**Decisão:** a assinatura da triagem é uma confirmação de uma linha no
chat, registrada na própria linha do `INDICE.md`, no campo de motivo e no
briefing de uma linha. Nenhum arquivo é criado.

**Por quê:** a especificação é explícita em que ali a assinatura "é uma
confirmação de uma linha, não uma cerimônia". Criar arquivo só para
guardar a assinatura reintroduziria o atrito que a triagem existe para
evitar.

---

## D4 — Quem assina no caminho da triagem

**Ambiguidade:** o signatário do `PRODUTO.md` é quem diz não a um cliente.
Ele precisa confirmar também a correção de um rótulo?

**Decisão:** não. Na triagem sem gatilho, a confirmação de uma linha do
próprio dev que recebeu o chamado basta, e é registrada em nome dele. O
signatário do `PRODUTO.md` é exigido nos vereditos de avaliação completa.

**Por quê:** exigir o sócio para aprovar o alinhamento de um botão faria a
skill ser contornada no primeiro dia. O risco comercial que justifica a
assinatura formal está nos vereditos que dizem não, e esses vêm da
avaliação completa.

**O que revisa:** se aparecerem vereditos de triagem que geraram trabalho
grande, o gatilho G8 estava frouxo — o problema é o gatilho, não a
assinatura.

---

## D5 — Limiar do modo conciso

**Ambiguidade:** a especificação diz "mais de trinta pedidos avaliados".
Trinta pedidos no índice, ou trinta que passaram por avaliação completa?

**Decisão:** trinta pedidos **avaliados**, isto é, com `via: avaliacao`.
Pedidos de triagem não contam.

**Por quê:** o modo didático existe para ensinar o método da avaliação. É
a repetição da avaliação que faz o método pegar, não o volume de chamados
triviais triados.

---

## D6 — Signatário quando o usuário não nomeia ninguém

**Ambiguidade:** a regra 12 proíbe campo vazio, e a especificação manda
provocar a definição. E se, mesmo provocado, o usuário não nomear?

**Decisão:** registrar o **papel** (`lider_tecnico`, `dono`,
`responsavel_atendimento`) em vez do nome, com `provisorio: true`, e abrir
lacuna. Nunca vazio, nunca `NAO DETERMINADO`.

**Por quê:** um papel é acionável — dá para descobrir quem o ocupa. Vazio
não é. E a regra 12 é explícita em não aceitar nem `NAO DETERMINADO`.

---

## D7 — Funcionalidade que existe mas está quebrada

**Ambiguidade:** no P3, isso é `EXISTE` (a funcionalidade está lá) ou
`NAO EXISTE` (o usuário não consegue usar)?

**Decisão:** nenhum dos dois. É `correcao`, e o pedido volta ao P2 para
reclassificação, seguindo depois para o runx.

**Por quê:** os três desfechos do P3 respondem "vale construir isso?".
Funcionalidade quebrada não é pergunta de produto, é ocorrência de
manutenção — e mandá-la para a avaliação completa gastaria o processo
caro num caso que o runx resolve.

---

## D8 — Dado existe em tabela, mas nenhuma tela o expõe

**Ambiguidade:** o P3 encontra a coluna no banco. Isso conta como
existência?

**Decisão:** `NAO EXISTE`. Para o usuário, não existe.

**Por quê:** a verificação de existência é feita da perspectiva de quem
pediu. Uma coluna sem tela não resolve o problema de ninguém. O achado é
registrado porque muda o escopo mínimo — o trabalho é expor, não modelar.

---

## D9 — Etapas intermediárias não são indexadas pelo memox

**Ambiguidade:** o patch do memox manda indexar "o INDICE.md e os
vereditos". Os arquivos `01`, `02` e `03` entram?

**Decisão:** não entram. Apenas `INDICE.md` e `VEREDITO.md`.

**Por quê:** os intermediários contêm hipóteses que foram descartadas no
caminho até o veredito. Indexá-los faria a busca do P3 devolver caminhos
que já se sabe que não levam a lugar nenhum, o que piora exatamente a
etapa que a integração existe para melhorar.

---

## D10 — Caminho de arquivo dentro do briefing

**Ambiguidade:** a regra 10 proíbe decisão técnica no briefing. Citar onde
o problema aparece é decisão técnica?

**Decisão:** não é, desde que fique numa seção separada, marcada como
"contexto para quem vai investigar", e descreva **onde o problema
aparece**, nunca **onde ou como implementar**.

**Por quê:** o sprintx e o runx perderiam tempo redescobrindo o que o P3
já achou. A fronteira que importa é entre descrever o problema e prescrever
a solução — e essa continua intacta.

---

## D11 — Pedido com três problemas dentro

**Ambiguidade:** a especificação assume um pedido, um PD-ID. Chamados
reais vêm com vários assuntos no mesmo texto.

**Decisão:** separar em PD-IDs distintos já no P2, e informar o dev.

**Por quê:** um veredito só pode ter uma recomendação. Avaliar três coisas
juntas produz um veredito que não serve para nenhuma das três, e torna a
recusa de uma delas indefensável quando as outras duas eram boas.

---

## D12 — Ano do PD-ID

**Ambiguidade:** `PD-<AAAA>-<NNNN>` é sequencial. A sequência reinicia a
cada ano?

**Decisão:** sim. O contador reinicia em `0001` a cada ano, e o próximo
número sai da última linha do `INDICE.md` do ano corrente.

**Por quê:** é o comportamento usual do formato com ano embutido, e mantém
o número curto. O `INDICE.md` continua sendo append-only e único — apenas
a numeração é anual.

---

## D13 — Ausência de `PRODUTO.md` na hora da triagem

**Ambiguidade:** a máquina de estados manda ir ao P1 quando o
`PRODUTO.md` não existe. Isso bloqueia um chamado urgente que chegou
antes de o P1 ter sido rodado?

**Decisão:** não bloqueia. A triagem roda mesmo sem `PRODUTO.md`, com um
aviso de uma linha. Os gatilhos G3, G4 e G6 ficam enfraquecidos e isso é
registrado no pedido.

**Por quê:** bloquear o primeiro chamado numa exigência de documentação é
a forma mais rápida de a skill ser desinstalada. O P1 é convocado pelo
`/prodx`, não imposto pelo chamado que chegou.

---

## D14 — Calibração dos gatilhos, medida na construção

**Ambiguidade:** os oito gatilhos foram escritos a partir da
especificação, mas a largura deles só se verifica rodando pedidos reais.
Gatilho largo demais manda tudo para avaliação completa e mata a adoção.

**Medição:** dez chamados típicos de software house passados pela triagem
na construção da skill:

| # | Chamado | Gatilhos | Via |
|---|---------|----------|-----|
| 1 | Botao salvar desalinhado no mobile | nenhum | triagem |
| 2 | Erro 500 ao emitir segunda via de boleto | nenhum | triagem |
| 3 | Como cancelo um pedido faturado | nenhum | triagem |
| 4 | Coluna "Qtd" deveria ser "Quantidade" | nenhum | triagem |
| 5 | Relatorio de comissoes somando fevereiro errado | nenhum | triagem |
| 6 | Aumentar campo descricao para 500 caracteres | nenhum | triagem |
| 7 | Relatorio de vendas por regiao | G1, G4 | avaliacao |
| 8 | Campo de observacao na tela de pedido | G1, G2 | avaliacao |
| 9 | Exportacao no layout contabil do cliente Alfa | G1, G3 | avaliacao |
| 10 | Bug: nao deixa faturar com estoque negativo | G5 | avaliacao |

**Resultado: 6 triagem (60%) · 4 avaliação completa (40%).**

**Decisão:** os gatilhos ficam como estão. 40% está abaixo do teto de 50%
declarado em `references/00-triagem.md`.

**Ressalva honesta:** a amostra é enviesada para cima, porque quatro dos
dez chamados foram escolhidos justamente por serem os casos que a
especificação manda avaliar. Numa fila real de software house a proporção
de triviais é maior, e a taxa de avaliação completa tende a ficar
**abaixo** de 40%.

**O que revisa:** se, com trinta pedidos reais no `INDICE.md`, a
proporção de avaliação completa passar de 50%, os candidatos a apertar
são o **G4** (o "cheira a algo que já existe" é o mais subjetivo dos oito)
e o **G8** (o limite de "alguns dias" é frouxo por natureza). A skill
reporta essa proporção pelo `/prodx`.
