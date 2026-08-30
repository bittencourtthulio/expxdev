# Painel Expx — estado, API e o ponto onde a memória entra

## Contrato de entrada

O painel lê uma raiz de projeto do disco. Nada mais entra: não há POST, não há autenticação, não há banco.

`criarServidor(op: OpcoesServidor)` (`src/servidor/http.ts`) recebe:

| Campo | Tipo | Papel |
|---|---|---|
| `raiz` | string | pasta observada |
| `porta` | número | `0` = porta livre |
| `diasBloqueio` | número opcional | padrão `7` |
| `estaticos` | string opcional | build da UI; ausente = só API |

O estado é montado por `lerEstado` (`src/servidor/estado.ts`), que chama `montarProjeto(raiz, agora)` e acrescenta `violacoes`. `lerEstado` relê **o projeto inteiro** a cada mudança — decisão D-27, justificada no próprio arquivo: "as regras de conformidade cruzam referências entre arquivos, então uma visão parcial produziria violação falsa".

## Contrato de saída

`EstadoPainel = Projeto & { violacoes: Violacao[] }`. O tipo `Projeto` (`src/parser/projeto/montar.ts`):

```
raiz, trabalhos[], bloqueios[], historico[], rejeicoes[], lido_em
```

O espelho na UI é `ui/src/tipos.ts` (`export type Estado`), com o comentário: "Espelho dos tipos que a API serve. A UI não recalcula nada: só renderiza."

### Rotas HTTP (`src/servidor/http.ts`)

| Rota | Corpo |
|---|---|
| `/api/projeto` | o `EstadoPainel` inteiro |
| `/api/conformidade` | `{ violacoes }` |
| `/api/rejeicoes` | `{ rejeicoes }` |
| `/api/historico` | `{ historico }` |
| `/api/saude` | `{ ok, raiz, lido_em }` |
| `/relatorio`, `/relatorio.md` | relatório do histórico como HTML/markdown |

Todas as rotas são GET. Qualquer outro método devolve `405` com `{ erro: "o painel e somente leitura" }`.

O padrão é claro: **cada rota `/api/<coisa>` devolve um objeto com uma chave nomeada**, exceto `/api/projeto`, que devolve o estado cru.

### Difusão ao vivo

`iniciarPainel` (`src/servidor/painel.ts`) junta HTTP + observador + websocket em `/ws`. A cada mudança de disco, `servidor.recarregar()` remonta o estado e `difundir` envia **o estado inteiro** a todos os clientes: `JSON.stringify({ tipo: "estado", estado })`. Decisão D-28, justificada no arquivo: "mandar tudo elimina a classe de bug em que servidor e tela discordam depois de uma mensagem perdida."

Consequência direta para esta feature: **tudo que entrar no `EstadoPainel` é retransmitido inteiro a cada alteração de arquivo no projeto.** O tamanho do payload não é detalhe.

## Limites e cotas

- Bind fixo em `127.0.0.1` (`const HOST = "127.0.0.1"`, `http.ts`). O comentário é explícito: "Não há flag, variável de ambiente ou opção que mude o bind", porque o painel serve documentação sem autenticação.
- Debounce do observador: padrão `300 ms` (`observador.ts`, parâmetro `debounceMs = 300`), com `awaitWriteFinish.stabilityThreshold = max(50, debounceMs/3)`.
- O observador ignora `node_modules`, `.git` e `dist` via regex (`observador.ts`). **Não ignora `.expx`.**
- `diasBloqueio` padrão: `7` (`http.ts`).

## Erros conhecidos e tratamento

- **YAML truncado por leitura durante gravação.** Documentado no `observador.ts`: "as skills gravam `tasks.md` a cada transição de task, e ler o arquivo no instante da gravação produz YAML truncado — uma rejeição transitória que apareceria e sumiria da tela". A defesa é o debounce + `awaitWriteFinish`.
- **Arquivo fora do schema.** Vai para `rejeicoes[]` e aparece na tela "Fora do schema", em vez de derrubar a montagem.
- **Erro do observador** (permissão, limite de watchers) não derruba o painel: `watcher.on("error", () => undefined)`.
- **Mensagem malformada no websocket** não derruba a tela: o `try/catch` em `ui/src/estado/cliente.ts` comenta "mensagem malformada não derruba a tela".
- **Conexão caída fica visível** (decisão D-29): "uma tela congelada mostrando dado velho é pior que um erro à mostra".

A doutrina do painel inteiro é: **degradar mostrando, nunca quebrar**.

## Riscos para a nossa implementação

1. **Payload do websocket.** Estado inteiro a cada mudança. Um índice de memox completo (com `por_termo` e `trabalhos`) inflaria cada difusão. Servir a memória enxuta é requisito, não otimização.
2. **`.expx/` não é ignorado pelo observador.** Reindexar grava em `.expx/memoria/`, o que dispara o observador, que recarrega o estado, que relê o índice — e, se a reindexação for disparada por mudança em `docs/`, há risco de laço de recarga. Precisa ser avaliado na descoberta.
3. **Releitura total a cada mudança.** Ler e parsear o índice a cada recarga acrescenta custo ao caminho quente. O índice é um único JSON, então o custo é um `readFileSync` + `JSON.parse`.
4. **A UI não recalcula nada.** Regra declarada em `tipos.ts`. Toda derivação (ordenar, contar, classificar risco) tem que acontecer no servidor, não na tela.
5. **`historico` do painel e `trabalhos` do memox se sobrepõem.** Servir os dois inteiros duplica informação no mesmo payload.

## Fonte

- `src/servidor/http.ts`, `src/servidor/estado.ts`, `src/servidor/painel.ts`, `src/servidor/observador.ts` — acessados em 2026-08-29
- `src/parser/projeto/montar.ts` — acessado em 2026-08-29
- `ui/src/tipos.ts`, `ui/src/estado/cliente.ts` — acessados em 2026-08-29
