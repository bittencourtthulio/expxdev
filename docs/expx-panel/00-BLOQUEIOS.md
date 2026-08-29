---
expx_schema: 1
expx_tool: sprintx
kind: bloqueios
trabalho_id: expx-panel
atualizado_em: 2026-08-29
bloqueios:
  - id: B-01
    task: T-01.06
    aberto_em: 2026-08-29
    resolvido_em: 2026-08-29
    descricao: gray-matter mantem cache global por string e engole a excecao na releitura do mesmo conteudo
---

# Bloqueios

> Criado vazio na F1 e preenchido na execução (F6). Um bloqueio nunca vira pergunta ao usuário: registre aqui, marque a task `bloqueada` e siga para a próxima paralelizável.

B-01 | T-01.06 | `gray-matter` mantém um cache global indexado pelo conteúdo da string: na **segunda** leitura do mesmo conteúdo com YAML inválido, ele não lança — devolve `data: {}` silenciosamente. Num painel que relê a pasta inteira a cada mudança (decisão D-27), um arquivo inválido apareceria na tela de "fora do schema" na primeira leitura e sumiria nas seguintes. | Resolvido na própria descoberta: o parser da sprint-02 deve chamar `matter.clearCache()` antes de cada varredura completa. Registrado aqui porque é uma restrição de biblioteca que o plano não previa e que a T-02.04 precisa respeitar.
