---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: expx-panel
sprint_id: sprint-04
atualizado_em: 2026-08-29
tasks:
  - id: T-04.01
    titulo: Andaime da app React
    fase: F-04.1
    status: concluida
    objetivo: Montar a app React empacotada por Vite e servida pelo proprio servidor
    arquivos:
      cria: [ui/index.html, ui/src/principal.tsx, ui/src/App.tsx, vite.config.ts]
      altera: [package.json]
    teste_integracao: Roda o build da UI e espera o HTML gerado referenciando o bundle da app
    teste_funcional: Dada a app montada sem dados, ela renderiza o estado de carregando
    criterio_aceite: O build da UI termina com codigo 0 e gera o artefato estatico
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-04.02
    titulo: Cliente de estado com websocket
    fase: F-04.1
    status: concluida
    objetivo: Carregar o projeto pela API e substituir o estado ao receber mensagem do websocket
    arquivos:
      cria: [ui/src/estado/cliente.ts, ui/src/estado/cliente.test.ts]
      altera: []
    teste_integracao: Simula uma mensagem de websocket e espera o estado da app substituido
    teste_funcional: Dada a queda da conexao, o indicador de desconectado fica visivel
    criterio_aceite: O estado e substituido pela mensagem e a queda de conexao fica visivel na tela
    depende_de: [T-04.01]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-04.03
    titulo: Cards de resumo
    fase: F-04.2
    status: concluida
    objetivo: Renderizar os cards de planejamento execucao bloqueados e concluidos separando feature de ocorrencia
    arquivos:
      cria: [ui/src/telas/Resumo.tsx, ui/src/telas/Resumo.test.tsx]
      altera: []
    teste_integracao: Renderiza a tela com o projeto de fixture e espera os quatro cards presentes
    teste_funcional: Dado um trabalho em estagio f3, ele e contado no card de planejamento
    criterio_aceite: Os quatro cards mostram contagem separada de feature e ocorrencia
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
  - id: T-04.04
    titulo: Quadro por estagio com filtros
    fase: F-04.2
    status: concluida
    objetivo: Renderizar as onze colunas de estagio e os filtros de ferramenta tipo e status
    arquivos:
      cria: [ui/src/telas/Quadro.tsx, ui/src/telas/Quadro.test.tsx]
      altera: []
    teste_integracao: Renderiza o quadro com a fixture e espera cada trabalho na coluna do seu estagio
    teste_funcional: Dado o filtro de ferramenta runx, so trabalhos runx permanecem visiveis
    criterio_aceite: Existem onze colunas e os tres filtros reduzem os trabalhos visiveis
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
  - id: T-04.05
    titulo: Arvore de sprints fases e tasks
    fase: F-04.3
    status: concluida
    objetivo: Renderizar o detalhe do trabalho com barras de progresso por fase e por sprint
    arquivos:
      cria: [ui/src/telas/Detalhe.tsx, ui/src/telas/Detalhe.test.tsx]
      altera: []
    teste_integracao: Renderiza o detalhe do trabalho de fixture e espera suas sprints e tasks na tela
    teste_funcional: Dada uma fase com uma de quatro tasks concluida, a barra mostra vinte e cinco por cento
    criterio_aceite: Cada fase e cada sprint mostram barra de progresso vinda do parser
    depende_de: []
    paralelizavel: true
    concluida_em: 2026-08-29
    suite: verde
  - id: T-04.06
    titulo: Dependencias caminho critico e bloqueios
    fase: F-04.3
    status: concluida
    objetivo: Mostrar as dependencias entre tasks destacar paralelizavel e evidenciar o caminho critico
    arquivos:
      cria: [ui/src/telas/Dependencias.tsx, ui/src/telas/Dependencias.test.tsx]
      altera: [ui/src/telas/Detalhe.tsx]
    teste_integracao: Renderiza as dependencias da fixture e espera nenhum travamento com ciclo presente
    teste_funcional: Dada uma task no caminho critico, ela recebe o destaque de caminho critico
    criterio_aceite: Task paralelizavel e task do caminho critico tem marcacao visual distinta
    depende_de: [T-04.05]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-04.07
    titulo: Tela de conformidade
    fase: F-04.4
    status: concluida
    objetivo: Listar as violacoes do metodo com arquivo e linha
    arquivos:
      cria: [ui/src/telas/Conformidade.tsx, ui/src/telas/Conformidade.test.tsx]
      altera: []
    teste_integracao: Renderiza a tela com o projeto bom e espera lista vazia de violacoes
    teste_funcional: Dada uma violacao com linha conhecida, a tela mostra o arquivo e a linha
    criterio_aceite: Projeto sem defeito mostra lista vazia e cada violacao aponta o arquivo
    depende_de: [T-04.06]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-04.08
    titulo: Linha do tempo do historico
    fase: F-04.4
    status: concluida
    objetivo: Mostrar o historico ordenado por data com busca e abas de relatorio
    arquivos:
      cria: [ui/src/telas/Historico.tsx, ui/src/telas/Historico.test.tsx]
      altera: []
    teste_integracao: Renderiza o historico da fixture e espera a entrada mais recente no topo
    teste_funcional: Dada a busca pelo modulo frete, so entradas desse modulo permanecem
    criterio_aceite: A aba de relatorio de uso tem botao de copiar que copia o texto do relatorio
    depende_de: [T-04.07]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
  - id: T-04.09
    titulo: Tela de fora do schema
    fase: F-04.4
    status: concluida
    objetivo: Listar os arquivos rejeitados com o motivo da rejeicao
    arquivos:
      cria: [ui/src/telas/ForaDoSchema.tsx, ui/src/telas/ForaDoSchema.test.tsx]
      altera: []
    teste_integracao: Renderiza a tela com o projeto ruim e espera as rejeicoes listadas
    teste_funcional: Dado o arquivo de versao futura, a tela mostra o motivo de versao futura
    criterio_aceite: Cada rejeicao mostra o caminho do arquivo e o motivo
    depende_de: [T-04.08]
    paralelizavel: false
    concluida_em: 2026-08-29
    suite: verde
