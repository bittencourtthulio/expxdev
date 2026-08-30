# Convenções do método Expx — documento raiz

Este é o documento raiz. As regras abaixo valem para **todo** artefato do método:
frontmatter YAML, linha do rastro de eventos, configuração de hook, frontmatter de
agente.

Os contratos derivados — `CONTRATO-expx-schema-v1.md` e `CONTRATO-expx-eventos.md` —
**não repetem estas regras**. Eles as citam por número: "regra R3", "regra R6". Quem
precisar mudar uma convenção muda aqui, uma vez.

**Referencie sempre com o prefixo `R`.** Existe numeração histórica sem prefixo, herdada
da v1 do `expx-schema`, e ela não coincide com esta. Uma citação a "regra 6", sem `R`,
é ambígua e deve ser corrigida para `R6` quando encontrada.

---

## As convenções

### R1 — O bloco YAML é a primeira coisa do arquivo

Delimitado por `---` **antes e depois**. Nada acima dele: nem linha em branco, nem
comentário, nem título.

BOM é tolerado (o leitor o remove). Linha em branco antes do `---` de abertura
invalida o bloco.

### R2 — Toda chave em `snake_case`, minúscula, sem acento

`modulo_afetado`, nunca `móduloAfetado` nem `modulo-afetado`.

Vale para chave de YAML e para chave de JSON no rastro.

### R3 — Todo valor de enum em minúscula e sem acento

`concluida`, nunca `Concluída`. `bloqueio`, nunca `Bloqueio`.

Vale só para campos de enum. Campo de texto livre — `titulo`, `objetivo`, `detalhe` —
é prosa em português e **leva acento normalmente**.

### R4 — Datas em ISO

Data simples: `AAAA-MM-DD`. Timestamp do rastro: `AAAA-MM-DDTHH:MM:SSZ`, sempre UTC.

**Obtenha a data do sistema**, nunca de memória:

```sh
date +%Y-%m-%d          # data
date -u +%Y-%m-%dT%H:%M:%SZ   # timestamp do rastro
```

Modelo de linguagem não sabe que dia é hoje. Data escrita de memória é o erro mais
comum e o mais silencioso do método.

### R5 — Booleanos `true` / `false`, sem aspas

`true`, nunca `"true"`, `sim`, `yes` ou `1`.

### R6 — Chave nunca omitida

Lista vazia é `[]`. Valor ausente é `null`. **A chave está sempre lá.**

A razão: o painel diferencia "não se aplica" de "esqueceram de escrever". Omitir a
chave apaga essa diferença.

**Chave omitida é violação do método, não rejeição do arquivo.** O arquivo continua
sendo lido e aparece no painel com o defeito à vista. Rejeitar faria o trabalho sumir
da tela justamente quando ele tem um problema — o oposto do que o painel serve para
fazer. (Decide a lacuna L-05.)

Duas consequências para quem implementa leitor:

- campo obrigatório ausente → o leitor aceita, marca violação `chave_omitida`
- campo ausente **não** é preenchido com valor padrão em silêncio; um `[]` que veio
  do arquivo e um `[]` que o leitor inventou são coisas diferentes

### R7 — O frontmatter é a única fonte para a máquina

A prosa abaixo do bloco YAML é para humano e pode dizer o que quiser. Nenhum leitor
extrai informação dela.

### R8 — Campos de texto são de uma linha

Nada de prosa longa duplicada no YAML. Se precisa de parágrafo, ele vai na prosa
abaixo do bloco, e o YAML carrega só o resumo de uma linha.

### R9 — `atualizado_em` é reescrito a cada gravação

Todo artefato com estado carrega `atualizado_em` e o atualiza sempre que é gravado,
mesmo que só um campo tenha mudado.

### R10 — Nenhum caminho absoluto em nenhum valor

Caminho é sempre relativo à raiz do repositório: `src/frete/calculo.ts`, nunca
`/Users/alguem/projeto/src/frete/calculo.ts`.

Caminho absoluto vaza o nome de usuário da máquina, quebra ao trocar de máquina e
polui o diff. (Regra que existia só na `mergex`; promovida a universal.)

### R11 — Ausente é `null`, e só

Em YAML e JSON, ausência se escreve `null`. Não use `n/a`, `-`, `""` ou `nenhum`.

Em **prosa** — checklist, tabela de relatório — a marca de ausência é `n/a`, escrita
por extenso. São dois vocabulários porque são dois meios; não os misture.

### R12 — Ids

| Artefato | Formato | Exemplo |
|---|---|---|
| Task | `T-NN.MM` | `T-01.02` |
| Fase | `F-NN.M` | `F-01.1` |
| Sprint | `sprint-NN` | `sprint-01` |
| Bloqueio | `B-NN` | `B-01` |
| Decisão | `D-NN` | `D-07` |
| Ocorrência | `OC-AAAA-NNNN` | `OC-2026-0142` |

O id de fase é `F-NN.M`, com a parte decimal. `F-01` sozinho é forma antiga e não
deve ser gerado.

### R13 — Idioma

Prosa em português do Brasil, com acento. Identificador — nome de chave, valor de
enum, nome de arquivo, nome de agente, nome de hook — em português sem acento, por
R2 e R3.

Texto dentro de SVG segue a regra do identificador (sem acento): o renderizador de
fonte do navegador nem sempre tem o glifo acentuado.

### R14 — Encoding UTF-8, sem BOM

Todo arquivo do método é UTF-8. Não escreva BOM; leitores devem tolerá-lo na entrada.

---

## Como citar

No código e nos contratos derivados, cite pelo identificador com prefixo:

```ts
/** Data ISO (R4). O gray-matter resolve escalar de data como Date... */
```

```sh
# Chave nunca omitida (R6): use null.
```

Não reescreva o texto da regra no ponto de uso. Um resumo em prosa vira uma segunda
fonte que envelhece — foi exatamente assim que o `CONTRATO-expx-eventos.md` passou a
citar quatro das nove regras e perder as outras cinco.

## Onde cada domínio é definido

| Domínio | Documento | O que define |
|---|---|---|
| Convenções | **este arquivo** | R1–R14, válidas em todo lugar |
| Frontmatter de estado | `CONTRATO-expx-schema-v1.md` | os `kind`, seus campos e enums |
| Rastro de eventos | `CONTRATO-expx-eventos.md` | a linha JSONL, seu vocabulário |
| Hooks | `CONTRATO-expx-eventos.md` | mecânica, modos, regras de hook |
| Agentes | `CONTRATO-expx-eventos.md` | frontmatter e ferramentas por agente |

## Histórico

| Data | Mudança |
|---|---|
| 2026-08-29 | Documento criado. Consolida as nove regras universais do `expx-schema` v1, promove a R10 (caminho absoluto) que existia só na `mergex`, e acrescenta R11–R14, que viviam espalhadas por skills e decisões. Decide a lacuna L-05 na R6. |
