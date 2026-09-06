# Contrato expx-schema v1 — frontmatter dos arquivos de estado

Leitura OBRIGATÓRIA em qualquer estágio que grave arquivo de estado (E1, E2, E3, E4, E5).

Um painel de operação lê os arquivos gerados por esta skill para mostrar o andamento
das ocorrências. Prosa não é contrato: a mesma informação pode ser escrita de dez formas
corretas para um humano e todas quebram um parser. O frontmatter resolve isso sem
prejudicar a leitura humana — a máquina lê o YAML, a pessoa lê a prosa abaixo dele.

O painel apenas LÊ. Esta skill continua sendo a única a escrever.

Este contrato é compartilhado com a skill irmã `sprintx`. Os kinds comuns —
`orquestrador`, `sprint`, `fases`, `tasks`, `bloqueios`, `base_indice` — são idênticos
campo por campo nas duas skills. Divergência quebra o painel.

Os campos de indexação `modulo_afetado`, `arquivos_alterados` e `palavras_chave` existem nas
duas skills com **exatamente estes nomes** e a mesma semântica, ainda que em kinds diferentes
(na `sprintx` vivem no `orquestrador`; na runx, no `ocorrencia`, no `causa_raiz` e nos
relatórios). Quem indexa os artefatos das duas lê o mesmo nome de campo nos dois lados:
renomear de um lado só quebra o índice, mesmo que o painel continue funcionando.

## Regras universais

Valem para todo arquivo que leva frontmatter:

1. O bloco YAML é a primeira coisa do arquivo, delimitado por `---` antes e depois.
2. Toda chave em `snake_case`, minúscula, sem acento.
3. Todo valor de enum em minúscula e sem acento: `concluida`, nunca `Concluída`.
4. Datas em ISO: `AAAA-MM-DD`. Obtenha a data com `date +%Y-%m-%d` do sistema, nunca de memória.
5. Booleanos: `true` / `false` (sem aspas).
6. Lista vazia é `[]`. Valor ausente é `null`. **NUNCA omita a chave** — o painel
   diferencia "não se aplica" de "esqueceram de escrever".
7. O frontmatter é a única fonte para o painel. A prosa abaixo dele é para humano e
   continua exatamente como esta skill já a produz.
8. Campos de texto no YAML são de UMA linha. Nada de duplicar prosa longa no YAML.
9. `atualizado_em` é reescrito a cada gravação do arquivo.

## Enums

| Enum | Valores |
|---|---|
| `expx_tool` | `sprintx` \| `runx` |
| `tipo_trabalho` | `feature` \| `ocorrencia` |
| `tipo_ocorrencia` | `bug` \| `melhoria-ui` \| `melhoria-ux` \| `novo-relatorio` \| `regra-de-calculo` \| `campo-novo` \| `outro` |
| `estagio` | `e1` `e2` `e3` `e4` `e5` |
| `status` (trabalho, sprint, fase) | `nao_iniciado` \| `em_andamento` \| `bloqueado` \| `concluido` |
| `status` (task) | `pendente` \| `em_andamento` \| `concluida` \| `bloqueada` |
| `suite` | `verde` \| `vermelha` \| `parcial` \| `nao_executada` |
| `veredito` | `aprovado` \| `reprovado` |
| `severidade` | `alta` \| `media` \| `baixa` |
| `modo` | `causa_raiz` \| `analise_impacto` |
| `evidencia` | `teste_falho` \| `log` \| `codigo` \| `null` |

O valor `parcial` de `suite` significa: rodou o subconjunto de testes afetado por aquela
task e ele passou, mas a suíte inteira ainda não foi executada para ela. É o estado normal
de uma task concluída no E3 — a suíte inteira é exigida uma vez, no E4, antes do veredito.
`verde` continua significando suíte inteira executada e sem falha.

Atenção a duas distinções que o painel trata como coisas diferentes:

- `estagio` (`e1`..`e5`) é o estágio da MÁQUINA DE ESTADOS do método — em minúscula, no
  frontmatter. Não confunda com o id de uma FASE do plano, que é `F-NN.M` (ex.: `F-01.1`)
  e vive nos campos `fases:`, `fase:` e `caminho_critico:`. São namespaces distintos.