---

# Tasks — Sprint 04

---

```yaml
id: T-04.01
titulo: Andaime da app React
objetivo: Montar a app React empacotada por Vite e servida pelo próprio servidor
arquivos:
  cria: [ui/index.html, ui/src/principal.tsx, ui/src/App.tsx, vite.config.ts]
  altera: [package.json]
teste_integracao: Roda o build da UI e espera o HTML gerado referenciando o bundle da app
teste_funcional: Dada a app montada sem dados, ela renderiza o estado de "carregando"
criterio_aceite: O build da UI termina com código 0 e gera o artefato estático
depende_de: []
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 89 passed (89)
```

---

```yaml
id: T-04.02
titulo: Cliente de estado com websocket
objetivo: Carregar o projeto pela API e substituir o estado ao receber mensagem do websocket
arquivos:
  cria: [ui/src/estado/cliente.ts, ui/src/estado/cliente.test.ts]
  altera: []
teste_integracao: Simula uma mensagem de websocket e espera o estado da app substituído
teste_funcional: Dada a queda da conexão, o indicador de desconectado fica visível
criterio_aceite: O estado é substituído pela mensagem e a queda de conexão fica visível na tela
depende_de: [T-04.01]
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 89 passed (89)
```

---

```yaml
id: T-04.03
titulo: Cards de resumo
objetivo: Renderizar os cards de planejamento, execução, bloqueados e concluídos, separando feature de ocorrência
arquivos:
  cria: [ui/src/telas/Resumo.tsx, ui/src/telas/Resumo.test.tsx]
  altera: []
teste_integracao: Renderiza a tela com o projeto de fixture e espera os quatro cards presentes
teste_funcional: Dado um trabalho em estágio `f3`, ele é contado no card de planejamento
criterio_aceite: Os quatro cards mostram contagem separada de feature e ocorrência
depende_de: []
paralelizavel: true
status: concluida  # 2026-08-29 · suíte: 89 passed (89)
```

---

