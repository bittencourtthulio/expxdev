# Parser de artefatos do painel web (`src/parser/`)

> A pergunta que a F1 precisa responder: quanto do parser do painel web é reaproveitável sem refatoração?
> **Resposta curta: a camada inteira é reaproveitável sem nenhuma refatoração.** A evidência está abaixo.

## Contrato de entrada

Ponto de entrada único, em `src/parser/projeto/montar.ts:216`:

```ts
export function montarProjeto(raiz: string, agora: Date = new Date()): Projeto
```

- `raiz` — caminho de uma pasta a varrer. String. Obrigatório.
- `agora` — `Date` injetada, com padrão `new Date()`. Opcional.

Não recebe socket, request, response, porta nem qualquer objeto de servidor. A assinatura inteira é `(string, Date) => Projeto`.

A camada acima, `src/servidor/estado.ts:20`, acrescenta as violações:

```ts
export function lerEstado(op: OpcoesEstado, agora: Date = new Date()): EstadoPainel
// OpcoesEstado = { raiz: string; diasBloqueio: number }
```

Também sem nada de HTTP. O nome da pasta (`servidor/`) sugere acoplamento que o código não tem — `src/servidor/estado.ts:1-2` importa apenas de `../parser/`.

Cadeia completa de dependências, verificada por leitura de cada arquivo:

| Arquivo | Importa de | Toca rede/HTTP? |
|---|---|---|
| `src/parser/projeto/montar.ts` | `node:path`, `../descoberta/`, `../leitura/`, `../esquema/`, `../memoria/` | não |
| `src/parser/descoberta/trabalhos.ts` | `node:path`, `./varredura.js`, `../leitura/` | não |
| `src/parser/descoberta/varredura.ts` | `node:fs`, `node:path` | não |
| `src/parser/leitura/arquivo.ts` | `node:fs`, `./rejeicao.js` | não |
| `src/parser/esquema/*.ts` | `zod` | não |
| `src/servidor/estado.ts` | `../parser/projeto/montar.js`, `../parser/conformidade/regras.js` | não |

Nenhum arquivo do parser importa `node:http`, `ws` ou `../servidor/`. A dependência é de mão única: `servidor/` → `parser/`, nunca o contrário.

## Contrato de saída

`Projeto`, definido em `src/parser/projeto/montar.ts:78-97`. Os campos que o watch usa:

| Campo | Tipo | Serve a que parte do watch |
|---|---|---|
| `trabalhos` | `TrabalhoMontado[]` | cabeçalho, árvore, `--todos` |
| `bloqueios` | `BloqueioSituado[]` | seção de bloqueios |
| `rejeicoes` | `Rejeicao[]` | marcar "fora do schema" na tolerância a falha |
| `omitidas` | `ChaveOmitida[]` | idem |
| `lido_em` | `string` (ISO) | rodapé |
| `historico`, `memoria` | — | fora de escopo na v1 |

`TrabalhoMontado` (`montar.ts:36-45`) traz `trabalho_id`, `titulo`, `expx_tool`, `estagio`, `status`, `progresso` (fração 0..1), `sprints[]` e `bloqueios[]` — o cabeçalho pedido, menos raio/orçamento/branch/PR, que não vêm daqui (ver `estado-json.md`).

`SprintMontada` (`montar.ts:26-35`) → `fases: FaseMontada[]` + `tasks: TaskSituada[]`, cada uma com `progresso`. `FaseMontada` (`montar.ts:20-25`) traz `paralelizavel`, `paralela_com` e `tasks`. `TaskSituada` (`montar.ts:12-18`) traz `status`, `depende_de`, `paralelizavel`, `fase`.

Ou seja: **os três eixos da árvore pedida — sprint, fase, task — já vêm montados e aninhados**, com `depende_de` e `paralelizavel` por task, que é o que a especificação pede para "dependências compactas" e "paralelizável agrupado".

`BloqueioSituado` (`montar.ts:47-53`) traz `aberto: boolean` já calculado e `aberto_em` (data ISO) — o "há quanto tempo" da seção de bloqueios sai daí, com granularidade de DIA, não de hora (ver Riscos).

`Violacao` (`src/parser/conformidade/regras.ts:32-40`) traz `tipo`, `alvo`, `arquivo`, `linha`, `detalhe`.