- `status` de task usa o vocabulário feminino (`concluida`, `bloqueada`); `status` de
  trabalho, sprint e fase usa o masculino (`concluido`, `bloqueado`). Não troque um pelo outro.

`tipo_ocorrencia` no YAML usa exatamente os mesmos valores da tabela de tipos do
`SKILL.md`, com hífen: `melhoria-ui`, `regra-de-calculo`, `campo-novo`.

## Cabeçalho comum

Todo arquivo com frontmatter começa com estas quatro chaves, nesta ordem:

```yaml
expx_schema: 1
expx_tool: runx
kind: <o kind do arquivo>
trabalho_id: <ID da ocorrência>
```

`trabalho_id` é sempre o `<OC-ID>` da ocorrência (ex.: `OC-2026-0142`) — o mesmo
identificador registrado em `00-OCORRENCIA.md` e usado no nome da pasta
`docs/manutencao/<OC-ID>-<slug>/`.

## Os kinds que a runx produz

### `ORQUESTRADOR.md` → `kind: orquestrador`

```yaml
---
expx_schema: 1
expx_tool: runx
kind: orquestrador
trabalho_id: OC-2026-0142
titulo: Calculo de frete divergente acima de 50kg
tipo_trabalho: ocorrencia
tipo_ocorrencia: bug
estagio: e3
status: em_andamento
criado_em: 2026-08-28
atualizado_em: 2026-08-29
concluido_em: null
sprints: [sprint-01]
caminho_critico: [F-01.1]
---
```

- `tipo_trabalho` é sempre `ocorrencia` na runx.
- `tipo_ocorrencia` é o tipo classificado no E1; nunca `null` na runx (a chave existe no
  contrato compartilhado porque a sprintx a preenche com `null`).
- `caminho_critico` lista ids de fase (`F-NN.M`) e/ou de task (`T-NN.MM`), na ordem da
  cadeia, exatamente como a seção 3 do ORQUESTRADOR os declara.
- `concluido_em` permanece `null` até a ocorrência inteira estar encerrada (E5).
- `estagio` é atualizado a cada transição de estágio da máquina de estados.

### `00-OCORRENCIA.md` → `kind: ocorrencia`

```yaml
---
expx_schema: 1
expx_tool: runx
kind: ocorrencia
trabalho_id: OC-2026-0142
titulo: Calculo de frete divergente acima de 50kg
tipo_ocorrencia: bug
recebido_em: 2026-08-28
origem: ticket-4471
tem_reproducao: true
modulo_afetado: [frete, checkout]
atualizado_em: 2026-08-29
---
```

- `origem` identifica de onde veio o chamado (ticket, canal, arquivo); `null` se não houver.
- `tem_reproducao` reflete o portão do E1: `false` quando não há passos de reprodução.
- `modulo_afetado` é a lista de módulos em linguagem do sistema; `[]` se ainda não determinado.

### `01-CAUSA-RAIZ.md` → `kind: causa_raiz`

```yaml
---
expx_schema: 1
expx_tool: runx
kind: causa_raiz
trabalho_id: OC-2026-0142
modo: causa_raiz
comprovada: true
evidencia: teste_falho
arquivos_impactados: [src/frete/calculo.ts]
palavras_chave: [frete, arredondamento, faixa-de-peso, checkout]
regressao_de: OC-2026-0087
evidencia_regressao: A faixa acima de 50kg foi introduzida em src/frete/calculo.ts pela OC-2026-0087
decisoes:
  - id: D-01
    decisao: Corrigir arredondamento na faixa de peso
    alternativa_descartada: Reescrever a tabela de faixas
    motivo: Escopo menor e risco menor de regressao
atualizado_em: 2026-08-29
---
```

- `modo` é `causa_raiz` quando `tipo_ocorrencia: bug`; `analise_impacto` nos demais tipos.
- Quando `modo: analise_impacto`, **`comprovada` e `evidencia` vão como `null`** — as
  chaves continuam presentes. Não existe causa a comprovar quando não há defeito.
