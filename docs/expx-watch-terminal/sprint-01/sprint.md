---
expx_schema: 1
expx_tool: sprintx
kind: sprint
trabalho_id: expx-watch-terminal
sprint_id: sprint-01
titulo: Fundacao - fixtures e leitores das fontes
status: concluido
criterio_saida: npm test verde, as nove fixtures novas de fixtures/watch em disco, e os dois leitores novos cobertos
fases: [F-01.1, F-01.2, F-01.3]
riscos: [Nenhuma fixture do repositorio tem estado.json ou docs/eventos, entao as duas fontes primarias nascem nesta sprint, Ler so o fim do rastro pode cortar linha ao meio e o leitor precisa descartar o fragmento inicial]
atualizado_em: 2026-08-30
---

# Sprint 01 — Fundação: fixtures e leitores das fontes

## Objetivo

Entregar a capacidade de testar o watch: as dez fixtures que a especificação exige e os dois leitores que a F1 provou não existirem — o de `.expx/estado.json` e o do rastro `docs/eventos/*.jsonl`. Nenhuma linha de desenho de terminal nesta sprint.

## Fases

| Fase | Título | Roda em paralelo com |
|---|---|---|
| F-01.1 | Fixtures das fontes e dos casos de borda | nenhuma |
| F-01.2 | Leitor do estado.json | F-01.3 |
| F-01.3 | Leitor do rastro de eventos | F-01.2 |

Detalhe de cada fase em `fases.md`; tasks em `tasks.md`.

## As dez fixtures da especificação

Esta é a lista nominal. Todo `criterio_saida` e todo teste que diz "as dez fixtures" se refere exatamente a estas — endereça o achado ALTA-1 da auditoria (rodada 1).

| # | Fixture da especificação | Onde mora | Criada por |
|---|---|---|---|
| 1 | Trabalho do sprintx em execução | `fixtures/watch/com-estado/` | T-01.01 |
| 2 | Ocorrência do runx em modo legado com raio alto | `fixtures/watch/legado-raio-alto/` | T-01.01 |
| 3 | Trabalho com bloqueio aberto | `fixtures/watch/com-bloqueio/` | T-01.03 |
| 4 | Trabalho concluído | `fixtures/watch/concluido/` | T-01.02 |
| 5 | Nenhum trabalho aberto | `fixtures/watch/sem-trabalho/` | T-01.02 |
| 6 | `estado.json` inválido | `fixtures/watch/estado-invalido/` e `fixtures/watch/estado-versao-futura/` | T-01.01 |
| 7 | Rastro ausente | `fixtures/watch/sem-rastro/` | T-01.02 |
| apoio | Vários trabalhos com os quatro status (não é item da especificação; existe para testar `--todos` e o id posicional) | `fixtures/watch/varios-trabalhos/` | T-01.02 |
| 8 | Plano com frontmatter inválido | `fixtures/projeto-ruim/` — **reaproveitada, não recriada** | já existe |
| 9 | Terminal de 60 colunas | **modo de teste, não diretório**: parâmetro `largura: 60` em `desenhar` | T-02.09 |
| 10 | Saída redirecionada para arquivo | **modo de teste, não diretório**: parâmetro `cor: false` em `desenhar` | T-02.09 |

São nove diretórios novos em `fixtures/watch/`: `com-estado`, `legado-raio-alto`, `estado-invalido`, `estado-versao-futura`, `com-bloqueio`, `concluido`, `sem-trabalho`, `sem-rastro` e `varios-trabalhos`.

**Quais têm plano em disco.** Toda fixture que algum teste de desenho consome precisa de `ORQUESTRADOR.md` e `sprint-01/`, porque pasta sem `ORQUESTRADOR.md` é ignorada em silêncio pelo parser (`base/parser-de-artefatos.md`) e `montarProjeto` devolveria zero trabalhos. Têm plano completo: `com-estado`, `legado-raio-alto`, `estado-invalido`, `com-bloqueio`, `concluido`, `sem-rastro` e `varios-trabalhos` (esta, quatro `ORQUESTRADOR.md`, um por status). Não têm plano de propósito: `estado-versao-futura` (só exercita a rejeição de versão em T-01.05) e `sem-trabalho` (a ausência de trabalho é o que ela testa). A 8 já existe em `fixtures/projeto-ruim/` com seis variedades de frontmatter inválido (`base/fixtures-e-testes.md`) e não é duplicada. As 9 e 10 não são estado em disco: são as duas dimensões que `desenhar` recebe por parâmetro, exercitadas em T-02.09.

## Critério de saída

`npm test` termina com 0 failed, as nove fixtures novas existem em `fixtures/watch/` conforme a tabela acima, e `lerEstadoExpx` e `lerRastro` têm teste de integração e funcional passando.

## Riscos conhecidos

- Nenhuma fixture do repositório tem `.expx/estado.json` nem `docs/eventos/*.jsonl`: as duas fontes primárias do watch nascem nesta sprint (`base/fixtures-e-testes.md`, risco 2).
- Ler só o fim do rastro (D-09) corta a primeira linha ao meio; o leitor precisa descartar o fragmento inicial (`base/rastro-de-eventos.md`, risco 2).
- `src/watch/**` cai no projeto vitest `servidor`, com timeout de 20 s, seis vezes menor que o do projeto `cli` (`base/fixtures-e-testes.md`, risco 5).
