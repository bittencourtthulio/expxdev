# Lacunas — expx-watch-terminal

Uma linha por lacuna, com onde se procurou. Tudo aqui vira pergunta obrigatória na F2.

## A lacuna que a especificação mandou responder

**L-00 — Quanto do parser do painel web é reaproveitável sem refatoração?**
**RESPONDIDA, e a resposta é: a camada inteira, sem nenhuma refatoração.**
Procurei em `src/parser/**` e `src/servidor/**`, lendo cada arquivo da cadeia. `montarProjeto(raiz, agora)` (`src/parser/projeto/montar.ts:216`) e `lerEstado({raiz, diasBloqueio}, agora)` (`src/servidor/estado.ts:20`) são funções puras de sistema de arquivos: nenhum arquivo do parser importa `node:http`, `ws` ou `../servidor/`. A dependência é de mão única (`servidor/` → `parser/`). **Não há fase de extração a planejar** — a hipótese da especificação ("se a F1 mostrar que ele está acoplado ao servidor, extrair vira fase própria") não se confirmou. O único ajuste cosmético possível é que `lerEstado` mora em `src/servidor/` apesar de não depender do servidor; mover é opcional e não bloqueia nada. Detalhe em `parser-de-artefatos.md`.

## Lacunas abertas

**L-01 — Qual é "o trabalho atual" quando não se pode ler o `estado.json`?**
Procurei em `CONTRATO-expx-estado.md`, `CONTRATO-expx-schema-v1.md`, `CONVENCOES.md` e em `src/parser/projeto/montar.ts`. O `estado.json` responde com o campo `trabalho`; o plano em disco tem N trabalhos e **nenhum campo marca um como o atual**. Candidatos derivados: único com `status: em_andamento`; `atualizado_em` mais recente; `estagio` mais avançado. Nenhuma fonte do método afirma qual. Afeta diretamente a tolerância a falha "estado.json inválido cai para leitura direta do plano" e o `expx watch` sem argumento. **Bloqueante.**

**L-02 — `.expx/` é ignorada pelo observador, e é onde mora a fonte primária.**
`src/servidor/observador.ts:36` exclui `.expx` da regex por decisão D-06 (evitar realimentação com o índice do memox), e o painel observa `./docs` por padrão (`src/cli/argumentos.ts:6`), pasta da qual `.expx/` nem é descendente. Procurei alternativa em `src/servidor/` e não há. Três saídas possíveis: segundo observador só para `.expx/estado.json`; tornar o `ignored` parametrizável; ou o watch montar seu próprio observador. Nenhuma fonte decide. **Bloqueante.**

**L-03 — "Violações em modo aviso acumuladas na sessão" (rodapé): qual das duas fontes, e o que é "sessão"?**
Procurei em `CONTRATO-expx-eventos.md`, `src/parser/conformidade/regras.ts` e `src/doctor/verificadores.ts`. Há duas coisas homônimas: (a) `evento: regra_violada` no rastro, gravado por hook em modo aviso; (b) `Violacao` da conformidade (`regras.ts:17-28`), dez tipos de defeito do método **nos arquivos do plano**. A especificação diz "modo aviso", o que aponta para (a). Mas **"acumuladas na sessão" não tem definição em nenhum contrato**: o rastro é append-only e não marca fronteira de sessão. Alternativas: desde que o watch subiu; desde o primeiro evento do dia; total do trabalho. **Bloqueante.**

**L-04 — Debounce do watch: qual valor?**
`src/servidor/observador.ts:19` usa 300 ms, escolhido para o painel. A especificação exige debounce mas não fixa número, e nenhuma fonte do repositório afirma um valor para o caso do watch — que é uma tela sob observação humana contínua, não uma aba de navegador ao lado. Procurei em `CONTRATO-expx-estado.md` (que fixa 300 ms para a barra de status, contexto diferente) e em `observador.ts`.

**L-05 — Quantas linhas do rastro mostrar, e como lê-las sem reler 5 MB?**
Procurei em `CONTRATO-expx-eventos.md` e `src/parser/esquema/evento.ts`. O contrato fixa a rotação em 5 MB mas **não fixa quantas linhas o leitor mantém**. `validarRastro(conteudo)` (`evento.ts:121`) recebe o arquivo inteiro como string e, pior, **não devolve as linhas parseadas** — `ResultadoRastro` só tem `linhas: number`, `defeitos[]` e `desconhecidas[]`. Não existe leitor que devolva `LinhaEvento[]`, nem estratégia de tail. Quantidade a exibir e forma de ler são as duas partes desta lacuna.