- Quando `modo: causa_raiz` e a prova não apareceu (`STATUS: NÃO COMPROVADO` na prosa),
  `comprovada: false` e `evidencia: null`.
- `arquivos_impactados` é a lista que TRAVA o escopo — a mesma da prosa.

Os três campos de indexação deste kind — `palavras_chave`, `regressao_de` e
`evidencia_regressao` — seguem a regra universal 6: **nunca omita a chave**; lista vazia é
`[]` e valor ausente é `null`, jamais chave faltando.

- `palavras_chave` traz até 8 termos que descrevem a ocorrência, em minúscula e sem acento
  (`arredondamento`, não `Arredondamento`). Mais que 8 deixa de discriminar: uma lista que
  casa com tudo não encontra nada. Mesma regra e mesmo nome de campo da `sprintx`.
- `regressao_de` é o `trabalho_id` do trabalho anterior que introduziu ou alterou o código
  que causa este problema — `OC-...` de uma ocorrência da runx, ou o slug de uma feature da
  sprintx. É `null` por padrão.
- `evidencia_regressao` é UMA linha dizendo qual é o vínculo: qual trecho, em qual arquivo,
  introduzido ou alterado por aquele trabalho. É `null` sempre que `regressao_de` for `null`,
  e não vazio sempre que `regressao_de` estiver preenchido. Os dois andam juntos.

**Coincidência de arquivo NÃO é regressão.** Dois trabalhos que tocaram o mesmo arquivo sem
vínculo causal comprovado deixam `regressao_de` como `null`. `regressao_de` só é preenchido
quando houver evidência real de que o código causador **deste** problema foi introduzido ou
alterado por **aquele** trabalho. Suspeita sem essa evidência vai para a prosa do arquivo,
nunca para o campo: um índice que chama coincidência de regressão para de apontar o arquivo
que sempre volta, que é justamente o sinal que ele existe para dar.

Em `modo: analise_impacto` os três campos continuam existindo: `palavras_chave` é preenchido
normalmente, e `regressao_de`/`evidencia_regressao` ficam `null` a menos que a verificação de
histórico do E1.b encontre o mesmo vínculo causal.

### `sprint-NN/sprint.md` → `kind: sprint`

```yaml
---
expx_schema: 1
expx_tool: runx
kind: sprint
trabalho_id: OC-2026-0142
sprint_id: sprint-01
titulo: Correcao do arredondamento
status: em_andamento
criterio_saida: Teste de regressao verde e suite inteira verde
fases: [F-01.1]
riscos: [Faixa de peso usada tambem no relatorio de logistica]
atualizado_em: 2026-08-29
---
```

`riscos` é uma lista de strings de uma linha; sem riscos registrados, `[]`.

### `sprint-NN/fases.md` → `kind: fases`

```yaml
---
expx_schema: 1
expx_tool: runx
kind: fases
trabalho_id: OC-2026-0142
sprint_id: sprint-01
atualizado_em: 2026-08-29
fases:
  - id: F-01.1
    titulo: Correcao e cobertura
    status: em_andamento
    criterio_saida: Regressao passa e nenhum chamador quebra
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02]
---
```

`paralela_com` lista os ids das fases que rodam em paralelo com esta; "nenhuma" na prosa
corresponde a `[]` no YAML, com `paralelizavel: false`.

### `sprint-NN/tasks.md` → `kind: tasks`

O arquivo mais importante. Cada task do plano vira um item da lista `tasks:`, com
EXATAMENTE os mesmos campos do Contrato da Task do `SKILL.md` — nenhum a mais, nenhum a
menos — acrescidos apenas dos dois campos de execução (`concluida_em`, `suite`) e do
vínculo com a fase (`fase`).

```yaml
---
expx_schema: 1
expx_tool: runx
kind: tasks
trabalho_id: OC-2026-0142
sprint_id: sprint-01
atualizado_em: 2026-08-29
tasks:
  - id: T-01.01
    titulo: Teste que reproduz a divergencia acima de 50kg
    fase: F-01.1
    status: concluida
    objetivo: Fixar o comportamento esperado antes de corrigir
    arquivos:
      cria: [src/frete/calculo.test.ts]
      altera: []
    teste_regressao: Pedido de 51kg deve retornar 42.90 e hoje retorna 41.00
    teste_integracao: Checkout completo com 51kg fecha com o frete correto
    teste_funcional: calcularFrete(51) retorna 42.90
    criterio_aceite: O teste falha antes do fix e passa depois
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
---
```

