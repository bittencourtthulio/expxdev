---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: memox-painel
atualizado_em: 2026-08-29
decisoes:
  - id: D-01
    decisao: O painel le o indice do disco e nunca invoca o motor python do memox
    alternativa_descartada: O painel chamar memox.py indexar para gerar o indice sob demanda
    motivo: O painel e somente leitura e nao tem python como dependencia de runtime
    status: fechada
    bloqueante: false
  - id: D-02
    decisao: Indice ausente e estado normal e vira tela vazia que ensina a gerar o indice
    alternativa_descartada: Tratar ausencia como erro de carregamento
    motivo: O indice e gitignorado e local, entao ausente e o caso mais comum num clone
    status: fechada
    bloqueante: false
  - id: D-03
    decisao: A memoria entra no EstadoPainel como a chave memoria, servida junto do resto
    alternativa_descartada: Servir a memoria somente por rota sob demanda, fora do EstadoPainel
    motivo: A tela precisa reagir ao vivo e o painel ja difunde o estado inteiro por websocket
    status: fechada
    bloqueante: false
  - id: D-04
    decisao: O servidor serve uma projecao enxuta do indice, sem por_termo e sem trabalhos
    alternativa_descartada: Servir o indice.json inteiro como veio do disco
    motivo: O estado inteiro e retransmitido a cada mudanca de arquivo e por_termo e peso morto
    status: fechada
    bloqueante: false
  - id: D-05
    decisao: JSON invalido ou versao desconhecida degradam para memoria ausente com motivo declarado
    alternativa_descartada: Propagar a excecao e derrubar a montagem do estado
    motivo: A doutrina do painel e degradar mostrando, nunca quebrar
    status: fechada
    bloqueante: false
  - id: D-06
    decisao: O observador passa a ignorar .expx para a reindexacao nao disparar recarga
    alternativa_descartada: Manter o observador como esta e aceitar a recarga extra
    motivo: Gravar em .expx/memoria dispara o watcher e realimenta a recarga sem dado novo
    status: fechada
    bloqueante: false
  - id: D-07
    decisao: A tela Memoria e uma secao propria na activitybar, com contador de regressoes
    alternativa_descartada: Distribuir os sinais dentro das telas Historico e Detalhe
    motivo: A memoria responde a pergunta o que ja se sabe daqui, que e propria e nao cabe nas outras
    status: fechada
    bloqueante: false
  - id: D-08
    decisao: A tela Memoria nao respeita o filtro global de periodo
    alternativa_descartada: Recortar a memoria por periodo como as demais telas
    motivo: O valor do sinal e justamente o antigo, e a idade nao torna a regressao irrelevante
    status: fechada
    bloqueante: false
  - id: D-09
    decisao: Toda derivacao da memoria acontece no servidor e a tela so renderiza
    alternativa_descartada: A tela ordenar e classificar risco a partir do indice cru
    motivo: Regra declarada em ui/src/tipos.ts, a UI nao recalcula nada
    status: fechada
    bloqueante: false
  - id: D-10
    decisao: Arquivos de risco sao ordenados por regressoes, depois reprovacoes de QA, depois trabalhos
    alternativa_descartada: Ordenar apenas por quantidade de trabalhos que tocaram o arquivo
    motivo: Arquivo central e muito tocado sem ser fragil, e isso viraria ruido no topo da lista
    status: fechada
    bloqueante: false
  - id: D-11
    decisao: Regressao e coincidencia aparecem separadas, cada uma com sua evidencia e origem
    alternativa_descartada: Mostrar so as regressoes e omitir as coincidencias
    motivo: A coincidencia com o motivo explicito e o que prova que o indice nao inventa relacao
    status: fechada
    bloqueante: false
  - id: D-12
    decisao: Artefato contaminado por segredo aparece em destaque na tela de memoria
    alternativa_descartada: Omitir a contaminacao por ser assunto do motor do memox
    motivo: E informacao de seguranca que ninguem vai procurar por conta propria
    status: fechada
    bloqueante: false
  - id: D-13
    decisao: memox entra no CATALOGO do CLI como camada true
    alternativa_descartada: Entrar como skill base, com camada false
    motivo: Ele nao tem fluxo proprio e so produz indice que as outras skills consultam
    status: fechada
    bloqueante: false
  - id: D-14
    decisao: A montagem do plugin passa a copiar hooks da skill para .claude/hooks com bit de execucao
    alternativa_descartada: Deixar a copia dos hooks a cargo do usuario, como manda o README do memox
    motivo: Instalar via npx e prometer instalacao completa, e hook faltando falha em silencio
    status: fechada
    bloqueante: false
  - id: D-15
    decisao: A skill memox tambem e materializada em .claude/skills para o hook achar o motor
    alternativa_descartada: Manter a skill so na arvore do plugin em .expx/marketplace
    motivo: O hook resolve o motor como DIR_HOOK/../skills/memox/assets/memox.py e ficaria inerte
    status: fechada
    bloqueante: false
  - id: D-16
    decisao: mesclarSettings passa a registrar hooks de forma idempotente, comparando pelo comando
    alternativa_descartada: Acrescentar a entrada de hook a cada execucao do init
    motivo: Reinstalar duplicaria o hook e o memox rodaria duas vezes por prompt
    status: fechada
    bloqueante: false
  - id: D-17
    decisao: O doctor ganha verificacao de instalacao do memox, hook e motor
    alternativa_descartada: Confiar na instalacao sem diagnostico proprio
    motivo: O hook sai zero em silencio em qualquer erro, entao instalacao quebrada e invisivel
    status: fechada
    bloqueante: false
  - id: D-18
    decisao: A leitura do indice mora em src/parser/memoria e e chamada por montarProjeto
    alternativa_descartada: Ler o indice dentro de src/servidor/estado.ts
    motivo: montarProjeto e quem monta o Projeto, e estado.ts so acrescenta violacoes
    status: fechada
    bloqueante: false
  - id: D-19
    decisao: Fixture nova projeto-memoria com indice real em disco, e projeto-ok segue sem indice
    alternativa_descartada: Acrescentar indice a fixture projeto-ok
    motivo: Os dois casos precisam de cobertura e projeto-ok e quem prova o caso sem indice
    status: fechada
    bloqueante: false
  - id: D-20
    decisao: A memoria e exportavel em CSV pelo mesmo BotaoBaixar das demais telas
    alternativa_descartada: Tela sem exportacao
    motivo: Conformidade e Historico ja exportam e a memoria alimenta conversa fora do painel
    status: fechada
    bloqueante: false
  - id: D-21
    decisao: A URL do repositorio memox no catalogo e https://github.com/bittencourtthulio/MemoX
    alternativa_descartada: Deixar a URL a cargo de quem executar o plano
    motivo: O catalogo e a fonte que o init usa de verdade e a URL foi conferida com git ls-remote
    status: fechada
    bloqueante: false
  - id: D-22
    decisao: mesclarSettings recebe um terceiro parametro com os hooks a registrar
    alternativa_descartada: Inferir dentro da funcao que memox foi instalada
    motivo: A funcao nao conhece a lista de skills e inferir exigiria acoplar harness ao catalogo
    status: fechada
    bloqueante: false
  - id: D-23
    decisao: Sem hooks a registrar, settings.json continua com as duas chaves de hoje
    alternativa_descartada: Escrever a chave hooks vazia em toda instalacao
    motivo: O teste existente afirma as chaves exatas e projeto sem memox nao deve ganhar chave nova
    status: fechada
    bloqueante: false
  - id: D-24
    decisao: A fixture de memoria e copia de exemplos/indice.exemplo.json do repositorio MemoX
    alternativa_descartada: Escrever um indice reduzido a mao para a fixture
    motivo: O exemplo do proprio motor e a unica forma real do artefato disponivel
    status: fechada
    bloqueante: false
  - id: D-25
    decisao: criarRepoSkill ganha opcoes para hooks e assets nas fixtures de repositorio
    alternativa_descartada: Montar o repo de fixture com hooks a mao em cada teste
    motivo: O gerador e a fonte unica das fixtures de repositorio e duplicar convidaria a divergir
    status: fechada
    bloqueante: false
  - id: D-26
    decisao: A copia de hooks e skill para .claude acontece antes do descarte dos clones temporarios
    alternativa_descartada: Copiar depois de montar o marketplace
    motivo: O init remove os clones temporarios ao final e a copia depois disso leria pasta ja apagada
    status: fechada
    bloqueante: false
  - id: D-27
    decisao: Tipo da memoria e validado em runtime por schema zod exportado junto do tipo
    alternativa_descartada: Confiar no typecheck para validar o formato da projecao
    motivo: O tsconfig exclui arquivos de teste e a fixture da UI usa cast as unknown, entao tipo nao discrimina
    status: fechada
    bloqueante: false