**L-06 — `NO_COLOR` é honrado?**
Procurei em `package.json`, `src/**` (busca por `NO_COLOR`) e na especificação da feature. Nenhuma ocorrência em lugar nenhum. A especificação só manda desligar cor quando a saída não for terminal. `NO_COLOR` é convenção amplamente adotada no ecossistema, mas **nenhuma fonte deste repositório a afirma** — então, por regra 9 da F1, fica registrado como lacuna em vez de assumido.

**L-07 — Como testar redesenho sem piscar e restauração do terminal?**
Procurei em `vitest.config.ts`, `src/teste/**` e em toda a suíte por `isTTY|setRawMode|.columns`. Nenhum teste do projeto exercita saída de terminal, largura ou modo bruto. Duas definições de pronto ("ver as tasks mudando ao vivo", "sair com a tecla de interrupção e o terminal volta ao normal") estão escritas como verificação manual. Sem convenção no projeto, o critério de aceite dessas tasks corre o risco de virar adjetivo — o que a regra 5 do método proíbe.

**L-08 — Política de versão do `expx-estado`.**
`CONTRATO-expx-estado.md` fixa `"expx_estado": 1` mas **não diz o que fazer com um valor diferente de 1**, ao contrário do `expx-schema`, que tem `VERSAO_SUPORTADA` e trata versão futura como rejeição (`src/parser/esquema/cabecalho.ts`, fixture `projeto-ruim/docs/schema-futuro/`). Procurei nos dois contratos e no `cabecalho.ts`.

**L-09 — `estado.json` e o plano podem divergir; qual ganha?**
Procurei em `CONTRATO-expx-estado.md` (que só diz "somente exibição" e "derivado e descartável") e em `CONTRATO-expx-schema-v1.md`. Cenário concreto: `estado.json` diz `tasks_concluidas: 4` e o `tasks.md` tem 5 tasks `concluida`. A especificação do watch declara `estado.json` como fonte primária e o plano como fonte da árvore — as duas contagens aparecem na mesma tela, e nada define a precedência.

**L-10 — Granularidade do "há quanto tempo" dos bloqueios.**
`Bloqueio.aberto_em` é `DataIso` (`AAAA-MM-DD`, `src/parser/esquema/kinds.ts:120`), sem hora. Um bloqueio aberto há 20 minutos exibe "há 0 dias". O rastro tem `ts` com hora no evento `task_bloqueada` e refinaria isso, ao custo de cruzar duas fontes. Procurei em `kinds.ts`, `CONTRATO-expx-schema-v1.md` e `CONTRATO-expx-eventos.md`; nenhuma fonte diz qual precisão a exibição deve ter.

**L-11 — Normalização Unicode dos arquivos.**
R13 (`CONVENCOES.md`) garante acento em `titulo`, `objetivo` e `detalhe`. Em NFC, `ç` é um code point e uma coluna; em NFD, dois code points e uma coluna. O truncamento em 80 colunas erra no segundo caso. Procurei em `CONVENCOES.md` (R14 fixa UTF-8 sem BOM, mas **não fixa a forma de normalização**) e no parser. Nenhuma fonte afirma.

**L-12 — `expx watch --todos`: o que é "trabalho aberto"?**
A especificação diz "lista todos os trabalhos abertos, um por linha". Procurei o termo em `CONTRATO-expx-schema-v1.md` e `enums.ts`: `status` de trabalho tem quatro valores (`nao_iniciado`, `em_andamento`, `bloqueado`, `concluido`). "Aberto" não é um deles. Se aberto = "não concluído", inclui `nao_iniciado`, que pode ser um trabalho apenas planejado e nunca começado. Nenhuma fonte define.

**L-13 — Como o watch localiza a raiz do projeto.**
O painel recebe `--dir` com padrão `./docs` (`src/cli/argumentos.ts:6`) e resolve com `resolve()` (`src/cli/principal.ts:41`), sem subir diretórios em busca de `.git`. Mas o watch precisa de **duas** raízes relacionadas (`docs/` e `.expx/`), que só fazem sentido juntas a partir da raiz do repositório. Procurei em `src/nucleo/caminhos.ts` e em `src/cli/projeto.ts` — `NÃO DOCUMENTADO` se algum deles já resolve raiz de repositório de forma reaproveitável pelo watch.

**L-14 — Cinco das dez fixtures pedidas não existem.**
Verificado por busca no disco (detalhe em `fixtures-e-testes.md`): faltam ocorrência runx em modo legado com raio alto, trabalho concluído, nenhum trabalho aberto, `estado.json` inválido e rastro ausente com fonte positiva ao lado. **Nenhuma fixture do repositório tem `.expx/estado.json` ou `docs/eventos/*.jsonl`** — as duas fontes primárias do watch não têm fixture alguma. Não é ambiguidade de requisito, é trabalho a planejar; fica registrado para a F3 dimensionar a sprint de fundação (regra 13 do método).