Regras duras deste kind:

- `teste_integracao` e `teste_funcional` são strings OBRIGATÓRIAS e NÃO VAZIAS. O painel
  usa a ausência delas como violação do método. A skill jamais gera uma task sem elas
  preenchidas — inclusive no E2, quando a task ainda está `pendente`.
- `teste_regressao` é OBRIGATÓRIO na primeira task da primeira fase quando
  `tipo_ocorrencia: bug`, e `null` em todas as demais tasks. A chave está sempre presente.
- `arquivos` mantém a forma do Contrato da Task do `SKILL.md`: um mapa com `cria` e
  `altera`, cada um uma lista de caminhos relativos à raiz do repositório (`[]` quando vazio).
- `concluida_em` é `null` enquanto a task não estiver `concluida`.
- `suite` é `nao_executada` até a suíte rodar para aquela task; depois `verde` ou `vermelha`.
- Os campos do YAML são a mesma verdade da prosa do bloco correspondente. Os dois andam juntos.

### `BLOQUEIOS.md` → `kind: bloqueios`

```yaml
---
expx_schema: 1
expx_tool: runx
kind: bloqueios
trabalho_id: OC-2026-0142
atualizado_em: 2026-08-29
bloqueios:
  - id: B-01
    task: T-01.03
    aberto_em: 2026-08-29
    resolvido_em: null
    descricao: Falta acesso ao log de producao do periodo
---
```

Sem bloqueios registrados, `bloqueios: []`.

### `QA.md` → `kind: qa`

```yaml
---
expx_schema: 1
expx_tool: runx
kind: qa
trabalho_id: OC-2026-0142
veredito: aprovado
executado_em: 2026-08-29
achados:
  - severidade: baixa
    arquivo: src/frete/calculo.ts
    problema: Comentario desatualizado sobre a faixa antiga
    correcao_sugerida: Atualizar comentario
atualizado_em: 2026-08-29
---
```

- `veredito` espelha a linha `VEREDITO:` da prosa: `aprovado` \| `reprovado`. Existe
  achado de `severidade: alta` → `veredito: reprovado`, sem exceção.
- Sem achados, `achados: []`.

### `sprint-NN/tasks.md` no formato condensado → `kind: plano`

**Exclusivo da runx.** A `sprintx` não produz este kind, e por isso ele pode evoluir sem
afetar a skill irmã — ao contrário de `sprint`, `fases` e `tasks`, que são compartilhados.

Quando o plano tem **uma sprint e uma fase**, o E2 grava um arquivo único em vez de três.
O arquivo continua se chamando `sprint-NN/tasks.md`: é o caminho que os hooks de método
procuram, e mudá-lo os desligaria em silêncio (todos falham abertos).

O bloco YAML é **um só**. Os leitores de frontmatter param no primeiro `---` de fechamento;
um segundo bloco no mesmo arquivo seria invisível para eles.

```yaml
---
expx_schema: 1
expx_tool: runx
kind: plano
trabalho_id: OC-2026-0142
sprint_id: sprint-01
atualizado_em: 2026-08-29
sprint:
  titulo: Correcao do calculo de frete
  status: em_andamento
  criterio_saida: A suite roda com npm test e termina com 0 failed
  riscos: [Tabela de faixas sem indice pode tornar a query lenta]
  fora_de_escopo: [Refatorar o modulo de frete inteiro]
fases:
  - id: F-01.1
    titulo: Corrigir a comparacao de faixa
    status: em_andamento
    criterio_saida: Pedido de 60kg retorna frete 87,40
    paralelizavel: false
    paralela_com: []
    tasks: [T-01.01, T-01.02]
tasks:
  - id: T-01.01
    titulo: Teste que reproduz o frete divergente
    fase: F-01.1
    status: concluida
    objetivo: Fixar o comportamento errado antes de corrigir
    arquivos:
      cria: [src/frete/calculo.test.ts]
      altera: []
    teste_regressao: Pedido de 60kg hoje retorna 92,10 e o teste espera 87,40
    teste_integracao: Roda o calculo contra a tabela de faixas real e compara o total
    teste_funcional: Dado peso 60kg, retorna 87,40
    criterio_aceite: O teste falha antes do fix e passa depois
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: parcial
---
```

