---
expx_schema: 1
expx_tool: runx
kind: relatorio_tecnico
trabalho_id: {{OC-ID}}
titulo: {{titulo da ocorrencia, uma linha}}
tipo_ocorrencia: {{bug | melhoria-ui | melhoria-ux | novo-relatorio | regra-de-calculo | campo-novo | outro}}
fechado_em: {{AAAA-MM-DD}}
modulo_afetado: [{{modulo}}]
arquivos_alterados: [{{caminho/relativo/arquivo.ext}}]
palavras_chave: [{{copiado de 01-CAUSA-RAIZ.md}}]
regressao_de: {{copiado de 01-CAUSA-RAIZ.md | null}}
testes_adicionados: {{numero de testes criados, incluindo o de regressao}}
---

> `palavras_chave` e `regressao_de` sao COPIADOS de `01-CAUSA-RAIZ.md`, sem recalcular: `null` la e `null` aqui. Nunca invente um vinculo de regressao no fechamento (regra 15). `evidencia_regressao` nao entra neste YAML — a linha de evidencia vai na secao 4.

> Frontmatter obrigatorio (expx-schema v1). Formato completo em `references/00-schema.md`. Substitua os marcadores; NUNCA omita uma chave — ausente e `null`, lista vazia e `[]`. Sem acento em chave nem em valor de enum. `atualizado_em` e reescrito a cada gravacao.

# {{OC-ID}} — {{título da ocorrência}}

> Leitor: o próximo desenvolvedor que abrir este código. Aqui nome de arquivo, função, tabela e jargão são bem-vindos — é para isso que este arquivo existe. Caminhos sempre relativos.

**Fechada em:** {{AAAA-MM-DD}}

## 1. Ocorrência e tipo

{{OC-ID}} · {{bug \| melhoria-ui \| melhoria-ux \| novo-relatorio \| regra-de-calculo \| campo-novo \| outro}} · módulo: {{módulo afetado}}

## 2. Sintoma relatado

{{O que o cliente relatou, resumido para leitura técnica. O relato literal fica em `docs/manutencao/{{OC-ID}}-{{slug}}/00-OCORRENCIA.md`.}}

## 3. Base do que foi mapeado, em resumo

{{Destilado de `base/`: as áreas mapeadas, com os caminhos, e o que cada uma faz. Uma linha por área.}}

## 4. Causa raiz ou análise de impacto

{{De `01-CAUSA-RAIZ.md`: a causa comprovada com a prova (teste, log ou trecho com linha), ou o impacto mapeado.}}

**Regressão:** {{quando `regressao_de` estiver preenchido — de qual trabalho é a regressão e a linha de `evidencia_regressao` que sustenta o vínculo. Quando for `null`, escreva "Não é regressão de trabalho anterior registrado." e, se houve suspeita descartada, uma linha dizendo qual e por que foi descartada.}}

## 5. Solução aplicada

{{O que foi feito, tecnicamente. O mecanismo, não só o resultado.}}

## 6. Decisão técnica e alternativas descartadas

```
D-01 | {{decisão tomada}} | {{alternativa descartada}} | {{motivo}}
```

## 7. Sprints, fases e tasks executadas

| Task | Título | Status | Data |
|---|---|---|---|
| T-{{NN.MM}} | {{título}} | {{concluida \| bloqueada}} | {{AAAA-MM-DD}} |

{{Bloqueios remanescentes, se houver, de `BLOQUEIOS.md`.}}

## 8. Arquivos alterados

- `{{caminho/relativo/arquivo.ext}}` — {{o que mudou}}

## 9. Testes adicionados

- **Regressão:** `{{caminho/relativo/teste.ext}}` — {{o que reproduz; falhava antes, passa agora}}
- **Integração:** `{{caminho/relativo/teste.ext}}` — {{o que valida}}
- **Funcional:** `{{caminho/relativo/teste.ext}}` — {{o que valida}}

## 10. Risco residual

{{O que permanece frágil. Inclua aqui os achados MÉDIA/BAIXA de `QA.md` que continuam válidos, e as lacunas de `base/00-LACUNAS.md` que não foram fechadas.}}

## 11. O que observar em produção

{{O que monitorar depois do deploy: qual comportamento, em qual tela ou relatório, com qual dado. O deploy é externo ao runx; registre aqui a data de liberação quando o usuário informar.}}

## 12. Sugestões de novas ocorrências percebidas e não feitas

> Escopo travado (regra 8): tudo que foi visto e deliberadamente NÃO tocado. Sugestão, nunca implementação.

- {{o que foi percebido}} — {{por que vale uma ocorrência própria}}
