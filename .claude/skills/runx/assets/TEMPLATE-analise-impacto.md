---
expx_schema: 1
expx_tool: runx
kind: causa_raiz
trabalho_id: {{OC-ID}}
modo: analise_impacto
comprovada: null
evidencia: null
arquivos_impactados: [{{caminho/relativo/arquivo.ext}}]
palavras_chave: [{{ate 8 termos, minuscula, sem acento}}]
regressao_de: {{OC-ID do trabalho anterior | null}}
evidencia_regressao: {{uma linha com o vinculo causal | null}}
decisoes:
  - id: D-01
    decisao: {{decisao tomada, uma linha}}
    alternativa_descartada: {{alternativa, uma linha}}
    motivo: {{motivo, uma linha}}
atualizado_em: {{AAAA-MM-DD}}
---

> Atencao: `modo: analise_impacto` exige `comprovada: null` e `evidencia: null`, com as chaves presentes. Nao ha causa a comprovar quando nao ha defeito.

> `regressao_de` e `evidencia_regressao` ficam `null` a menos que a verificacao de historico encontre vinculo causal comprovado. Coincidencia de arquivo NAO e regressao (regra 15). `palavras_chave` e preenchido normalmente.

> Frontmatter obrigatorio (expx-schema v1). Formato completo em `references/00-schema.md`. Substitua os marcadores; NUNCA omita uma chave — ausente e `null`, lista vazia e `[]`. Sem acento em chave nem em valor de enum. `atualizado_em` e reescrito a cada gravacao.

## Cadeia da causa — modo analise de impacto

> SUBSTITUA o bloco abaixo pelo diagrama desta ocorrencia, gerado no E1.b pelas regras de `references/07-diagrama.md`. Em `modo: analise_impacto` o diagrama muda de conteudo: nao ha causa a explicar, ha mudanca a dimensionar. `H1` o comportamento atual, `M1` o que muda (em destaque), `Q1..Qn` o que pode quebrar junto — os chamadores, telas, relatorios, integracoes, migracoes e cache da tabela abaixo —, `A1..An` os arquivos impactados como folhas.
>
> `R1` so existe quando `regressao_de` esta preenchido: `R1 -.->|"introduziu"| M1`. Coincidencia de arquivo nao e regressao (regra 15) e nao vira no.
>
> Acima de 12 nos: os `Q1..Qn` colapsam em um no `Q0["N pontos afetados"]` — comportamento atual, o que muda, arquivos e trabalho anterior nunca sao resumidos.
>
> Derivacao, nunca invencao: so entra no diagrama o que esta escrito neste arquivo. Diagrama e derivado e nunca bloqueia o estagio.

```mermaid
flowchart LR
  H1[["{{comportamento atual, ate 32 caracteres}}"]]
  M1{{"{{o que muda}}"}}
  Q1["{{chamador, tela ou relatorio afetado}}"]
  A1[/"{{caminho/relativo/arquivo.ext}}"/]
  H1 --> M1
  M1 -.->|"pode quebrar"| Q1
  M1 --> A1
  classDef causa fill:#f8d7da,stroke:#dc3545,color:#721c24,stroke-width:3px
  class M1 causa
```

# Análise de impacto — {{OC-ID}} {{título da ocorrência}}

> Usado quando `tipo` ≠ `bug`. Mesmo arquivo e mesma posição no fluxo que a causa raiz, conteúdo diferente: não há defeito a explicar, há mudança a dimensionar. Não force uma causa raiz que não existe.

STATUS: IMPACTO MAPEADO

## Como o sistema se comporta hoje

{{O comportamento atual, com evidência no código: caminho/arquivo.ext:linha.}}

## O que exatamente muda

{{A mudança, descrita sem ambiguidade. Campo, fórmula, fluxo, elemento de tela — o que entra, o que sai, o que passa a valer.}}

## O que pode quebrar junto

| O que | Por quê | Onde |
|---|---|---|
| {{chamador, tela, relatório, integração, migração, cache}} | {{o acoplamento que cria o risco}} | `{{caminho:linha}}` |

## Comportamento esperado depois da mudança

{{O estado final observável do sistema.}}

## Critério visual ou de fluxo

> Obrigatório para `melhoria-ui` e `melhoria-ux`; apague esta seção nos demais tipos.

{{Qual é o critério que define "certo", já que não há teste automático que julgue estética. Precisa ser observável e binário: uma condição que qualquer pessoa verifica olhando a tela, com a condição de observação declarada — viewport, estado, papel de usuário. Este critério é a matéria-prima do `criterio_aceite` das tasks do E2.}}

## Regressão

> Preencha depois de mapeado o impacto, consultando o histórico dos arquivos impactados — pelo `memox` quando instalado, pelo versionador (`git log -L`, `git blame`) quando não.

{{Uma das três formas, apague as outras duas:}}

**É regressão:** o trecho que motiva esta mudança foi introduzido/alterado por `{{trabalho_id}}`. {{Qual trecho, em qual arquivo — a mesma linha que vai em `evidencia_regressao`.}}

**Não é regressão:** {{o que o histórico mostrou e por que não fecha como vínculo causal. Coincidência de arquivo fica registrada aqui, na prosa, com `regressao_de: null`.}}

**Histórico indisponível:** {{nem `memox` nem versionador com histórico; a limitação está registrada em `base/00-LACUNAS.md`. Campos como `null`.}}

## Arquivos e módulos impactados

> Esta lista TRAVA o escopo: o que não está aqui não é tocado no E3.

- `{{caminho/relativo/arquivo.ext}}` — {{o que muda nele}}
- `{{caminho/relativo/arquivo.ext}}` — {{o que muda nele}}

## Opções de solução consideradas

| Opção | Trade-off |
|---|---|
| {{opção}} | {{o que ganha, o que perde}} |
| {{opção}} | {{o que ganha, o que perde}} |

## Decisões

> Formato fixo. Não apague decisões: uma decisão revertida ganha nova linha que cita a anterior.

```
D-01 | {{decisão tomada}} | {{alternativa descartada}} | {{motivo}}
```

## Como isso será testado

{{Estratégia de teste que o E2 vai converter em tasks: o teste que fixa o comportamento esperado, e o que os testes de integração e funcional de cada task precisam cobrir.}}