Regras duras deste kind:

- **`tasks` é a última das três chaves de conteúdo e tem exatamente o mesmo formato do
  `kind: tasks`** — mesmos campos, mesmos enums, incluindo `teste_regressao` na primeira
  task da primeira fase. Um leitor que só quer as tasks lê `tasks:` e ignora o resto.
- `sprint` e `fases` carregam os mesmos campos dos kinds `sprint` e `fases`, menos as
  chaves de cabeçalho (`expx_schema`, `expx_tool`, `trabalho_id`, `sprint_id`,
  `atualizado_em`), que já estão no topo e não se repetem — é exatamente essa repetição
  que o formato condensado elimina.
- `sprint.fora_de_escopo` é uma lista de strings de uma linha (`[]` quando vazia). Ela
  existe porque o escopo travado é a regra 8 e precisa continuar declarado.
- **Quando usar:** uma sprint e uma fase. Com mais de uma sprint, ou mais de uma fase, o
  E2 grava os três arquivos separados (`sprint.md`, `fases.md`, `tasks.md`) como sempre.
- O formato de três arquivos **continua válido e não é descontinuado**. Planos já escritos
  nele permanecem como estão: a regra 12 proíbe apagar ou mover o que já existe.

### `base/00-INDICE.md` → `kind: base_indice`

```yaml
---
expx_schema: 1
expx_tool: runx
kind: base_indice
trabalho_id: OC-2026-0142
atualizado_em: 2026-08-29
areas:
  - arquivo: calculo-frete.md
    titulo: Calculo de frete
    lacunas: 2
---
```

- `arquivo` é o nome do arquivo dentro de `base/`, sem diretório.
- `lacunas` é o número de lacunas daquela área registradas em `base/00-LACUNAS.md` (`0` se nenhuma).

### `docs/relatorios/<pasta>/tecnico.md` → `kind: relatorio_tecnico`

```yaml
---
expx_schema: 1
expx_tool: runx
kind: relatorio_tecnico
trabalho_id: OC-2026-0142
titulo: Calculo de frete divergente acima de 50kg
tipo_ocorrencia: bug
fechado_em: 2026-08-29
modulo_afetado: [frete]
arquivos_alterados: [src/frete/calculo.ts]
palavras_chave: [frete, arredondamento, faixa-de-peso, checkout]
regressao_de: OC-2026-0087
testes_adicionados: 3
---
```

`testes_adicionados` é a contagem de testes criados na ocorrência, incluindo o de regressão.

`palavras_chave` e `regressao_de` são **copiados de `01-CAUSA-RAIZ.md` no fechamento**, sem
recalcular e sem reinterpretar: o E5 transcreve o que o E1.b apurou. `regressao_de` é `null`
aqui sempre que for `null` lá. Se o E1.b não os gravou (pasta anterior ao contrato, regra de
migração), copie `palavras_chave: []` e `regressao_de: null` — nunca invente um vínculo no
fechamento, quando ninguém mais vai revisar a evidência.

Junto com `modulo_afetado` e `arquivos_alterados`, que este kind já trazia, são estes campos
que tornam o histórico **indexável por arquivo, por módulo e por vínculo de regressão** — a
pergunta "quem já mexeu neste arquivo e por quê" só tem resposta se alguém tiver registrado a
resposta. `evidencia_regressao` NÃO é copiado: a linha de evidência vive em `01-CAUSA-RAIZ.md`
e no corpo do relatório técnico, não no YAML do fechamento.

Os nomes `modulo_afetado`, `arquivos_alterados` e `palavras_chave` são os mesmos da `sprintx`,
com a mesma semântica — minúscula, sem acento, caminhos relativos, no máximo 8 palavras-chave.
Divergência de nome entre as duas skills quebra o índice; ao mudar um deles, mude nas duas.