## Limites e cotas

- Profundidade de varredura: 12 níveis, padrão de `varrerCandidatos` (`src/parser/descoberta/varredura.ts:56`).
- A varredura é por **nome exato de arquivo**, não por extensão — lista fechada de 15 nomes em `varredura.ts:26-42`.
- Pastas sempre ignoradas: `node_modules`, `.git`, `dist`, `.next`, `coverage` (`varredura.ts:44`).
- Releitura é **total, nunca incremental**, por decisão D-27 citada em `src/servidor/estado.ts:14-18`: as regras de conformidade cruzam referências entre arquivos, e uma visão parcial produziria violação falsa.
- `NÃO DOCUMENTADO`: custo em tempo/disco da varredura em projeto grande. Nenhum benchmark existe no repositório.

## Erros conhecidos e tratamento

O parser inteiro falha aberto — é a propriedade de que a tolerância a falha do watch depende:

| Condição | Comportamento | Evidência |
|---|---|---|
| Erro de I/O ao ler arquivo | vira `Rejeicao`, não exceção | `src/parser/leitura/arquivo.ts:11-21` |
| Pasta sumiu ou sem permissão | ignora e segue | `varredura.ts:63-67` |
| `statSync` falha num item | `continue` | `varredura.ts:71-76` |
| Pasta sem `ORQUESTRADOR.md` | ignorada em silêncio (D-12) | `trabalhos.ts:9-11` |
| Frontmatter inválido | `Rejeicao` com motivo e linha; o resto do projeto continua | `src/parser/leitura/rejeicao.ts` |
| Chave obrigatória omitida | **aceita** e marca `omitidas` — R6 manda violação, não rejeição | `montar.ts:236-247`, `CONVENCOES.md` R6 |
| Índice do memox corrompido | `memoria: null` (D-05) | `montar.ts:250-252` |

`NÃO DOCUMENTADO`: o que acontece se `montarProjeto` receber uma raiz inexistente. `varrerCandidatos` faz `readdirSync` dentro de `try/catch` (`varredura.ts:63-67`), o que sugere que devolveria projeto vazio em vez de lançar, mas nenhum teste no repositório afirma isso.

## Riscos para a nossa implementação

1. **Releitura total a cada mudança.** Confirmado por D-27 (`estado.ts:14-18`). A especificação exige "a árvore completa relida apenas quando os arquivos do plano mudam — não a cada redesenho". Compatível, porque o gatilho é a mudança e não o redesenho. Mas significa que o watch NÃO pode reler o plano ao receber uma linha nova no rastro, ou a promessa se perde: rastro e plano precisam de gatilhos separados.

2. **Granularidade de data dos bloqueios é o DIA.** `Bloqueio.aberto_em` é `DataIso` (`AAAA-MM-DD`, `src/parser/esquema/kinds.ts:120`), não timestamp. O "há quanto tempo" só pode ser expresso em dias a partir dessa fonte. Um bloqueio aberto há 20 minutos aparece como "há 0 dias". O rastro (`evento: task_bloqueada`) tem `ts` com hora e refinaria isso, ao custo de cruzar duas fontes.

3. **O nome `src/servidor/estado.ts` colide com o conceito `.expx/estado.json`.** Dois "estados" no mesmo projeto: `EstadoPainel` (o projeto lido do disco) e `expx-estado` (o arquivo de 1 KB da barra). Risco de confusão em toda a nomenclatura das tasks.

4. **`progresso` é fração 0..1, não "concluídas/total".** O cabeçalho pede "tasks concluídas sobre total". O par de inteiros não existe pronto no `TrabalhoMontado` — é derivável de `sprints.flatMap(s => s.tasks)`, mas é contagem nova, não campo existente.

5. **Nenhum risco de escrita.** O parser só faz `readFileSync`, `readdirSync` e `statSync`; nenhuma chamada de escrita existe em `src/parser/`. Isso satisfaz por construção a regra "somente leitura, sem exceção".

## Fonte

`src/parser/projeto/montar.ts`, `src/parser/descoberta/trabalhos.ts`, `src/parser/descoberta/varredura.ts`, `src/parser/leitura/arquivo.ts`, `src/parser/esquema/kinds.ts`, `src/parser/conformidade/regras.ts`, `src/servidor/estado.ts` — lidos em 2026-08-30
