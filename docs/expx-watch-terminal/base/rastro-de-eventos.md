# Rastro de eventos — contrato `expx-eventos` v1 e `src/parser/esquema/evento.ts`

Segunda fonte primária do watch: alimenta a seção "eventos recentes" e o rodapé.

## Contrato de entrada

Caminho: `docs/eventos/<trabalho_id>.jsonl`. Append-only, uma linha JSON por evento. Escrito por hooks e pelas skills nas transições; **ninguém edita à mão** (`CONTRATO-expx-eventos.md`, seção "O rastro de eventos").

Já existe validador no repositório, `src/parser/esquema/evento.ts:121`:

```ts
export function validarRastro(conteudo: string): ResultadoRastro
// ResultadoRastro = { linhas: number; defeitos: DefeitoEvento[]; desconhecidas: string[] }
```

Recebe o **conteúdo inteiro** do arquivo como string e valida linha a linha. Também exporta o schema zod `LinhaEvento` (`evento.ts:69`) e os helpers `chavesFaltando` (`evento.ts:103`) e `chavesDesconhecidas` (`evento.ts:108`).

## Contrato de saída

As **doze chaves obrigatórias**, sempre todas, nesta ordem (`evento.ts:12-25`, espelhando o contrato):

`ts` · `expx_eventos` · `trabalho_id` · `ferramenta` · `origem` · `evento` · `fase` · `task` · `agente` · `resultado` · `detalhe` · `arquivos`

Chaves extras declaradas: `hook` (mergex, legadox) e `faixa` (legadox) — `evento.ts:32`.

Enums relevantes ao que o watch mostra:

- `evento` (`evento.ts:37-52`), 14 valores. Os que a especificação cita nominalmente: `suite_executada`, `arquivo_alterado`, `veredito_emitido`, `regra_violada`. Também disponíveis: `task_iniciada`, `task_concluida`, `task_bloqueada`, `fase_iniciada`, `fase_concluida`, `acao_bloqueada`, `agente_iniciado`, `agente_concluido`, `commit_criado`, `pr_aberto`.
- `agente` (`evento.ts:54-64`), 9 valores. `principal` é o valor quando não há subagente — **nunca `null`**, porque "foi o principal" é informação, não ausência (contrato, seção "Valores de `agente`"). Isso resolve o "com agente, quando houver" da especificação: sempre há.
- `origem` (`evento.ts:35`): `hook` | `skill` | `agente`.
- `ferramenta`: seis valores — `sprintx`, `runx`, `mergex`, `legadox`, `stackx`, `memox`. **Não confundir com `expx_tool`**, que só aceita `sprintx` e `runx`; o contrato alerta que tratá-los como o mesmo enum "rejeita o rastro de quatro skills".

`ts` é `AAAA-MM-DDTHH:MM:SSZ`, UTC, validado por regex (`evento.ts:66-68`). **É a única fonte com granularidade de hora no método** — o frontmatter só tem datas. O rodapé "tempo desde o último evento" depende disso.

## Limites e cotas

- **Rotação acima de 5 MB**: o arquivo vira `<trabalho_id>.1.jsonl` e um novo começa. O contrato diz explicitamente: "o painel lê os dois". Implementado em `nucleo/hooks/expx-rastro.sh:210-215`.
- Rastro **ignorado pelo versionador** por padrão: é local da máquina de quem executou e cresce rápido.
- `NÃO DOCUMENTADO`: quantas linhas o painel/watch deve manter em memória, e se há limite de leitura. O contrato não fixa número.
- `NÃO DOCUMENTADO`: quantos arquivos rotacionados coexistem — o hook só gera `.1.jsonl`, sem `.2`, `.3`; um segundo estouro sobrescreve o `.1` (`expx-rastro.sh:215`, `mv -f`).

## Erros conhecidos e tratamento

`validarRastro` nunca lança:

| Condição | Comportamento | Evidência |
|---|---|---|
| Linha em branco | ignorada, não conta | `evento.ts:127` |
| JSON inválido | `defeito` "JSON invalido", segue para a próxima | `evento.ts:133-136` |
| Linha não é objeto | `defeito`, segue | `evento.ts:137-140` |
| Chave obrigatória omitida | `defeito` citando R6, segue | `evento.ts:143-149` |
| Chave não declarada | vai para `desconhecidas` — **aviso, não erro** | `evento.ts:108-111`, `evento.ts:150` |
| Validação zod falha | `defeito` com caminho e mensagem | `evento.ts:152-161` |

O schema usa `.passthrough()` (`evento.ts:85`) e a verificação é por **contenção, nunca igualdade de conjunto** (`evento.ts:96-101`). O comentário registra que um validador estrito "passou a reprovar toda linha da mergex e da legadox".

O `doctor` já consome isso em `src/doctor/verificadores.ts:205-259`, sempre como **aviso, nunca erro**, com a justificativa: "um `doctor` que reprova a instalação por causa de linha antiga em disco é um doctor que as pessoas param de rodar".

## Riscos para a nossa implementação

1. **`validarRastro` valida, mas não devolve os eventos.** `ResultadoRastro` (`evento.ts:113-117`) tem `linhas: number`, `defeitos[]` e `desconhecidas[]` — **nenhum campo com as linhas parseadas**. Para exibir "as últimas linhas do rastro em ordem inversa", o watch precisa de uma função nova de leitura que devolva `LinhaEvento[]`. O schema zod (`LinhaEvento`, `evento.ts:69`) e os enums são reaproveitáveis integralmente; o leitor não existe.

2. **Ler o arquivo inteiro para mostrar as últimas N linhas.** `validarRastro` recebe a string completa (`evento.ts:121`). Com rotação em 5 MB, o pior caso é ler 5 MB a cada mudança do rastro. A especificação proíbe "varredura periódica cega", mas não resolve o custo por evento. `NÃO DOCUMENTADO`: qualquer estratégia de leitura só do fim do arquivo (tail) — nenhuma existe no repositório.

3. **"Violações em modo aviso acumuladas na sessão" (rodapé) NÃO são as `Violacao` da conformidade.** São duas coisas homônimas e de fontes distintas:
   - rodapé pedido → `evento: regra_violada` no rastro, gravado por hook em modo aviso (contrato, tabela de eventos);
   - `Violacao` de `src/parser/conformidade/regras.ts:17-28` → dez tipos de defeito do método encontrados **nos arquivos do plano** (`teste_ausente`, `bloqueio_antigo`, `ciclo_dependencia`, ...).
   Confundi-las produz um número errado no rodapé. Além disso, "acumuladas **na sessão**" não tem definição no método: o rastro é append-only e não marca fronteira de sessão. Ver lacuna L-03.

4. **Rastro ausente é o caso comum, não a exceção.** O arquivo é gitignorado e local. A tolerância a falha "rastro ausente mostra a árvore sem a seção de eventos" será o caminho mais percorrido em projeto recém-clonado.

5. **Dois arquivos a ler por trabalho** (`<id>.jsonl` e `<id>.1.jsonl`), com ordenação entre eles: o `.1` é o mais **antigo**. Inverter isso mostra o rastro fora de ordem justamente após uma rotação.

## Fonte

`docs/contrato/CONTRATO-expx-eventos.md` (221 linhas, íntegro), `src/parser/esquema/evento.ts`, `src/doctor/verificadores.ts:205-259`, `nucleo/hooks/expx-rastro.sh:189-222` — lidos em 2026-08-30