### `docs/relatorios/<pasta>/uso.md` → `kind: relatorio_uso`

```yaml
---
expx_schema: 1
expx_tool: runx
kind: relatorio_uso
trabalho_id: OC-2026-0142
titulo: Calculo de frete divergente acima de 50kg
tipo_ocorrencia: bug
fechado_em: 2026-08-29
modulo_afetado: [frete]
---
```

Mesmo cabeçalho do `relatorio_tecnico`, **SEM `arquivos_alterados` e SEM
`testes_adicionados`**. O arquivo destinado ao cliente não menciona código nem dentro do
YAML: nenhum nome de arquivo, de função, de tabela ou de coluna entra neste frontmatter.
`titulo` e `modulo_afetado` vão em linguagem de cliente, como na prosa.

### `docs/relatorios/INDICE.md` → `kind: relatorios_indice`

```yaml
---
expx_schema: 1
expx_tool: runx
kind: relatorios_indice
atualizado_em: 2026-08-29
entradas:
  - data: 2026-08-29
    oc_id: OC-2026-0142
    tipo: bug
    modulo: frete
    resumo: Arredondamento errado acima de 50kg
    pasta: 2026-08-29-OC-2026-0142-calculo-frete-divergente
---
```

- Este kind NÃO leva `trabalho_id`: o índice é do sistema inteiro, não de uma ocorrência.
- `entradas` é **append-only, mais recente no topo**, espelhando exatamente a tabela em
  prosa que a skill já mantém abaixo do frontmatter. Toda ocorrência fechada entra nas
  duas: no YAML e na tabela. Nunca reordene nem apague entradas existentes.

### Arquivos SEM frontmatter

Não recebem frontmatter, porque o painel não os lê individualmente:

- os arquivos de área da base (um por área impactada, de `TEMPLATE-base-area.md`);
- `base/00-LACUNAS.md`.

Não acrescente frontmatter a eles: um `kind` fora deste contrato é uma violação, não uma extensão.

## Regra de migração — pastas que já existem

Ao abrir uma pasta de ocorrência que já existe e cujos arquivos NÃO têm frontmatter:

1. A skill acrescenta o frontmatter na PRÓXIMA VEZ que gravar aquele arquivo, inferindo
   os valores a partir da prosa existente.
2. A skill NUNCA reescreve em massa nem sai migrando pastas ou arquivos que não vai tocar.
3. Se um valor não puder ser inferido da prosa com segurança, use `null` (ou `[]` para
   lista) e siga — nunca invente, nunca pergunte, nunca pare. A chave sempre existe.
4. Migrar o frontmatter NÃO autoriza reescrever a prosa: a prosa existente é preservada
   como está.
5. A regra 12 do `SKILL.md` continua valendo integralmente: nada em `docs/manutencao/` é
   apagado ou movido, nem durante uma migração.

## Verificação antes de gravar

Antes de dar por gravado qualquer arquivo de estado:

- [ ] O bloco `---` é a primeira coisa do arquivo e está fechado.
- [ ] O cabeçalho comum (`expx_schema`, `expx_tool`, `kind`, `trabalho_id`) está presente.
- [ ] Nenhuma chave do kind foi omitida — ausente é `null`/`[]`, nunca chave faltando.
- [ ] Nenhum acento em chave ou em valor de enum.
- [ ] Datas em `AAAA-MM-DD`; `atualizado_em` reescrito nesta gravação.
- [ ] Em `kind: tasks`, toda task tem `teste_integracao` e `teste_funcional` não vazios.
- [ ] Em `kind: causa_raiz` e `kind: relatorio_tecnico`, `palavras_chave` tem no máximo 8
      termos, em minúscula e sem acento (`[]` quando nenhum).
- [ ] `regressao_de` só está preenchido com evidência de vínculo causal; coincidência de
      arquivo é `null`. Preenchido → `evidencia_regressao` não vazio; `null` → `null`.
- [ ] Em `kind: relatorio_uso`, nenhum nome de arquivo, função ou tabela no YAML.
- [ ] Nenhum caminho absoluto em nenhum valor.
