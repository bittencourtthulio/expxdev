# Conformidade com o método × rejeição de schema

> Este arquivo existe porque as duas coisas são telas diferentes no painel e as fontes não as separam com clareza. É a área com maior risco de violação falsa — o que a definição de pronto proíbe explicitamente.

## Contrato de entrada

O painel produz **duas listas distintas** a partir dos mesmos arquivos:

1. **Fora do schema** — o arquivo não pôde ser lido como estado válido. Regra do contrato (`docs/contrato/CONTRATO-expx-schema-v1.md:279`): "Arquivo sem frontmatter válido é ignorado e reportado como 'fora do schema', nunca causa crash do parser."
2. **Violações do método** — o arquivo é válido e foi lido, mas o conteúdo desobedece uma regra do método. Evidência textual de que esta classe existe separada, nas duas skills (`sprintx:230-231`, `runx:233-234`): "`teste_integracao` e `teste_funcional` são strings OBRIGATÓRIAS e NÃO VAZIAS. **O painel usa a ausência delas como violação do método.**"

O contrato nunca usa a palavra "violação"; as skills nunca usam "fora do schema". Cada fonte descreve uma das duas listas. A fronteira entre elas é a lacuna L-05.

### As sete violações pedidas para a v1

| # | Violação | Fonte da regra | Detecção no frontmatter | Escopo |
|---|---|---|---|---|
| 1 | task sem `teste_integracao` ou sem `teste_funcional` preenchido | `sprintx:230`, `runx:233` | ausente, `null`, ou string vazia/só espaços | todas as tasks |
| 2 | task `concluida` com `suite` diferente de `verde` | regra 4 do `SKILL.md` da sprintx | `status == concluida && suite != verde` | todas as tasks |
| 3 | bug cuja primeira task não tem `teste_regressao` | `runx:239-240` | ver L-08 e L-09 | **só** `expx_tool == runx && tipo_ocorrencia == bug` |
| 4 | task `paralelizavel: true` com `depende_de` não vazio | regra 6 do `SKILL.md` | `paralelizavel == true && depende_de.length > 0` | todas as tasks |
| 5 | fase ou sprint sem `criterio_saida` | regra 5 do `SKILL.md` | ausente, `null` ou vazio | kinds `sprint` e `fases` |
| 6 | bloqueio aberto há mais de N dias | pedido da feature | `resolvido_em == null && hoje - aberto_em > N` | kind `bloqueios`; N não declarado (L-18) |
| 7 | arquivo de estado sem frontmatter válido | `contrato:279` | — | ver nota abaixo |

**A violação 7 é a mesma coisa que a lista "fora do schema".** O pedido a lista como violação de conformidade, e o contrato a descreve como rejeição. Se as duas telas mostram o mesmo item, ele aparece duas vezes; se nenhuma mostra, some. L-05.

## Contrato de saída

Cada violação aponta o arquivo e a linha quando possível. Cada rejeição aponta o arquivo e o motivo.

Para dar a **linha** de uma violação dentro de uma lista YAML (a task `T-01.07` dentro de `tasks:`), não basta o objeto que o `gray-matter` devolve — ele entrega o YAML já desserializado, sem posições. `NÃO DOCUMENTADO` como obter a linha; exigirá parse posicional adicional ou busca textual. É o que justifica o "quando possível" do pedido.

## Limites e cotas

`NÃO DOCUMENTADO`: número máximo de violações exibidas, se há paginação, se há severidade por violação.

## Erros conhecidos e tratamento

Casos em que uma implementação ingênua gera **violação falsa** — o que a definição de pronto proíbe:

| Caso | Por que gera falso positivo |
|---|---|
| Aplicar a violação 3 a trabalhos sprintx | `teste_regressao` não existe no contrato de task da sprintx (L-08) |
| Aplicar a violação 3 a runx com `tipo_ocorrencia` != `bug` | a runx exige o campo só quando é bug (`runx:239`) |
| Reportar arquivos de base, `00-LACUNAS.md`, `00-AUDITORIA.md` como "sem frontmatter" | esses arquivos legitimamente não têm frontmatter (L-23) |
| Rejeitar `00-DECISOES.md` como kind desconhecido | o kind existe na sprintx mas não no contrato (L-02) |
| Rejeitar `INDICE.md` de relatórios por falta de `trabalho_id` | esse kind não tem `trabalho_id` por definição (`runx:344`) |
| Rejeitar `arquivos` em forma de mapa (ou de lista) | as duas formas existem nas fontes (L-04) |
| Rejeitar id de fase `F-01` (ou `F-01.1`) | contrato e skills discordam do formato (L-12) |

Sete caminhos conhecidos para violar a definição de pronto. Todos nascem de divergência entre as fontes, não de ambiguidade do pedido.

## Riscos para a nossa implementação

- **A fronteira rejeição × violação (L-05) é a decisão mais estrutural desta feature.** Ela define o tipo de retorno do parser, o formato da API e duas telas. Tomá-la errado obriga a refazer a camada inteira.
- **A conta de "N dias" precisa de "hoje"**, o que torna a saída do parser dependente do relógio. Uma função pura que recebe a data como parâmetro é testável; uma que chama `Date.now()` internamente produz teste que quebra sozinho com o tempo. Vale para as fixtures: uma fixture com `aberto_em` fixo muda de status conforme os dias passam.
- **"quando possível" para a linha** é a única cláusula elástica do pedido. Convém decidir cedo se a linha é requisito ou esforço-melhor, porque muda a escolha do parser YAML.

## Fonte

- `docs/contrato/CONTRATO-expx-schema-v1.md:279` — acessado em 2026-08-29
- `~/.claude/skills/sprintx/references/00-schema.md:229-236` e `SKILL.md` (regras invioláveis 4, 5, 6) — acessado em 2026-08-29
- `~/.claude/skills/runx/references/00-schema.md:232-245` — acessado em 2026-08-29
- Pedido da feature (bloco "Conformidade com o método"), transcrito nesta sessão — 2026-08-29