---

# Decisões — memox-painel

> Uma linha por decisão tomada no planejamento (F2 e, excepcionalmente, F3). Formato fixo. Não apague decisões: uma decisão revertida ganha nova linha que cita a anterior.

## Nota sobre esta F2

O usuário autorizou explicitamente a execução sem perguntas ("implementa o que voce considerar sem precisar me perguntar nada") e, na mesma sessão, acrescentou o requisito de instalação via CLI ("tem que incluir o memox no cli para ele poder ser instalado tambem via npx expxdev").

Instrução do usuário prevalece sobre o roteiro da skill. Por isso esta F2 não entrevistou: cada eixo foi decidido a partir da evidência já levantada na F1, e **toda decisão foi fechada** — nenhuma pendência foi deixada em aberto, porque PENDENTE bloqueante travaria a F3 e impediria a entrega ponta a ponta que o usuário pediu.

As doze lacunas da F1 foram tratadas assim:

| Lacuna | Tratamento |
|---|---|
| L-01 tamanho do índice | D-04 — projeção enxuta resolve independentemente do tamanho |
| L-02 versão futura do índice | D-05 — versão desconhecida degrada para ausente, com motivo |
| L-03 atomicidade da gravação | D-05 — JSON inválido degrada em vez de derrubar |
| L-04 enum de faixa de atenção | tratado como string livre, exibida como veio |
| L-05 enum de papel | tratado como string livre, exibida como veio |
| L-06 tipos de segredo | tratados como lista de strings livres (D-12) |
| L-07 forma de `fora_do_indice` | fora do escopo desta entrega; não é servido |
| L-08 sem precedente de hook no CLI | D-14 — o precedente é criado por esta entrega |
| L-09 merge de `hooks` | D-16 — idempotente, comparando pelo comando |
| L-10 observador e `.expx` | D-06 — passa a ignorar |
| L-11 catálogo de variáveis CSS | reusa as variáveis já usadas pelas telas existentes |
| L-12 memox é camada? | D-13 — sim, `camada: true` |