```yaml
id: T-04.04
titulo: Quadro por estágio com filtros
objetivo: Renderizar as onze colunas de estágio e os filtros de ferramenta, tipo e status
arquivos:
  cria: [ui/src/telas/Quadro.tsx, ui/src/telas/Quadro.test.tsx]
  altera: []
teste_integracao: Renderiza o quadro com a fixture e espera cada trabalho na coluna do seu estágio
teste_funcional: Dado o filtro de ferramenta `runx`, só trabalhos runx permanecem visíveis
criterio_aceite: Existem onze colunas e os três filtros reduzem os trabalhos visíveis
depende_de: []
paralelizavel: true
status: concluida  # 2026-08-29 · suíte: 89 passed (89)
```

---

```yaml
id: T-04.05
titulo: Árvore de sprints, fases e tasks
objetivo: Renderizar o detalhe do trabalho com barras de progresso por fase e por sprint
arquivos:
  cria: [ui/src/telas/Detalhe.tsx, ui/src/telas/Detalhe.test.tsx]
  altera: []
teste_integracao: Renderiza o detalhe do trabalho de fixture e espera suas sprints e tasks na tela
teste_funcional: Dada uma fase com uma de quatro tasks concluída, a barra mostra 25%
criterio_aceite: Cada fase e cada sprint mostram barra de progresso vinda do parser
depende_de: []
paralelizavel: true
status: concluida  # 2026-08-29 · suíte: 89 passed (89)
```

---

```yaml
id: T-04.06
titulo: Dependências, caminho crítico e bloqueios
objetivo: Mostrar as dependências entre tasks, destacar paralelizável e evidenciar o caminho crítico
arquivos:
  cria: [ui/src/telas/Dependencias.tsx, ui/src/telas/Dependencias.test.tsx]
  altera: [ui/src/telas/Detalhe.tsx]
teste_integracao: Renderiza as dependências da fixture e espera nenhum travamento com ciclo presente
teste_funcional: Dada uma task no caminho crítico, ela recebe o destaque de caminho crítico
criterio_aceite: Task paralelizável e task do caminho crítico têm marcação visual distinta
depende_de: [T-04.05]
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 89 passed (89)
```

---

```yaml
id: T-04.07
titulo: Tela de conformidade
objetivo: Listar as violações do método com arquivo e linha
arquivos:
  cria: [ui/src/telas/Conformidade.tsx, ui/src/telas/Conformidade.test.tsx]
  altera: []
teste_integracao: Renderiza a tela com o projeto bom e espera lista vazia de violações
teste_funcional: Dada uma violação com linha conhecida, a tela mostra o arquivo e a linha
criterio_aceite: Projeto sem defeito mostra lista vazia e cada violação aponta o arquivo
depende_de: [T-04.06]
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 89 passed (89)
```

---

```yaml
id: T-04.08
titulo: Linha do tempo do histórico
objetivo: Mostrar o histórico ordenado por data, com busca e abas de relatório
arquivos:
  cria: [ui/src/telas/Historico.tsx, ui/src/telas/Historico.test.tsx]
  altera: []
teste_integracao: Renderiza o histórico da fixture e espera a entrada mais recente no topo
teste_funcional: Dada a busca pelo módulo `frete`, só entradas desse módulo permanecem
criterio_aceite: A aba de relatório de uso tem botão de copiar que copia o texto do relatório
depende_de: [T-04.07]
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 89 passed (89)
```

---

```yaml
id: T-04.09
titulo: Tela de fora do schema
objetivo: Listar os arquivos rejeitados com o motivo da rejeição
arquivos:
  cria: [ui/src/telas/ForaDoSchema.tsx, ui/src/telas/ForaDoSchema.test.tsx]
  altera: []
teste_integracao: Renderiza a tela com o projeto ruim e espera as rejeições listadas
teste_funcional: Dado o arquivo de versão futura, a tela mostra o motivo "versão futura"
criterio_aceite: Cada rejeição mostra o caminho do arquivo e o motivo
depende_de: [T-04.08]
paralelizavel: false
status: concluida  # 2026-08-29 · suíte: 89 passed (89)
```
