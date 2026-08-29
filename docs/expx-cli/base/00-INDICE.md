---
expx_schema: 1
expx_tool: sprintx
kind: base_indice
trabalho_id: expx-cli
atualizado_em: 2026-08-29
areas:
  - arquivo: 01-projeto-atual-painel.md
    titulo: Projeto atual - o painel @expx/painel
    lacunas: 1
  - arquivo: 02-stack-build-e-testes.md
    titulo: Stack, build e testes deste repositorio
    lacunas: 0
  - arquivo: 03-contrato-expx-schema.md
    titulo: Contrato expx-schema v1 e compatibilidade de versao
    lacunas: 1
  - arquivo: 04-skills-do-ecossistema.md
    titulo: As cinco skills do ecossistema Expx
    lacunas: 4
  - arquivo: 05-plugins-claude-code.md
    titulo: Plugins e marketplaces do Claude Code
    lacunas: 5
  - arquivo: 06-opencode.md
    titulo: OpenCode - descoberta de skills e comandos
    lacunas: 1
  - arquivo: 07-especificacao-pedida.md
    titulo: A especificacao pedida - subcomandos, lock e update
    lacunas: 0
  - arquivo: 08-repositorios-reais.md
    titulo: Os cinco repositorios - estrutura real verificada
    lacunas: 1
  - arquivo: 09-validacao-marketplace-local.md
    titulo: Validacao em execucao - marketplace local e cache de plugin
    lacunas: 1
---

# Índice da base — expx-cli

Base de conhecimento construída na F1. Nove áreas. Das 15 lacunas iniciais, **9 foram resolvidas por verificação empírica** e 6 viraram decisão; restam 2 abertas com mitigação (`00-LACUNAS.md`).

| Arquivo | Área | Resumo |
|---|---|---|
| `01-projeto-atual-painel.md` | Projeto atual — o painel `@expx/painel` | O que já existe: bin `expx-painel`, parser de argumentos sem subcomando, servidor somente leitura em 127.0.0.1, e o padrão `realpath` que o bin novo deve repetir |
| `02-stack-build-e-testes.md` | Stack, build e testes | ESM + TypeScript strict + NodeNext, Vitest em dois projetos, zod, teste ao lado do arquivo, fixtures em `fixtures/` |
| `03-contrato-expx-schema.md` | Contrato `expx-schema` v1 | Cabeçalho comum, 13 kinds, `VERSAO_SUPORTADA = 1` declarada em dois pontos, e a rejeição `VersaoFutura` que precede a regra de incompatibilidade do update |
| `04-skills-do-ecossistema.md` | As cinco skills | Estrutura real de `sprintx`/`runx`, comandos vivendo separados em `~/.claude/commands/`, e a verificação de que hoje nenhuma skill referencia caminho fora da própria pasta |
| `05-plugins-claude-code.md` | Plugins e marketplaces do Claude Code | `plugin.json`/`marketplace.json` completos, namespace `/expx:sprintx-sprints` confirmado, e o ponto crítico não documentado do marketplace local em `settings.json` |
| `06-opencode.md` | OpenCode | Seis diretórios de skill incluindo `.claude/skills/`, `commands/` plural documentado, ausência de namespace, e a colisão por last-writer-wins |
| `07-especificacao-pedida.md` | A especificação pedida | Subcomandos, fluxo do init, lock, resolução de versão, update com suas 8 etapas e 6 flags, rollback em aberto, doctor e fixtures exigidas |
| `08-repositorios-reais.md` | Os cinco repositórios — estrutura real | Os cinco clonados: existem, públicos, **sem nenhuma tag**, em DOIS layouts distintos; 32 comandos; patches do legadox reescrevem skill |
| `09-validacao-marketplace-local.md` | Validação em execução | O experimento que provou que declarar no settings do projeto NÃO instala, achou a sintaxe real (`directory` + caminho absoluto) e mapeou o cache |

## Os três achados que mudam o desenho pedido

1. **Declarar o marketplace no `.claude/settings.json` do projeto NÃO instala o plugin** — cinco sintaxes testadas, todas falharam. O `init` precisa chamar `claude plugin marketplace add` + `claude plugin install` (D-03).
2. **`marketplace/` e `plugin/` não podem ser irmãos** — o `source` relativo não pode subir de diretório (`source: Invalid input`). O plugin vai para dentro do marketplace (D-02).
3. **Nenhuma das cinco skills tem tag** — a regra de "maior tag semântica" cai inteiramente no fallback de branch hoje, e os repositórios têm dois layouts distintos, exigindo um normalizador (D-12).
