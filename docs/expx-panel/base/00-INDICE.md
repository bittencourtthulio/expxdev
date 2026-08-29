---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: expx-panel
atualizado_em: 2026-08-29
areas:
  - arquivo: 01-regras-universais.md
    titulo: Regras universais do expx-schema v1
    lacunas: 3
  - arquivo: 02-enums.md
    titulo: Enums do expx-schema v1
    lacunas: 3
  - arquivo: 03-kind-tasks.md
    titulo: kind tasks
    lacunas: 5
  - arquivo: 04-kind-orquestrador.md
    titulo: kind orquestrador
    lacunas: 4
  - arquivo: 05-kind-sprint-e-fases.md
    titulo: kinds sprint e fases
    lacunas: 2
  - arquivo: 06-kind-bloqueios-e-decisoes.md
    titulo: kinds bloqueios e decisoes
    lacunas: 1
  - arquivo: 07-kinds-runx.md
    titulo: kinds exclusivos da runx
    lacunas: 2
  - arquivo: 08-kinds-relatorios-e-indices.md
    titulo: kinds de relatorio e indice
    lacunas: 2
  - arquivo: 09-descoberta-e-layout.md
    titulo: Descoberta de trabalhos e layout de pastas
    lacunas: 1
  - arquivo: 10-stack-e-dependencias.md
    titulo: Stack e dependencias
    lacunas: 2
  - arquivo: 11-conformidade-e-rejeicoes.md
    titulo: Conformidade do metodo versus rejeicao de schema
    lacunas: 1
  - arquivo: 12-atualizacao-ao-vivo.md
    titulo: Atualizacao ao vivo
    lacunas: 0
---

# Índice da base — expx-panel

> Base construída na F1 a partir de três fontes lidas por inteiro em 2026-08-29: o contrato (`docs/contrato/CONTRATO-expx-schema-v1.md`), o schema da sprintx e o schema da runx.
> A contagem de `lacunas` no frontmatter é das lacunas **originadas** naquela área. Várias são citadas em mais de um arquivo; o total sem repetição é 26, em `00-LACUNAS.md`.

| Arquivo | Área | Resumo |
|---|---|---|
| `01-regras-universais.md` | Regras universais | As nove regras que valem para todo arquivo com frontmatter, e o que cada uma implica para o parser |
| `02-enums.md` | Enums | Os doze conjuntos de valores, com a comparação entre as três fontes e as duas armadilhas de vocabulário |
| `03-kind-tasks.md` | kind `tasks` | O kind mais importante do painel; contém a divergência crítica do campo `arquivos` |
| `04-kind-orquestrador.md` | kind `orquestrador` | A âncora da descoberta; formato dos ids do caminho crítico |
| `05-kind-sprint-e-fases.md` | kinds `sprint` e `fases` | Estrutura que sustenta as barras de progresso e o paralelismo declarado |
| `06-kind-bloqueios-e-decisoes.md` | kinds `bloqueios` e `decisoes` | Bloqueio aberto é `resolvido_em: null`; o kind `decisoes` está fora do contrato |
| `07-kinds-runx.md` | kinds exclusivos da runx | `ocorrencia`, `causa_raiz` e `qa`, com os campos que só existem no ciclo de manutenção |
| `08-kinds-relatorios-e-indices.md` | kinds de relatório e índice | Histórico do sistema; `relatorios_indice` é o único kind sem `trabalho_id` |
| `09-descoberta-e-layout.md` | Descoberta e layout | Onde o painel procura, e quais arquivos legitimamente não têm frontmatter |
| `10-stack-e-dependencias.md` | Stack | Versões reais verificadas no npm; `gray-matter` carrega `js-yaml` 3.x |
| `11-conformidade-e-rejeicoes.md` | Conformidade × rejeição | As sete violações da v1 e os sete caminhos conhecidos para gerar violação falsa |
| `12-atualizacao-ao-vivo.md` | Atualização ao vivo | Observação de arquivos, debounce e o risco de rejeição transitória |
