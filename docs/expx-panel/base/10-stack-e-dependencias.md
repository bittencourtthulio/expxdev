# Stack e dependências

> Área interna: as decisões de stack já vieram fechadas no pedido da feature (bloco "RESPOSTAS ANTECIPADAS PARA A F2"). Este arquivo registra o que as fontes afirmam sobre cada peça, com os números verificados no registro npm em 2026-08-29.

## Contrato de entrada

Decisões fixadas pelo usuário, a serem registradas como decisões na F2:

| Item | Decisão |
|---|---|
| Pacote | npm público, escopo `@expx`, nome `@expx/painel` |
| Instalação | devDependency ou `npx` |
| Comando | `npx expx-painel`, flags `--porta` (padrão 4000), `--dir` (padrão `./docs`), `--no-open` |
| Linguagem | TypeScript strict em todo o projeto |
| Runtime | Node LTS, módulos ESM |
| Bind | **exclusivamente 127.0.0.1**, nunca 0.0.0.0, não configurável — decisão de segurança |
| Frontend | React, empacotado com Vite, servido como estático pelo servidor no build publicado |
| Ao vivo | websocket |
| Frontmatter | gray-matter + parser YAML |
| Observação | chokidar com debounce |
| Testes | Vitest |

**Nota sobre o nome**: o pacote é `@expx/painel` mas o comando é `expx-painel`. São coisas diferentes (nome do pacote × nome do binário em `bin`), o que é válido em npm; registrado para não ser tratado como inconsistência.

## Contrato de saída

`NÃO DOCUMENTADO` pelas fontes — o formato da API de leitura entre servidor e UI é decisão de projeto, a ser tomada no plano (F3).

## Limites e cotas

Versões atuais no registro npm, verificadas em 2026-08-29 via `npm view <pacote> version engines`:

| Pacote | Versão | Node exigido |
|---|---|---|
| `gray-matter` | 4.0.3 | `>=6.0` |
| `chokidar` | 5.0.0 | `>= 20.19.0` |
| `vitest` | 4.1.11 | `^20.0.0 \|\| ^22.0.0 \|\| >=24.0.0` |
| `vite` | 8.2.2 | `^20.19.0 \|\| >=22.12.0` |
| `zod` | 4.5.4 | não declarado no campo engines |

Node do ambiente de desenvolvimento atual: **v20.20.1** (`node --version`, 2026-08-29).

Dependências transitivas do `gray-matter` 4.0.3 (`npm view gray-matter dependencies`):

```
js-yaml: ^3.13.1
kind-of: ^6.0.2
section-matter: ^1.0.0
strip-bom-string: ^1.0.0
```

Última publicação do `gray-matter`: **2023-07-12** (`npm view gray-matter time.modified`).

## Erros conhecidos e tratamento

- **`gray-matter` embute `js-yaml` 3.x**, uma linha major anterior à atual (4.x). Isso importa por dois motivos concretos para este projeto:
  1. A **mensagem e a posição do erro** de YAML inválido vêm do js-yaml 3. A tela de "fora do schema" precisa apontar "o motivo da rejeição" e a violação precisa apontar "arquivo e linha quando possível" — a qualidade dessa informação depende do formato de erro dessa versão específica. `NÃO DOCUMENTADO` qual o formato exato; precisa ser verificado empiricamente contra as fixtures.
  2. `gray-matter` aceita um parser YAML customizado via a opção `engines`, o que permitiria usar js-yaml 4 ou outro parser sem trocar de biblioteca. `NÃO DOCUMENTADO` se é desejável.
- **`gray-matter` já remove BOM** (`strip-bom-string` é dependência direta), o que atenua o risco de BOM levantado em `01-regras-universais.md` (L-07).
- **`chokidar` 5 exige Node >= 20.19.0**; o ambiente atual (20.20.1) atende, mas por margem estreita dentro da linha 20.

## Riscos para a nossa implementação

- **Erro de YAML sem número de linha** quebraria o requisito "aponta o arquivo e a linha quando possível". A cláusula "quando possível" dá margem, mas a qualidade da tela depende disso. Verificar cedo, contra fixture de YAML inválido.
- **`gray-matter` sem manutenção desde 2023** não é um bloqueio — o formato de frontmatter é estável — mas concentra risco numa dependência parada. A camada de parser isolada (decisão de arquitetura já tomada) contém esse risco: trocar a biblioteca não deveria tocar servidor nem UI.
- **Validador de esquema em runtime não foi nomeado** pelo usuário: "validado em runtime com um validador de esquema" sem dizer qual. Zod 4.5.4 é o candidato natural mas é escolha em aberto — L-24.
- **Node LTS não foi fixado em versão**. `chokidar` 5 já corta abaixo de 20.19.0. O `engines` do `package.json` precisa de um número; qual, é decisão — L-25.
- **O bind em 127.0.0.1 vale também para o websocket e para o servidor de dev do Vite**, não só para o HTTP de produção. O Vite por padrão sobe em `localhost`, mas a decisão precisa valer nos dois ambientes.

## Fonte

- Pedido da feature (bloco "RESPOSTAS ANTECIPADAS PARA A F2"), transcrito nesta sessão — 2026-08-29
- `npm view gray-matter version engines dependencies time.modified` — acessado em 2026-08-29
- `npm view chokidar|vitest|vite|zod version engines` — acessado em 2026-08-29
- `node --version` no ambiente local — 2026-08-29
