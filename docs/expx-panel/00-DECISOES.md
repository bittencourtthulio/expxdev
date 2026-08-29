---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: expx-panel
atualizado_em: 2026-08-29
decisoes:
  - id: D-01
    decisao: O parser aceita as duas formas do campo arquivos e normaliza para o mapa cria/altera
    alternativa_descartada: Seguir so a forma do contrato (lista plana)
    motivo: As duas skills gravam o mapa; o contrato esta defasado e o disco manda
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: O kind decisoes e reconhecido como kind valido do painel
    alternativa_descartada: Rejeitar como kind desconhecido por nao estar no contrato
    motivo: A sprintx grava 00-DECISOES.md em toda feature; rejeitar geraria erro falso em massa
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: Rejeicao e violacao sao listas separadas; rejeicao e falha de leitura, violacao e arquivo lido com defeito
    alternativa_descartada: Uma lista unica de problemas
    motivo: Sao duas telas no pedido; arquivo com teste vazio deve aparecer com o defeito a vista, nao sumir
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: Chave obrigatoria ausente e violacao do metodo, nao rejeicao, desde que o kind seja identificavel
    alternativa_descartada: Rejeitar todo arquivo com chave faltando
    motivo: Coerente com D-03; o painel existe para mostrar o defeito, nao para esconder o arquivo
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: tipo_ocorrencia aceita null apenas quando expx_tool e sprintx
    alternativa_descartada: Aceitar null em qualquer arquivo
    motivo: O contrato preve null para feature e a runx afirma que nunca e null nela
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: O id de fase aceita F-NN e F-NN.M; a comparacao entre ids e literal apos normalizar
    alternativa_descartada: Aceitar so F-NN.M como dizem as skills
    motivo: O contrato usa F-NN em todos os exemplos e trabalhos antigos podem ter o formato curto
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: teste_regressao e opcional em arquivos sprintx e obrigatorio so na primeira task de bug da runx
    alternativa_descartada: Exigir a chave presente em todo arquivo tasks
    motivo: A sprintx nao lista o campo no contrato de task; exigir geraria violacao falsa
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: A primeira task de um bug e a de menor id na ordem natural entre as tasks da menor fase
    alternativa_descartada: Usar a posicao na lista YAML
    motivo: Ordem por id e estavel e independente de como a skill serializou a lista
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: expx_schema maior que 1 e rejeicao com motivo dedicado pedindo atualizacao do painel
    alternativa_descartada: Tentar interpretar por aproximacao
    motivo: Exigencia explicita do pedido; interpretar versao futura por aproximacao corrompe o estado
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: Combinacao incoerente de expx_tool e estagio e violacao do metodo
    alternativa_descartada: Aceitar em silencio
    motivo: E defeito mecanicamente detectavel e o painel existe para expor defeito
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: So sao candidatos a arquivo de estado os nomes conhecidos do metodo; os demais .md sao ignorados em silencio
    alternativa_descartada: Reportar todo .md sem frontmatter como fora do schema
    motivo: Arquivos de base, LACUNAS e AUDITORIA nao tem frontmatter por projeto; reportar seria ruido em massa
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: Pasta sem ORQUESTRADOR.md e ignorada em silencio e nao vira trabalho
    alternativa_descartada: Reportar como pasta orfa
    motivo: docs/ contem pastas legitimas que nao sao trabalho, como docs/contrato
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: O vinculo task-fase e autoritativo pelo campo fase da task
    alternativa_descartada: Usar a lista tasks declarada na fase
    motivo: A task e a unidade de progresso; a lista da fase e derivavel dela
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: Sprints sao descobertas varrendo as pastas sprint-NN do disco
    alternativa_descartada: Confiar na lista sprints do ORQUESTRADOR.md
    motivo: O disco e o estado; a lista do orquestrador pode ficar defasada
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: N de bloqueio antigo e 7 dias, configuravel por flag --dias-bloqueio
    alternativa_descartada: Constante fixa sem configuracao
    motivo: O pedido nao fixa o numero; 7 dias e uma semana de trabalho
    status: fechada
    bloqueante: false
  - id: D-16
    decisao: A data de hoje entra no calculo como parametro explicito da funcao de conformidade
    alternativa_descartada: Chamar o relogio dentro da regra
    motivo: Regra que le o relogio nao e testavel e a fixture quebra sozinha com o tempo
    status: fechada
    bloqueante: false
  - id: D-17
    decisao: Ausencia de OCORRENCIA, CAUSA-RAIZ ou QA num trabalho runx nunca e erro
    alternativa_descartada: Exigir os tres em todo trabalho runx
    motivo: Sao produzidos ao longo dos estagios; ausencia e o estado normal no inicio
    status: fechada
    bloqueante: false
  - id: D-18
    decisao: O historico e montado varrendo as pastas de docs/relatorios; o INDICE.md nao e fonte
    alternativa_descartada: Ler as entradas do INDICE.md
    motivo: O disco e o estado; pasta sem entrada no indice ficaria invisivel
    status: fechada
    bloqueante: false
  - id: D-19
    decisao: A busca por modulo casa contra modulo_afetado do relatorio
    alternativa_descartada: Casar contra o campo modulo do indice
    motivo: Coerente com D-18 e o campo do relatorio e lista, nao valor unico
    status: fechada
    bloqueante: false
  - id: D-20
    decisao: Referencia cruzada quebrada entre ids e violacao do metodo, nao rejeicao
    alternativa_descartada: Rejeitar o arquivo inteiro
    motivo: Coerente com D-03; o arquivo e legivel e o defeito precisa aparecer
    status: fechada
    bloqueante: false
  - id: D-21
    decisao: Ciclo em depende_de e detectado e reportado como violacao, e o grafo e renderizado sem travar
    alternativa_descartada: Ignorar ciclos
    motivo: Ciclo trava a visualizacao e e defeito real de plano
    status: fechada
    bloqueante: false
  - id: D-22
    decisao: O validador de esquema em runtime e zod
    alternativa_descartada: Ajv com JSON Schema
    motivo: Integra tipo estatico e validacao em runtime numa unica declaracao
    status: fechada
    bloqueante: false
  - id: D-23
    decisao: O engines do pacote exige node maior ou igual a 20.19.0
    alternativa_descartada: Exigir node 22
    motivo: E o piso real imposto pelo chokidar 5 e cobre o ambiente atual
    status: fechada
    bloqueante: false
  - id: D-24
    decisao: A linha da violacao e obtida com parse posicional do YAML com yaml e o metodo lineCounter
    alternativa_descartada: Aceitar violacao sem linha
    motivo: O pedido pede arquivo e linha; gray-matter sozinho nao devolve posicao
    status: fechada
    bloqueante: false
  - id: D-25
    decisao: Linha em branco ou lixo antes do bloco --- torna o arquivo sem frontmatter e portanto ignorado
    alternativa_descartada: Tolerar preambulo antes do bloco
    motivo: A regra 1 e literal e gray-matter ja se comporta assim; BOM ele mesmo remove
    status: fechada
    bloqueante: false
  - id: D-26
    decisao: Os cards de resumo agrupam por estagio, com f1-f5 e e1-e2 como planejamento e f6 e e3-e5 como execucao
    alternativa_descartada: Agrupar os quatro cards por status
    motivo: Status nao distingue planejamento de execucao; estagio e a maquina de estados do metodo
    status: fechada
    bloqueante: false
  - id: D-27
    decisao: A releitura e do projeto inteiro a cada mudanca, com debounce de 300ms
    alternativa_descartada: Releitura incremental so do arquivo alterado
    motivo: Referencia cruzada entre arquivos exige visao global; debounce absorve gravacao parcial
    status: fechada
    bloqueante: false
  - id: D-28
    decisao: O websocket envia o estado inteiro a cada atualizacao
    alternativa_descartada: Enviar delta
    motivo: Coerente com D-27 e elimina divergencia de estado entre servidor e tela
    status: fechada
    bloqueante: false
  - id: D-29
    decisao: A UI mostra indicador visivel quando o websocket cai
    alternativa_descartada: Reconectar em silencio
    motivo: Tela congelada com dado velho e pior que erro visivel
    status: fechada
    bloqueante: false
  - id: D-30
    decisao: A API de leitura e REST em JSON sob /api, servida pelo mesmo processo
    alternativa_descartada: Entregar so o estado inicial embutido no HTML
    motivo: Mantem a UI sem regra de negocio e permite testar o servidor sem navegador
    status: fechada
    bloqueante: false
  - id: D-31
    decisao: estagio incoerente com status e violacao do metodo e o card usa o estagio
    alternativa_descartada: Deixar o trabalho aparecer em dois grupos conflitantes
    motivo: Coerente com D-26 que ja elege estagio como fonte do agrupamento
    status: fechada
    bloqueante: false
  - id: D-32
    decisao: atualizado_em e opcional nos kinds ocorrencia e qa
    alternativa_descartada: Exigir a chave como nos demais kinds
    motivo: O contrato nao a lista nesses dois kinds e exigir geraria violacao falsa
    status: fechada
    bloqueante: false
