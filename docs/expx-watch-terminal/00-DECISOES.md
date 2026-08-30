---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: expx-watch-terminal
atualizado_em: 2026-08-30
decisoes:
  - id: D-01
    decisao: subcomando watch do CLI existente, no array SUBCOMANDOS e na tabela EXECUTORES
    alternativa_descartada: binario separado expx-watch
    motivo: resposta antecipada do usuario na abertura da feature
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: reaproveita montarProjeto e lerEstado sem refatorar nem mover
    alternativa_descartada: extrair camada de parsing para pacote proprio
    motivo: a F1 provou que o parser e funcao pura de sistema de arquivos, sem acoplamento a HTTP
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: somente leitura sem excecao, garantido por teste que falha se houver chamada de escrita
    alternativa_descartada: somente leitura por convencao
    motivo: resposta antecipada do usuario; teste transforma promessa em impossibilidade
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: zero dependencia nova, so node:fs, node:tty, node:readline e ANSI escrito a mao
    alternativa_descartada: adicionar picocolors ou ink como dependencia de producao
    motivo: os pacotes ANSI em node_modules sao transitivos de devDependency e somem em producao
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: trabalho atual sem estado.json e o unico em_andamento; havendo empate, o de atualizado_em mais recente; nenhum, mostra a lista
    alternativa_descartada: estagio mais avancado
    motivo: status e o campo que declara intencao; estagio avancado nao implica trabalho ativo
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: observador proprio do watch com duas raizes, docs e .expx/estado.json, sem tocar observador.ts
    alternativa_descartada: parametrizar o ignored de observar()
    motivo: mudar o observador do painel arrisca a decisao D-06 do painel; o watch e somente leitura tambem no codigo alheio
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: rodape conta evento regra_violada do rastro, e sessao e desde que o watch subiu
    alternativa_descartada: contar Violacao da conformidade do plano
    motivo: a especificacao diz modo aviso, que e vocabulario de hook e existe so no rastro
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: debounce de 150 ms para o watch
    alternativa_descartada: reusar os 300 ms do painel
    motivo: tela sob observacao humana continua tolera menos latencia que aba de navegador ao lado
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: le so o fim do rastro, ultimos 64 KB por arquivo, e exibe as 10 ultimas linhas
    alternativa_descartada: ler o arquivo inteiro como validarRastro faz
    motivo: rotacao so em 5 MB, e reler 5 MB a cada evento viola nada de chamada externa cara
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: honra NO_COLOR alem de stdout.isTTY
    alternativa_descartada: so isTTY, como a especificacao pede
    motivo: convencao de ecossistema, custo de uma linha, e nunca contraria a especificacao
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: camada de desenho e funcao pura de estado e largura para lista de linhas, testada sem TTY
    alternativa_descartada: testar por subprocesso com TTY falso
    motivo: mesma razao que levou o projeto a injetar Saida e Perguntador, registrada em expx.ts:31-35
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: expx_estado diferente de 1 e tratado como estado.json invalido e cai para o plano
    alternativa_descartada: tentar ler assim mesmo
    motivo: mesma politica do expx-schema para versao futura, e o modo degradado ja existe
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: em divergencia, cabecalho vem do estado.json e arvore vem do plano, cada numero com sua fonte
    alternativa_descartada: o plano sempre ganha
    motivo: a especificacao declara estado.json fonte primaria e o plano fonte da arvore; nao ha conflito se cada um mantiver seu escopo
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: tempo do bloqueio em dias a partir de aberto_em, exibido como ha N dias e hoje quando zero
    alternativa_descartada: cruzar com o ts do evento task_bloqueada para ter hora
    motivo: cruzar duas fontes por um refinamento cosmetico paga caro em complexidade e em modo degradado
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: normaliza para NFC antes de medir largura
    alternativa_descartada: assumir NFC e medir com String.length direto
    motivo: nome vindo do macOS chega em NFD e quebraria o corte em 80 colunas
    status: fechada
    bloqueante: false
  - id: D-16
    decisao: trabalho aberto em --todos e todo status diferente de concluido
    alternativa_descartada: so em_andamento
    motivo: bloqueado e nao_iniciado sao exatamente o que a pessoa precisa ver numa lista de acompanhamento
    status: fechada
    bloqueante: false
  - id: D-17
    decisao: raiz do projeto sobe diretorios ate achar .git, com fallback no diretorio atual
    alternativa_descartada: exigir --dir como o painel faz
    motivo: o watch precisa de docs e .expx juntas, que so fazem sentido a partir da raiz do repositorio
    status: fechada
    bloqueante: false
  - id: D-18
    decisao: as dez fixtures da especificacao entram na sprint de fundacao antes de qualquer desenho
    alternativa_descartada: criar fixture sob demanda a cada task
    motivo: regra 13 do metodo, e cinco delas nao existem hoje, incluindo as duas fontes primarias
    status: fechada
    bloqueante: false
  - id: D-19
    decisao: sem trabalho aberto mostra a lista de trabalhos recentes e segue observando
    alternativa_descartada: sair com mensagem
    motivo: a especificacao pede explicitamente ficar aguardando um novo
    status: fechada
    bloqueante: false
  - id: D-20
    decisao: redesenho reposiciona o cursor e reescreve as linhas, sem buffer alternativo e sem limpar a tela
    alternativa_descartada: buffer alternativo do terminal
    motivo: buffer alternativo apaga o que estava na tela ao sair, e a especificacao exige nao piscar
    status: fechada
    bloqueante: false
  - id: D-21
    decisao: restauracao do terminal em SIGINT, SIGTERM, excecao nao capturada e process.on exit
    alternativa_descartada: so SIGINT e SIGTERM como principal.ts faz
    motivo: nunca deixa o terminal quebrado e definicao de pronto do usuario
    status: fechada
    bloqueante: false
