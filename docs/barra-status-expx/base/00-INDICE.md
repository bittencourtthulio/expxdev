---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: barra-status-expx
atualizado_em: 2026-08-30
areas:
  - arquivo: 01-merge-settings-json.md
    titulo: Merge do settings.json no CLI atual
    lacunas: 0
  - arquivo: 02-init-e-montagem-do-expx.md
    titulo: Init, montagem do .expx e wizard
    lacunas: 0
  - arquivo: 03-contrato-expx-estado.md
    titulo: Contrato expx-estado v1
    lacunas: 6
  - arquivo: 04-doctor-e-diagnostico.md
    titulo: Doctor e contrato dos verificadores
    lacunas: 0
  - arquivo: 05-convencoes-de-teste-do-repo.md
    titulo: Convencoes de teste do repositorio
    lacunas: 0
  - arquivo: 06-statusline-claude-code-configuracao.md
    titulo: statusLine do Claude Code, configuracao
    lacunas: 2
  - arquivo: 07-statusline-json-do-stdin.md
    titulo: statusLine, o JSON do stdin
    lacunas: 4
  - arquivo: 08-statusline-execucao-e-render.md
    titulo: statusLine, execucao gatilhos e render
    lacunas: 8
  - arquivo: 09-opencode-barra-de-status.md
    titulo: OpenCode, barra de status
    lacunas: 3
  - arquivo: 10-desempenho-medido.md
    titulo: Desempenho medido, shell jq e node
    lacunas: 1
---

# Índice da base — barra-status-expx

Modo **INTERNO** com fatia externa: o código do CLI e o contrato de estado que já vivem no repositório, mais a documentação oficial da statusLine do Claude Code e a verificação do OpenCode.

| Arquivo | Área | Resumo |
|---|---|---|
| `01-merge-settings-json.md` | Merge do `settings.json` no CLI atual | Como `mesclarSettings` mescla, faz backup e recusa JSON inválido; por que `statusLine` não cabe no padrão aditivo das três chaves atuais |
| `02-init-e-montagem-do-expx.md` | `init`, montagem do `.expx/` e wizard | Ordem das perguntas, switch de flags que recusa token não previsto, e a transação `escreverAtomico` que define onde o script pode ser gerado |
| `03-contrato-expx-estado.md` | Contrato `expx-estado` v1 | As dezesseis chaves do `estado.json`, a regra de chave nunca omitida, e o conflito de versionamento entre `.expx/` commitado e `estado.json` ignorado |
| `04-doctor-e-diagnostico.md` | `doctor` e contrato dos verificadores | Forma do `Achado`, os `return` antecipados que limitam onde uma verificação nova roda, e o precedente de severidade para o que não impede o método |
| `05-convencoes-de-teste-do-repo.md` | Convenções de teste do repositório | vitest com três projetos, nomenclatura `integração:`/`funcional:`, isolamento por `projetoTemporario`, e o risco de teste de tempo intermitente |
| `06-statusline-claude-code-configuracao.md` | statusLine — configuração | Forma da chave, `padding`/`refreshInterval`/`hideVimModeIndicator`, os três gates que apagam a barra em silêncio, e o trap de barra invertida no Windows |
| `07-statusline-json-do-stdin.md` | statusLine — JSON do stdin | O schema completo verbatim, quais campos podem faltar ou vir `null`, e por que o aviso de instabilidade que o pedido supunha não existe |
| `08-statusline-execucao-e-render.md` | statusLine — execução e render | Gatilhos, debounce de 300 ms, cancelamento do in-flight, `COLUMNS` como única fonte de largura, e o achado de que multi-linha é suportado |
| `09-opencode-barra-de-status.md` | OpenCode — barra de status | A lacuna resolvida no negativo: não há superfície de customização, e a API de plugin que a resolveria não existe |
| `10-desempenho-medido.md` | Desempenho medido | Números reais: shell+jq ~40 ms, Node ~44 ms, cada `git` 16-20 ms; e por que a decisão "shell para não depender de runtime" se inverte quando medida |