### Eixos cobertos

1. **Escopo de negócio** — D-02, D-07, D-08, D-12, D-20. Entra: leitura do índice, tela de memória, instalação via CLI. Fica de fora: gerar o índice pelo painel (D-01), busca textual por termo (D-04).
2. **Arquitetura** — D-03, D-18, D-09.
3. **Contrato de dados** — D-04, D-10, D-11.
4. **Estado e observabilidade** — D-06, D-17.
5. **Resiliência e política de erro** — D-02, D-05.
6. **Ambiente e segredos** — D-12. O painel não lê segredo: só exibe quais artefatos o memox marcou como contaminados. Nenhuma variável de ambiente nova.
7. **Definição de pronto** — suíte verde, `npx expxdev init` instalando memox com hook funcional, e a seção Memória mostrando arquivos de risco, regressões e contaminações.

## Decisões

```
D-01 | O painel lê o índice do disco e nunca invoca o motor Python do memox | O painel chamar `memox.py indexar` sob demanda | O painel é somente leitura e não tem Python como dependência de runtime
D-02 | Índice ausente é estado normal e vira tela vazia que ensina a gerar o índice | Tratar ausência como erro de carregamento | O índice é gitignorado e local, então ausente é o caso mais comum num clone
D-03 | A memória entra no `EstadoPainel` como a chave `memoria`, servida junto do resto | Servir a memória SOMENTE por rota sob demanda, fora do `EstadoPainel` | A tela precisa reagir ao vivo e o painel já difunde o estado inteiro por websocket. A rota espelho `/api/memoria` é mantida, como já existe `/api/conformidade`
D-04 | O servidor serve uma projeção enxuta do índice, sem `por_termo` e sem `trabalhos` | Servir o `indice.json` inteiro como veio do disco | O estado inteiro é retransmitido a cada mudança de arquivo, e `por_termo` é peso morto
D-05 | JSON inválido ou versão desconhecida degradam para memória ausente com motivo declarado | Propagar a exceção e derrubar a montagem do estado | A doutrina do painel é degradar mostrando, nunca quebrar
D-06 | O observador passa a ignorar `.expx` para a reindexação não disparar recarga | Manter o observador como está e aceitar a recarga extra | Gravar em `.expx/memoria/` dispara o watcher e realimenta a recarga sem dado novo
D-07 | A tela Memória é uma seção própria na activitybar, com contador de regressões | Distribuir os sinais dentro das telas Histórico e Detalhe | A memória responde "o que já se sabe daqui", pergunta própria que não cabe nas outras
D-08 | A tela Memória não respeita o filtro global de período | Recortar a memória por período como as demais telas | O valor do sinal é justamente o antigo: a idade não torna a regressão irrelevante
D-09 | Toda derivação da memória acontece no servidor e a tela só renderiza | A tela ordenar e classificar risco a partir do índice cru | Regra declarada em `ui/src/tipos.ts`: "a UI não recalcula nada"
D-10 | Arquivos de risco são ordenados por regressões, depois reprovações de QA, depois trabalhos | Ordenar apenas por quantidade de trabalhos que tocaram o arquivo | Arquivo central é muito tocado sem ser frágil, e isso viraria ruído no topo
D-11 | Regressão e coincidência aparecem separadas, cada uma com sua evidência e origem | Mostrar só as regressões e omitir as coincidências | A coincidência com o motivo explícito é o que prova que o índice não inventa relação
D-12 | Artefato contaminado por segredo aparece em destaque na tela de memória | Omitir a contaminação por ser assunto do motor do memox | É informação de segurança que ninguém vai procurar por conta própria
D-13 | `memox` entra no `CATALOGO` do CLI como `camada: true` | Entrar como skill base, com `camada: false` | Ele não tem fluxo próprio: só produz índice que as outras skills consultam
D-14 | A montagem do plugin passa a copiar hooks da skill para `.claude/hooks/` com bit de execução | Deixar a cópia dos hooks a cargo do usuário, como manda o README do memox | Instalar via `npx` é prometer instalação completa, e hook faltando falha em silêncio
D-15 | A skill memox também é materializada em `.claude/skills/` para o hook achar o motor | Manter a skill só na árvore do plugin em `.expx/marketplace/` | O hook resolve `DIR_HOOK/../skills/memox/assets/memox.py` e ficaria inerte
D-16 | `mesclarSettings` passa a registrar hooks de forma idempotente, comparando pelo comando | Acrescentar a entrada de hook a cada execução do `init` | Reinstalar duplicaria o hook e o memox rodaria duas vezes por prompt
D-17 | O `doctor` ganha verificação de instalação do memox: hook e motor | Confiar na instalação sem diagnóstico próprio | O hook sai `0` em silêncio em qualquer erro, então instalação quebrada é invisível
D-18 | A leitura do índice mora em `src/parser/memoria/` e é chamada por `montarProjeto` | Ler o índice dentro de `src/servidor/estado.ts` | `montarProjeto` é quem monta o `Projeto`; `estado.ts` só acrescenta violações
D-19 | Fixture nova `projeto-memoria` com índice real em disco, e `projeto-ok` segue sem índice | Acrescentar índice à fixture `projeto-ok` | Os dois casos precisam de cobertura, e `projeto-ok` é quem prova o caso sem índice
D-20 | A memória é exportável em CSV pelo mesmo `BotaoBaixar` das demais telas | Tela sem exportação | Conformidade e Histórico já exportam, e a memória alimenta conversa fora do painel
D-21 | A URL do repositório memox no catálogo é `https://github.com/bittencourtthulio/MemoX` | Deixar a URL a cargo de quem executar o plano | O catálogo é a fonte que o `init` usa de verdade; a URL foi conferida com `git ls-remote` e responde
D-22 | `mesclarSettings` recebe um terceiro parâmetro com os hooks a registrar | Inferir dentro da função que memox foi instalada | A função não conhece a lista de skills, e inferir acoplaria o harness ao catálogo
D-23 | Sem hooks a registrar, `settings.json` continua com as duas chaves de hoje | Escrever a chave `hooks` vazia em toda instalação | O teste existente afirma as chaves exatas, e projeto sem memox não deve ganhar chave nova
D-24 | A fixture de memória é cópia de `exemplos/indice.exemplo.json` do repositório MemoX | Escrever um índice reduzido à mão para a fixture | O exemplo do próprio motor é a única forma real do artefato disponível
D-25 | `criarRepoSkill` ganha opções para hooks e assets nas fixtures de repositório | Montar o repo de fixture com hooks à mão em cada teste | O gerador é a fonte única das fixtures de repositório, e duplicar convidaria a divergir
D-26 | A cópia de hooks e skill para `.claude/` acontece antes do descarte dos clones temporários | Copiar depois de montar o marketplace | O `init` remove os clones temporários ao final, e copiar depois leria pasta já apagada
D-27 | O tipo da memória é validado em runtime por schema zod exportado junto do tipo | Confiar no typecheck para validar o formato da projeção | O `tsconfig` exclui arquivos de teste e a fixture da UI usa `as unknown`, então o tipo sozinho não discrimina
```

## Pendências

Nenhuma pendência.
