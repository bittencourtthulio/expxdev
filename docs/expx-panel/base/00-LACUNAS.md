# Lacunas — expx-panel

> Tudo que foi procurado nas fontes e não foi encontrado, ou foi encontrado em desacordo entre elas. Uma linha por lacuna, com onde se procurou. Toda lacuna vira pergunta obrigatória na F2.
>
> Fontes consultadas: `docs/contrato/CONTRATO-expx-schema-v1.md` (o contrato), `~/.claude/skills/sprintx/references/00-schema.md` (sprintx), `~/.claude/skills/runx/references/00-schema.md` (runx). As três lidas por inteiro em 2026-08-29.

## A. Divergências entre as fontes

O contrato declara-se "a fonte da verdade quando skill e parser divergirem" (contrato:5). Mas aqui **as duas skills divergem do contrato**, e são elas que escrevem os arquivos que o painel vai ler. O contrato não prevê esse caso. Nenhuma destas é decisão a tomar sozinho.

**L-01 — `tipo_ocorrencia` aceita `null`?** Contrato lista `null` entre os valores (contrato:31); runx lista os mesmos 7 valores sem `null` (runx:38) e afirma "nunca `null` na runx" (runx:101). Procurado em: tabela de enums das três fontes, kind `orquestrador`, kind `ocorrencia`.

**L-02 — o kind `decisoes` não existe no contrato.** A sprintx o define por inteiro (sprintx:186-212) e grava `00-DECISOES.md` em toda feature; o contrato não o menciona em lugar nenhum. Um parser fiel ao contrato rejeitaria em massa arquivos válidos. Procurado em: lista de kinds do contrato (contrato:54-268), seção de enums (falta também o enum `status` de decisão: `fechada`/`pendente`).

**L-04 — o campo `arquivos` da task tem duas formas.** Contrato: lista plana `[a.ts, b.ts]` (contrato:135). sprintx (157-159) e runx (218-220): mapa `{cria: [], altera: []}`. As duas skills concordam entre si e discordam do contrato. Procurado em: kind `tasks` das três fontes.

**L-08 — `teste_regressao` em trabalhos sprintx.** Contrato mostra a chave num exemplo sprintx com valor `null` (contrato:137). sprintx não lista o campo entre os da task e afirma "nenhum a mais, nenhum a menos" (sprintx:150-152). runx exige a chave sempre presente, com valor só na primeira task de bug (runx:239-240). A chave deve existir com `null` em arquivos sprintx, ou não existir? Afeta diretamente a violação 3 da tela de conformidade. Procurado em: kind `tasks` das três fontes.

**L-12 — formato do id de fase: `F-NN` ou `F-NN.M`?** Contrato usa `F-01`, `F-03` em todos os exemplos (contrato:74, 91, 100). sprintx e runx usam `F-01.1` e alertam explicitamente que o id de fase é `F-NN.M` (sprintx:51-53, runx:52-54). Afeta o cruzamento de ids entre `caminho_critico`, `fases:`, `fase:` e `tasks:`. Procurado em: kinds `orquestrador`, `sprint`, `fases`, `tasks` das três fontes.

**L-19 — `atualizado_em` nos kinds `ocorrencia` e `qa`.** O contrato não lista a chave nesses dois kinds (contrato:166-180, 204-220); a runx lista nos dois (runx:120, 281). A regra universal 6 proíbe omitir chave e a 9 manda reescrever `atualizado_em` a cada gravação — o que sugere omissão do contrato. Procurado em: kinds `ocorrencia` e `qa` do contrato e da runx.

## B. Regras que nenhuma fonte declara

**L-03 — combinação incoerente de `expx_tool` e `estagio`.** Um arquivo `expx_tool: sprintx` com `estagio: e3` é inválido? Procurado em: tabela de enums das três fontes, kind `orquestrador`.

**L-05 — a fronteira entre "fora do schema" e "violação do método".** O contrato só fala em rejeição (contrato:279); as skills só falam em violação (sprintx:230-231, runx:233-234). Um `tasks.md` com `teste_integracao` vazio é rejeitado (some do painel) ou aceito e listado como violação (aparece com o defeito à vista)? A regra 6 ("nunca omitir a chave") tem o mesmo problema: chave omitida é rejeição ou violação? **É a decisão mais estrutural da feature** — define o tipo de retorno do parser, o formato da API e o conteúdo de duas telas. Procurado em: regras universais, regra de descoberta, regras duras do kind `tasks`, nas três fontes.

**L-06 — mensagem e comportamento para `expx_schema` maior que 1.** O pedido exige rejeitar com mensagem clara pedindo atualização do painel; nenhuma fonte declara isso. Procurado em: regras universais e cabeçalho comum das três fontes.

**L-07 — o que invalida "o YAML é a primeira coisa do arquivo".** Linha em branco antes do `---`, ou BOM. (O `gray-matter` já remove BOM via `strip-bom-string`; a linha em branco continua em aberto.) Procurado em: regra universal 1 das três fontes.

