# Auditoria — expx-cli

Data: 2026-08-29

Auditoria do plano gerado na F3 e do ORQUESTRADOR gerado na F4, contra os nove tipos de achado da F5. Foram verificadas 34 tasks, 15 fases e 5 sprints, mais o ORQUESTRADOR e as 17 decisões.

## Verificações executadas

| # | Verificação | Resultado |
|---|---|---|
| 1 | Task sem teste | Nenhuma. As 34 tasks têm `teste_integracao` e `teste_funcional` não vazios (verificado por script) |
| 2 | Teste que passaria com implementação errada | Nenhum teste se limita a "não deu erro"; todos declaram entrada e saída esperadas |
| 3 | Critério de aceite subjetivo | Nenhum adjetivo de juízo. Os 34 critérios são condições binárias |
| 4 | Dependência circular | Nenhuma. Verificado por busca em profundidade sobre `depende_de` |
| 5 | Paralelismo falso | Nenhuma task `paralelizavel: true` depende de outra nem escreve nos mesmos arquivos de outra paralela da mesma janela |
| 6 | Sequencialidade desnecessária no caminho crítico | Um achado BAIXA (A-02) |
| 7 | Task que exigiria decisão humana | Nenhuma |
| 8 | Pré-requisito externo não declarado | Um achado MÉDIA (A-01) |
| 9 | Base ignorada ou contradita sem decisão | Nenhuma. As contradições entre o pedido original e a base estão cobertas por D-02, D-03 e D-04 |

## Achados

| severidade | arquivo | problema | correção sugerida |
|---|---|---|---|
| MÉDIA | `ORQUESTRADOR.md` seção 4, `sprint-04/sprint.md` | O binário `claude` é pré-requisito externo real da instalação (D-03), mas nenhuma task declara o que fazer quando ele está ausente. A T-04.04 encadeia a instalação sem tratar essa falta. O risco de sprint menciona degradar com instrução clara, mas nenhum `criterio_aceite` cobre isso | Acrescentar à T-04.04, ou como task nova na F-04.2, o caso "binário `claude` ausente": o init completa a montagem de `.expx/` e informa o comando manual, sem falhar. Critério: sem `claude` no PATH, o init devolve código 0 e a saída cita `claude plugin marketplace add` |
| BAIXA | `sprint-05/tasks.md` | `package.json` é alterado por T-04.07 e T-05.07, e T-05.07 é `paralelizavel: true`. As duas estão em sprints distintas, que são sequenciais, então não há colisão real — mas a marcação isolada de T-05.07 não deixa isso explícito para quem executa | Manter como está; ou registrar em T-05.07 que a paralelização vale apenas com T-05.05/T-05.06, ambas sem `package.json` |
| BAIXA | `sprint-01/tasks.md` | T-01.06 é `paralelizavel: false` e tem `depende_de: []`. Ela poderia rodar em paralelo com as tasks da F-01.1 e F-01.2, encurtando a sprint 01 | Deixar como está (conservador, e a F-01.3 é declarada não paralela), ou marcar T-01.06 como `paralelizavel: true`, já que ela cria arquivos que nenhuma outra task da sprint toca |

## Observação de método

O achado A-01 é MÉDIA e não ALTA porque não invalida a execução autônoma: a T-04.04 é executável e testável sem o binário `claude` (os testes usam fixtures locais), e a ausência do binário afeta o comportamento em máquina real, não a capacidade de executar o plano. Ainda assim, é o achado com maior chance de virar bloqueio na F6 e deve ser endereçado na execução da F-04.2.

VEREDITO: SIM — o plano está pronto para execução autônoma.
