---
expx_schema: 1
expx_tool: runx
kind: fases
trabalho_id: {{OC-ID}}
sprint_id: sprint-{{NN}}
atualizado_em: {{AAAA-MM-DD}}
fases:
  - id: F-{{NN}}.{{M}}
    titulo: {{titulo da fase}}
    status: {{nao_iniciado | em_andamento | bloqueado | concluido}}
    criterio_saida: {{condicao verificavel, uma linha}}
    paralelizavel: {{true | false}}
    paralela_com: []
    tasks: [T-{{NN}}.{{MM}}]
---

> Frontmatter obrigatorio (expx-schema v1). Formato completo em `references/00-schema.md`. Substitua os marcadores; NUNCA omita uma chave — ausente e `null`, lista vazia e `[]`. Sem acento em chave nem em valor de enum. `atualizado_em` e reescrito a cada gravacao.

## Grafo de tasks

> SUBSTITUA o bloco abaixo INTEIRO pelo grafo desta sprint, gerado no E2 pelas regras de `references/07-diagrama.md`. Um no por task (identificador trocando `-` e `.` por `_`: `T-01.01` → `T_01_01`), uma aresta `-->` por `depende_de`, um `subgraph` por fase, caminho critico na classe `critico`, status por cor, e a task do `teste_regressao` na classe `regressao`. Formato do rotulo: `"<id><br/><titulo cortado em 28>"`.
>
> As arestas ficam FORA dos subgraphs, depois do ultimo `end`. Sem `linkStyle`, sem `style` por no, sem aresta inventada a partir de `paralelizavel` — paralelismo e ausencia de aresta.
>
> Acima de 25 tasks na sprint: uma visao geral das fases mais um diagrama por fase, nunca um diagrama que nao caiba numa tela.
>
> O E3 atualiza SOMENTE as linhas `class` conforme o status de cada task muda. Diagrama e derivado: se ele nao for gerado, nada trava — mas se os campos se contradisserem (`paralelizavel: true` com `depende_de` nao vazio, seta para id inexistente, ciclo), NAO gere o bloco: reporte a contradicao como erro de plano.

> ATENCAO ao substituir: o identificador do no NAO leva marcador `{{...}}`. As chaves duplas sao a sintaxe de no hexagonal do Mermaid e quebram o parse quando aparecem em posicao de identificador. Por isso o bloco abaixo ja vem com identificadores concretos da sprint 01 — troque-os pelos ids reais desta sprint (`T-02.03` → `T_02_03`), e use os marcadores `{{...}}` apenas DENTRO dos rotulos entre aspas.

```mermaid
%% Grafo de tasks — sprint-01 — gerado pela runx a partir de tasks.md
flowchart LR
  subgraph fase_01_1["F-01.1 — {{titulo da fase}}"]
    T_01_01["T-01.01<br/>{{titulo cortado em 28}}"]
    T_01_02["T-01.02<br/>{{titulo cortado em 28}}"]
  end
  T_01_01 --> T_01_02

  classDef concluida fill:#d4f4dd,stroke:#2e7d32,color:#1b3d20
  classDef andamento fill:#fff3cd,stroke:#b8860b,color:#4a3800
  classDef bloqueada fill:#f8d7da,stroke:#c62828,color:#4a1d1f
  classDef pendente  fill:#eceff1,stroke:#78909c,color:#263238
  classDef critico   stroke-width:3px
  classDef regressao fill:#ede4ff,stroke:#6a1b9a,color:#3d1a78,stroke-width:3px

  class T_01_01 regressao
  class T_01_02 pendente
  class T_01_01,T_01_02 critico
```

# Fases — Sprint {{NN}}

> Um bloco por fase. Repita o bloco quantas vezes forem necessárias. O paralelismo declarado aqui é definitivo: a execução nunca decide paralelismo sozinha.

---

## F-{{NN}}.{{M}} — {{título da fase}}

**Objetivo:** {{uma frase}}

**Tasks que a compõem:** {{T-NN.MM, T-NN.MM, ...}}

**Critério de saída:** {{condição verificável, binária, sem adjetivo}}

**Roda em paralelo com:** {{F-NN.M | nenhuma}}

---

## F-{{NN}}.{{M}} — {{título da fase}}

**Objetivo:** {{uma frase}}

**Tasks que a compõem:** {{T-NN.MM, ...}}

**Critério de saída:** {{condição verificável, binária, sem adjetivo}}

**Roda em paralelo com:** {{F-NN.M | nenhuma}}
