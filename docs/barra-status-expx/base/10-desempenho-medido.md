# Desempenho medido — shell+jq vs Node, e o custo do git

> Medições feitas em 2026-08-30, macOS (Darwin 25.5.0), Apple silicon, Node v20.20.1, jq-1.7.1-apple, na máquina de desenvolvimento. **São um piso otimista**: máquina mais lenta, disco de rede, repositório grande e antivírus corporativo pioram todos os números. Servem para ordenar as opções, não como promessa.

## Contrato de entrada

Método: laço de 20 execuções, `time` do shell, dividido por 20. Entrada: `entrada.json` no formato do stdin da statusLine e `estado.json` no formato do contrato `expx-estado` v1. Scripts de medição no scratchpad da sessão.

## Contrato de saída — os números

### Interpretadores

| Opção | 20 execuções | **Por execução** |
|---|---|---|
| shell (`/bin/sh`) + **duas** chamadas `jq` | 0,808 s | **~40 ms** |
| Node (`node script.mjs`) | 0,877 s | **~44 ms** |
| **uma única** chamada `jq` (sem shell wrapper) | 0,077 s | **~4 ms** |

### Chamadas ao versionador (no repositório Expx, ~111 entradas em node_modules)

| Comando | 20 execuções | **Por execução** |
|---|---|---|
| `git rev-parse --abbrev-ref HEAD` | 0,314 s | **~16 ms** |
| `git status --porcelain` | 0,405 s | **~20 ms** |
| `git diff --quiet` | 0,347 s | **~17 ms** |

## Limites e cotas

O orçamento é "bem abaixo de 200 ms", e o contrato lembra que estourar não atrasa a barra — **apaga** a barra (`docs/contrato/CONTRATO-expx-estado.md`, e https://code.claude.com/docs/en/statusline: "Claude Code cancels the in-flight script").

Composição das somas plausíveis, com os números acima:

| Composição | Estimativa |
|---|---|
| shell + 1 `jq` + branch + dirty | ~40 + 16 + 20 = **~76 ms** |
| shell + 2 `jq` + branch + dirty | ~40 + 4 + 36 = **~80 ms** |
| Node + branch + dirty | ~44 + 36 = **~80 ms** |
| shell + 1 `jq`, **sem** git | **~44 ms** |

**Nenhuma das composições chega perto de 200 ms nesta máquina.** A margem existe, mas o git consome quase metade dela — e é justamente a parte que degrada em repositório grande.

Observação que muda o desenho: o custo dominante não é o parse, é **o número de processos criados**. Duas chamadas `jq` custam quase o mesmo que uma (4 ms cada), enquanto cada `git` custa 16-20 ms. Otimizar o parser é irrelevante; reduzir chamadas ao git é o que importa.

`git status --porcelain` (~20 ms) resolve branch e sujeira, mas **não dá o nome do branch**. `git rev-parse --abbrev-ref HEAD` + `git diff --quiet` (~33 ms) dá os dois. Alternativa a avaliar na F3: `git status --porcelain=v2 --branch`, que traz branch e sujeira numa chamada só.

## Erros conhecidos e tratamento

- **`jq` não é garantido.** Está presente nesta máquina (`/usr/bin/jq`), mas não faz parte do macOS base nem de toda distro Linux. O script é **commitado e viaja para a máquina de todo o time** (`docs/contrato/CONTRATO-expx-estado.md` + `src/cli/projeto.ts:29-33`). Um script que depende de `jq` quebra silenciosamente para quem não o tem — e "quebra" aqui significa barra em branco, sem mensagem (a doc: "Scripts that exit with non-zero codes or produce no output cause the status line to go blank").
- **Node é garantido pelo próprio CLI.** `package.json:engines` exige `node >=20.19.0`, e o CLI que instala a barra é Node. Quem tem o `expx` instalado tem Node — não é premissa, é pré-requisito já vigente.
- `python3` também está presente nesta máquina, mas não é pré-requisito de nada no projeto.
- No Windows, o `command` roda via Git Bash ou PowerShell (https://code.claude.com/docs/en/statusline). Um `.sh` depende de Git Bash estar instalado; um `.mjs` chamado por `node` não depende.

## Riscos para a nossa implementação

1. **A decisão antecipada "escrito em shell para não depender de runtime" se inverte quando medida.** Shell não elimina dependência de runtime: troca a dependência de Node (garantida, versionada, pré-requisito do CLI) pela dependência de `jq` (não garantida, não versionada, não verificável no momento da instalação) mais Git Bash no Windows. O próprio pedido prevê essa saída: "Se a F1 mostrar que isso compromete a robustez do parse, a alternativa aceita é Node". A F1 mostra — e o custo é ~4 ms, dentro do ruído.
2. Um shell sem `jq` teria de fazer parse de JSON à mão, que é exatamente o que o pedido proíbe ("parser de verdade, nunca por extração de texto").
3. O caminho intermediário — shell que detecta `jq` e cai para Node — soma o pior dos dois: duas implementações do mesmo render, duas superfícies de bug, e um `sh` a mais de overhead.
4. As chamadas ao git precisam de `timeout` curto, como o pedido já exige. Não há `timeout(1)` no macOS base — o padrão portável é rodar em background e matar, ou aceitar o risco. **Ponto a decidir na F3.**
5. Todos estes números são de uma máquina rápida com o repositório em disco local. O critério de aceite deve medir, não assumir.

## Fonte

Medições próprias em 2026-08-30 (scripts no scratchpad da sessão); `package.json:engines`; https://code.claude.com/docs/en/statusline — acessado em 2026-08-30