---

# Decisões — expx-watch-terminal

> Uma linha por decisão tomada no planejamento. Formato fixo. Não apague decisões: uma decisão revertida ganha nova linha que cita a anterior.

**Nota de procedência.** O usuário autorizou explicitamente, na abertura da F2, decidir todas as lacunas sem entrevista ("decide tudo e implementa sem me perguntar mais nada"). As decisões D-05 a D-21 são portanto **decisões da skill, não respostas do usuário** — cada uma traz o motivo e a alternativa descartada para auditoria. D-01 a D-04 vêm das respostas antecipadas do usuário na abertura da feature. Divergir de qualquer uma é uma linha nova neste arquivo, não uma correção no código.

## Decisões

```
D-01 | Subcomando `watch` do CLI existente | binário separado `expx-watch` | resposta antecipada do usuário
D-02 | Reaproveita `montarProjeto` e `lerEstado` sem refatorar nem mover | extrair camada de parsing | a F1 provou que o parser é função pura de fs, sem acoplamento a HTTP (base/parser-de-artefatos.md)
D-03 | Somente leitura sem exceção, garantido por teste | somente leitura por convenção | teste transforma promessa em impossibilidade técnica
D-04 | Zero dependência nova: `node:fs`, `node:tty`, `node:readline` e ANSI à mão | adicionar picocolors ou ink | os pacotes ANSI em node_modules são transitivos de devDependency e somem em produção (base/bibliotecas-de-terminal.md)
D-05 | Trabalho atual sem `estado.json`: o único `em_andamento`; empate, o `atualizado_em` mais recente; nenhum, mostra a lista | estágio mais avançado | `status` declara intenção; estágio avançado não implica trabalho ativo — resolve L-01
D-06 | Observador próprio do watch, com duas raízes (`docs/` e `.expx/estado.json`) | parametrizar o `ignored` de `observar()` | mexer no observador do painel arrisca a decisão D-06 dele; o watch é somente leitura também no código alheio — resolve L-02
D-07 | Rodapé conta `evento: regra_violada` do rastro; "sessão" = desde que o watch subiu | contar `Violacao` da conformidade | a especificação diz "modo aviso", vocabulário de hook que só existe no rastro — resolve L-03
D-08 | Debounce de 150 ms | reusar os 300 ms do painel | tela sob observação humana contínua tolera menos latência que aba de navegador — resolve L-04
D-09 | Lê só o fim do rastro (últimos 64 KB por arquivo) e exibe as 10 últimas linhas | ler o arquivo inteiro, como `validarRastro` | rotação só em 5 MB; reler 5 MB por evento viola "nada de chamada externa cara" — resolve L-05
D-10 | Honra `NO_COLOR` além de `stdout.isTTY` | só `isTTY` | convenção de ecossistema, custo de uma linha, nunca contraria a especificação — resolve L-06
D-11 | Desenho é função pura `(estado, largura) => string[]`, testada sem TTY | testar por subprocesso com TTY falso | mesma razão que levou o projeto a injetar `Saida` e `Perguntador` (`src/cli/expx.ts:31-35`) — resolve L-07
D-12 | `expx_estado` ≠ 1 é tratado como inválido e cai para o plano | tentar ler assim mesmo | mesma política do `expx-schema` para versão futura; o modo degradado já existe — resolve L-08
D-13 | Cabeçalho vem do `estado.json`, árvore vem do plano; cada número com sua fonte | o plano sempre ganha | a especificação declara os dois papéis; não há conflito se cada fonte mantiver seu escopo — resolve L-09
D-14 | Tempo de bloqueio em dias a partir de `aberto_em` ("há N dias", "hoje" quando zero) | cruzar com o `ts` do evento `task_bloqueada` | cruzar duas fontes por refinamento cosmético paga caro em complexidade e no modo degradado — resolve L-10
D-15 | Normaliza para NFC antes de medir largura | assumir NFC e usar `String.length` | nome vindo do macOS chega em NFD e quebraria o corte em 80 colunas — resolve L-11
D-16 | "Trabalho aberto" em `--todos` = todo `status` ≠ `concluido` | só `em_andamento` | `bloqueado` e `nao_iniciado` são exatamente o que a pessoa precisa ver numa lista de acompanhamento — resolve L-12
D-17 | Raiz do projeto sobe diretórios até achar `.git`, com fallback no diretório atual | exigir `--dir` como o painel | o watch precisa de `docs/` e `.expx/` juntas, que só fazem sentido a partir da raiz do repositório — resolve L-13
D-18 | As dez fixtures da especificação entram na sprint de fundação | criar fixture sob demanda por task | regra 13 do método; cinco não existem, incluindo as duas fontes primárias — resolve L-14
D-19 | Sem trabalho aberto: mostra os trabalhos recentes e segue observando | sair com mensagem | a especificação pede explicitamente "fica aguardando um novo"
D-20 | Redesenho reposiciona o cursor e reescreve linhas; sem buffer alternativo, sem limpar tela | buffer alternativo do terminal | buffer alternativo apaga o que estava na tela ao sair, e a especificação exige não piscar
D-21 | Restauração do terminal em `SIGINT`, `SIGTERM`, exceção não capturada e `process.on("exit")` | só `SIGINT`/`SIGTERM`, como `principal.ts` | "nunca deixa o terminal quebrado" é definição de pronto do usuário
```