---

# Decisões — expx-panel

> Uma linha por decisão tomada no planejamento (F2 e, excepcionalmente, F3). Formato fixo. Não apague decisões: uma decisão revertida ganha nova linha que cita a anterior.
>
> **Nota de método.** O usuário autorizou explicitamente decidir tudo sem entrevista ("decide tudo e implementa tudo até o final sem me perguntar mais nada"). As 26 lacunas da F1 foram fechadas aqui como decisões. As decisões D-01 e D-02 contrariam o contrato `expx-schema v1` a favor do que as skills realmente gravam — ver a seção "Divergências resolvidas contra o contrato" abaixo.

## Decisões

```
D-01 | Parser aceita as duas formas de `arquivos` e normaliza para {cria, altera} | Seguir só a lista plana do contrato | As duas skills gravam o mapa; o disco manda (L-04)
D-02 | O kind `decisoes` é reconhecido como válido | Rejeitar por não constar do contrato | A sprintx grava 00-DECISOES.md em toda feature; rejeitar geraria erro falso em massa (L-02)
D-03 | Rejeição e violação são listas separadas | Uma lista única de problemas | São duas telas no pedido; arquivo com teste vazio deve aparecer com o defeito à vista (L-05)
D-04 | Chave obrigatória ausente é violação, não rejeição | Rejeitar todo arquivo com chave faltando | O painel existe para mostrar o defeito, não para esconder o arquivo (L-05)
D-05 | `tipo_ocorrencia: null` só quando `expx_tool: sprintx` | Aceitar null em qualquer arquivo | Contrato prevê null para feature; runx afirma que nunca é null nela (L-01)
D-06 | Id de fase aceita `F-NN` e `F-NN.M` | Aceitar só `F-NN.M` | O contrato usa `F-NN` em todos os exemplos; trabalhos antigos podem tê-lo (L-12)
D-07 | `teste_regressao` opcional em sprintx, obrigatório só na 1ª task de bug runx | Exigir a chave em todo `tasks.md` | A sprintx não lista o campo; exigir geraria violação falsa (L-08)
D-08 | "Primeira task" = menor id, na menor fase | Usar a posição na lista YAML | Ordem por id é estável e independente da serialização (L-09)
D-09 | `expx_schema` > 1 é rejeição com motivo dedicado | Interpretar por aproximação | Exigência do pedido; aproximar corrompe o estado (L-06)
D-10 | `expx_tool` incoerente com `estagio` é violação | Aceitar em silêncio | Defeito mecanicamente detectável (L-03)
D-11 | Só nomes conhecidos do método são candidatos a arquivo de estado | Reportar todo `.md` sem frontmatter | Base, LACUNAS e AUDITORIA não têm frontmatter por projeto (L-23)
D-12 | Pasta sem `ORQUESTRADOR.md` é ignorada em silêncio | Reportar como pasta órfã | `docs/` tem pastas legítimas que não são trabalho (L-13)
D-13 | O vínculo task↔fase é autoritativo pelo campo `fase` da task | Usar a lista `tasks` da fase | A task é a unidade de progresso (L-16)
D-14 | Sprints descobertas varrendo as pastas `sprint-NN/` | Confiar na lista `sprints` do orquestrador | O disco é o estado (L-17)
D-15 | N = 7 dias, configurável por `--dias-bloqueio` | Constante fixa | O pedido não fixa o número (L-18)
D-16 | "Hoje" entra como parâmetro explícito da função de conformidade | Ler o relógio dentro da regra | Regra que lê relógio não é testável (L-05, riscos)
D-17 | Ausência de OCORRENCIA/CAUSA-RAIZ/QA nunca é erro | Exigir os três em todo trabalho runx | São produzidos ao longo dos estágios (L-20)
D-18 | Histórico montado varrendo `docs/relatorios/`; `INDICE.md` não é fonte | Ler as entradas do índice | Pasta sem entrada ficaria invisível (L-21)
D-19 | Busca por módulo casa contra `modulo_afetado` do relatório | Casar contra `modulo` do índice | Coerente com D-18; o campo do relatório é lista (L-22)
D-20 | Referência cruzada quebrada é violação, não rejeição | Rejeitar o arquivo inteiro | Coerente com D-03 (L-10)
D-21 | Ciclo em `depende_de` é violação; o grafo renderiza sem travar | Ignorar ciclos | Ciclo trava a visualização e é defeito real (L-11)
D-22 | Validador em runtime é zod | Ajv com JSON Schema | Integra tipo estático e validação numa declaração (L-24)
D-23 | `engines.node >= 20.19.0` | Exigir node 22 | Piso real imposto pelo chokidar 5 (L-25)
D-24 | Linha da violação por parse posicional com `yaml` + lineCounter | Aceitar violação sem linha | gray-matter não devolve posição (L-26)
D-25 | Preâmbulo antes do `---` torna o arquivo sem frontmatter | Tolerar preâmbulo | A regra 1 é literal; BOM o gray-matter já remove (L-07)
D-26 | Cards agrupam por `estagio`: f1–f5/e1–e2 planejam, f6/e3–e5 executam | Agrupar por `status` | `status` não distingue planejamento de execução (L-15)
D-27 | Releitura do projeto inteiro a cada mudança, debounce 300ms | Releitura incremental | Referência cruzada exige visão global (L-05, ao vivo)
D-28 | Websocket envia o estado inteiro | Enviar delta | Elimina divergência de estado entre servidor e tela
D-29 | Indicador visível quando o websocket cai | Reconectar em silêncio | Tela congelada com dado velho é pior que erro visível
D-30 | API REST em JSON sob `/api`, mesmo processo | Estado embutido no HTML | Mantém a UI sem regra de negócio e permite testar sem navegador
D-31 | `estagio` incoerente com `status` é violação; o card usa `estagio` | Deixar o trabalho em dois grupos conflitantes | Coerente com D-26, que já elege `estagio` como fonte do agrupamento (L-14)
D-32 | `atualizado_em` é opcional nos kinds `ocorrencia` e `qa` | Exigir a chave como nos demais | O contrato não a lista nesses dois; exigir geraria violação falsa (L-19)
```

## Divergências resolvidas contra o contrato

O contrato `expx-schema v1` declara-se "a fonte da verdade quando skill e parser divergirem". Aqui quem diverge são as **skills**, e são elas que escrevem os arquivos. Duas decisões seguem as skills contra o contrato, porque o painel precisa ler o que existe no disco:

- **D-01** (`arquivos`): contrato diz lista plana; sprintx e runx gravam `{cria, altera}`. O parser aceita as duas e normaliza — nenhum arquivo real é perdido, seja qual for o lado que se atualize depois.
- **D-02** (kind `decisoes`): não está no contrato; a sprintx o grava sempre. Reconhecê-lo é a única saída que não enche a tela de erro com arquivos válidos.

Ambas são conservadoras: aceitam o superconjunto. Se o contrato for atualizado para incorporar as skills, nada muda no painel.

## Pendências

Nenhuma pendência.
