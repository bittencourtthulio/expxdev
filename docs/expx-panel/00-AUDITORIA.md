# Auditoria — expx-panel

Data: 2026-08-29 (reauditoria; a primeira rodada deu VEREDITO: NÃO)

## Histórico

**Primeira rodada** — 1 achado ALTA, 4 MÉDIA, 2 BAIXA. Veredito NÃO. O plano voltou para a F3, foi regerado endereçando os achados, a F4 foi refeita (o caminho crítico mudou) e esta é a reauditoria.

Achados endereçados na volta à F3:

| # | severidade original | o que era | como foi resolvido |
|---|---|---|---|
| 1 | ALTA | `sprint-01/sprint.md` com a lista `riscos:` fragmentada — vírgulas dentro do texto viraram separador de lista YAML, quebrando 2 riscos em 4 itens, dois deles sem sentido isolados | Regravado com lista em bloco (`- item`); os 2 riscos voltaram a ser 2 itens íntegros |
| 2 | MÉDIA | `teste_integracao` de T-01.01 passava com implementação errada (build vazio também sai com código 0) | Trocado por "compila um arquivo com erro de tipo deliberado e espera o build falhar" — agora discrimina o `strict` |
| 3 | MÉDIA | `teste_integracao` de T-04.01 idem (build de app vazia passa igual) | Trocado por "espera o HTML gerado referenciando o bundle da app" |
| 4 | MÉDIA | Sprint-02 era uma corrente sequencial de 15 tasks; as 4 regras de conformidade não precisavam ser sequenciais entre si | As 4 tasks da F-02.5 passaram a `paralelizavel: true` com `depende_de: []`, e a ordem em relação à F-02.4 ficou garantida pela sequência de fases. A cadeia mais longa caiu de 15 para 11 tasks |
| 5 | BAIXA | T-02.11 acumula dois módulos (`bloqueios.ts` e `historico.ts`) | Mantida. Os dois testes declarados cobrem os dois assuntos em uma frase cada; está no limite da regra de granularidade, não a viola. Registrado como risco aceito |
| 6 | BAIXA | Linha de typecheck do ORQUESTRADOR podia ser lida como comando já existente | Reescrita como "após T-01.01, `npm run build`" |

Durante a correção do achado 4, uma primeira tentativa reintroduziu `paralelizavel: true` com `depende_de` não vazio — exatamente a violação que o painel detecta. Foi apanhada pela verificação mecânica e corrigida movendo a dependência para a ordem entre fases. Uma segunda tentativa acrescentou a chave `nota_paralelismo` ao kind `fases`, chave que não existe no contrato; também foi apanhada e removida, e a informação foi para a prosa, onde não vira violação.

## Achados desta rodada

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| BAIXA | sprint-02/tasks.md | T-02.11 continua criando dois módulos (`bloqueios.ts` e `historico.ts`) numa única task. | Aceito conscientemente: os dois testes cobrem os dois assuntos em uma frase cada. Se a execução achar a task grande, quebrar em duas paralelas é seguro — não há dependência entre bloqueios e histórico. |

## Verificações que passaram

Verificação mecânica por script sobre o frontmatter de todos os 15 arquivos do plano:

- 37 tasks com os 13 campos do contrato preenchidos; nenhum `teste_integracao` ou `teste_funcional` vazio.
- Nenhuma chave fora do contrato e nenhuma chave faltando, em todos os kinds gravados.
- Nenhum ciclo em `depende_de`; nenhuma dependência apontando id inexistente.
- Nenhuma task `paralelizavel: true` com `depende_de` não vazio.
- Nenhuma dupla de tasks paralelas — nem dentro da mesma fase, nem entre fases declaradas paralelas — escreve nos mesmos arquivos ou depende uma da outra.
- Nenhum `criterio_aceite` com adjetivo ou juízo subjetivo.
- Nenhum teste que passaria com implementação errada nas dimensões detectáveis mecanicamente.
- Nenhuma task menciona confirmação, decisão humana ou "a definir".
- Nenhum pré-requisito externo (segredo, conta, credencial, serviço) — coerente com um painel local somente-leitura.
- `caminho_critico` do ORQUESTRADOR só cita ids de fase existentes.
- Prosa e frontmatter dizem a mesma coisa em todos os `tasks.md`: ids, `depende_de` e `paralelizavel` conferidos item a item.
- A sprint-01 entrega capacidade de testar (andaime e fixtures), não funcionalidade de negócio.
- Os riscos registrados na base estão referenciados nas sprints, com a decisão que os trata.

## Nota sobre a origem das decisões

Este plano foi construído sem a entrevista da F2: o usuário autorizou explicitamente decidir tudo. As 32 decisões de `00-DECISOES.md` são, portanto, do planejador, não do usuário. Duas delas — D-01 (campo `arquivos`) e D-02 (kind `decisoes`) — contrariam o contrato `expx-schema v1` a favor do que as skills realmente gravam. Ambas aceitam o superconjunto, de modo que nenhum arquivo real é perdido seja qual for o lado que venha a ser atualizado. A auditoria considera a escolha defensável e explicitamente registrada, mas ela permanece uma decisão de planejamento que o usuário pode reverter.

VEREDITO: SIM — o plano está pronto para execução autônoma.