**L-09 — o que é "a primeira task" de um bug.** A runx diz "primeira task da primeira fase" (runx:239). Por ordem de id, por posição na lista YAML, ou pela ordem das fases em `fases:`? As três podem divergir e um erro aqui gera violação falsa. Procurado em: kind `tasks` da runx, kind `fases`.

**L-10 — task com `fase` que não existe em `fases.md`.** Rejeição, violação, ou ignorar? Procurado em: kinds `tasks` e `fases` das três fontes.

**L-11 — `depende_de` apontando task inexistente, ou ciclo de dependências.** Nenhum tratamento declarado; a visualização de dependências trava num ciclo se implementada ingenuamente. Procurado em: kind `tasks` das três fontes.

**L-13 — pasta de trabalho sem `ORQUESTRADOR.md`.** Reportar ou ignorar em silêncio? O pedido a lista como fixture obrigatória. Procurado em: regra de descoberta (contrato:279).

**L-14 — `estagio` e `status` contraditórios.** `estagio: f3` com `status: concluido`. Os cards agrupam por `status`, o quadro por `estagio`; a incoerência põe o mesmo trabalho em dois lugares conflitantes. Procurado em: kind `orquestrador` das três fontes.

**L-15 — definição dos quatro cards de resumo.** "Em planejamento, em execução, bloqueados e concluídos" não mapeia um-para-um no enum de `status` (`nao_iniciado`, `em_andamento`, `bloqueado`, `concluido`). "Planejamento" vs. "execução" parece vir de `estagio` (f1–f5 planejam, f6 executa; e1–e2 planejam, e3 executa), não de `status`. Procurado em: enum de `status`, kind `orquestrador`, pedido da feature.

**L-16 — quem é autoritativo no vínculo task↔fase.** A lista `tasks` dentro da fase, ou o campo `fase` dentro da task? Muda o denominador da barra de progresso. Procurado em: kinds `fases` e `tasks` das três fontes.

**L-17 — sprint no disco ausente da lista `sprints` do orquestrador.** O painel enumera pastas `sprint-NN/` ou confia na lista? Procurado em: kinds `orquestrador` e `sprint`, seção "Onde o painel procura".

**L-18 — o valor de N** em "bloqueio aberto há mais de N dias". Constante ou configurável? Procurado em: kind `bloqueios` das três fontes; o N vem do pedido da feature, não das fontes.

**L-20 — ausência dos arquivos de estágio da runx.** `00-OCORRENCIA.md`, `01-CAUSA-RAIZ.md` e `QA.md` não existem antes do estágio que os produz. Ausência é estado normal, mas nenhuma fonte declara isso ao painel. Procurado em: kinds exclusivos da runx.

**L-21 — fonte autoritativa do histórico.** As `entradas` do `docs/relatorios/INDICE.md`, ou os arquivos de relatório nas pastas? Uma pasta sem entrada no índice fica invisível se o painel confiar só no índice. Procurado em: kinds `relatorios_indice`, `relatorio_tecnico`, `relatorio_uso`.

**L-22 — `modulo` singular no índice vs. `modulo_afetado` lista nos relatórios.** A busca "por módulo afetado" casa contra qual? Um relatório com dois módulos tem entrada de índice com qual deles? Procurado em: kinds de relatório e de índice.

**L-23 — arquivos que legitimamente não têm frontmatter.** As skills declaram que arquivos de base, `00-LACUNAS.md` e `00-AUDITORIA.md` não levam frontmatter (sprintx:245-252, runx:352-358). O painel não pode listá-los como "fora do schema" — seriam dezenas de falsos por projeto — mas nenhuma fonte dá ao painel a regra para distingui-los. Procurado em: regra de descoberta do contrato, seções "Arquivos SEM frontmatter" das duas skills.

## C. Decisões de projeto ainda em aberto

**L-24 — qual validador de esquema em runtime.** O pedido diz "um validador de esquema" sem nomear. Zod 4.5.4 é o candidato natural. Procurado em: bloco "RESPOSTAS ANTECIPADAS PARA A F2" do pedido.

**L-25 — qual versão de Node no `engines`.** "Node LTS" não é um número; `chokidar` 5 já exige `>= 20.19.0`. Procurado em: bloco "RESPOSTAS ANTECIPADAS", `npm view` das dependências.

**L-26 — a linha da violação é requisito ou esforço-melhor.** O pedido diz "quando possível". O `gray-matter` devolve YAML desserializado, sem posições; obter a linha de uma task dentro da lista exige parse posicional adicional. A resposta muda a escolha do parser YAML. Procurado em: pedido da feature, documentação do `gray-matter`.

---

**Total: 26 lacunas**, L-01 a L-26, sem numeração vazia. Seis divergências entre as fontes (grupo A), dezessete regras que nenhuma fonte declara (grupo B) e três decisões de projeto em aberto (grupo C).
