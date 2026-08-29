---
expx_schema: 1
expx_tool: sprintx
kind: decisoes
trabalho_id: exportacao-csv
atualizado_em: 2026-08-24
decisoes:
  - id: D-01
    decisao: Exportacao assincrona via fila existente
    alternativa_descartada: Exportacao sincrona na request
    motivo: Nao segurar a resposta do usuario em relatorio grande
    status: fechada
    bloqueante: false
  - id: PENDENTE-01
    decisao: Qual separador decimal usar no locale pt-BR
    alternativa_descartada: null
    motivo: null
    status: pendente
    bloqueante: true
---

# Decisões — exportacao-csv

```
D-01 | Exportação assíncrona via fila existente | Exportação síncrona na request | Não segurar a resposta do usuário
```

## Pendências

```
PENDENTE-01 | Qual separador decimal usar no locale pt-BR | trava: formatação das colunas numéricas
```