## Pendências

Nenhuma pendência. O usuário autorizou a skill a decidir todas as lacunas da F1; as 14 estão resolvidas por D-05 a D-18, e nenhuma decisão ficou em aberto.

## Cobertura dos sete eixos

| Eixo | Onde foi decidido |
|---|---|
| 1. Escopo de negócio | A especificação da abertura já fixa o escopo e o fora de escopo da v1; D-16 e D-19 fecham os casos de borda de listagem |
| 2. Arquitetura | D-01, D-02, D-04, D-06, D-11, D-17 |
| 3. Contrato de dados | D-05, D-09, D-12, D-13, D-14 — nada persiste: o watch só lê (D-03) |
| 4. Estado e observabilidade | D-07, D-13; o watch é ele próprio a ferramenta de observabilidade, e não emite evento (D-03) |
| 5. Resiliência e política de erro | D-05, D-06, D-12, D-19, D-21; as cinco tolerâncias a falha da especificação são critério de aceite, não decisão em aberto |
| 6. Ambiente e segredos | Nenhum segredo: o watch não faz rede (especificação) e não lê variável de ambiente além de `NO_COLOR` (D-10) |
| 7. Definição de pronto | As cinco da especificação, mais D-03 (teste de somente leitura) e D-11 (desenho testável sem TTY) |
