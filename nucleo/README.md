# Núcleo compartilhado

O que as skills do método precisam ter **igual**, escrito uma vez só.

## O que tem aqui

| Arquivo | O que é |
|---|---|
| `hooks/expx-rastro.sh` | O rastro de eventos, os modos de hook e o `trabalho_id` |

## Como chega até um projeto

Por **cópia**, nunca por dependência.

Nenhum dos repositórios de skill tem `package.json` — eles são plugins
instalados sozinhos, e cada projeto precisa rodar de forma independente. Uma
biblioteca importada em tempo de execução quebraria exatamente isso.

Então: a fonte é este diretório, o `expx init` copia (`montarPlugin` leva
`nucleo/` junto com o plugin), e o que chega ao projeto é um arquivo em disco.
Sem `npm install`, sem runtime compartilhado, sem rede.

## Como usar num hook

A ferramenta é **parâmetro**, definido antes do `source`:

```sh
EXPX_FERRAMENTA=mergex
. "$(dirname "$0")/../nucleo/hooks/expx-rastro.sh"

MODO="$(expx_modo "$RAIZ" git-perigoso seguranca)"
[ "$MODO" = "desligado" ] && exit 0

expx_rastro_grava "$RAIZ" acao_bloqueada hook bloqueado "commit na main" '[]' \
  '"hook":"git-perigoso"'
```

Variáveis que o rastro lê, todas opcionais:

| Variável | Efeito |
|---|---|
| `EXPX_FERRAMENTA` | o campo `ferramenta` da linha (**defina sempre**) |
| `EXPX_TRABALHO_ID` | vence a detecção automática |
| `EXPX_FASE` / `EXPX_TASK` | preenchem `fase` e `task` (JSON: com aspas) |
| `EXPX_AGENTE` | o subagente; sem ela, `principal` |

## Por que existe

Cada skill tinha a sua implementação do rastro — quatro no total, em duas
linguagens. Não eram cópias que divergiram: eram **reescritas**, porque o
`comum/rastro.sh` de cada repositório trazia o nome da ferramenta cravado no
código (`"ferramenta":"sprintx"`), e um arquivo que se identifica não pode ser
compartilhado.

E já divergiam em produção, antes mesmo de o painel ler o rastro:

- chave extra no meio do objeto, quebrando a verificação de uma skill irmã
- `agente` ora `null`, ora `"principal"`, para o mesmo caso
- três estratégias diferentes para descobrir o `trabalho_id`
- dois conjuntos de modos: uma skill não conhecia `desligado` e continuava
  rodando depois de alguém pedir para desligá-la
- um leitor de lock com o nome do arquivo errado, falhando em silêncio

## Adoção

Incremental, uma skill por vez. Uma skill migra quando trocar o `source` do seu
`comum/rastro.sh` por este arquivo e renomear as chamadas (`rastro_*` →
`expx_*`). Enquanto não migra, continua com a cópia própria — que é o ponto de
distribuir por cópia: nada quebra enquanto a migração não acontece.

O que garante que as duas não divirjam no meio do caminho é o validador:
`expx doctor` lê `docs/eventos/*.jsonl` e aponta toda linha fora do contrato,
seja qual for a implementação que a escreveu.

## Contratos

- [`CONVENCOES.md`](../docs/contrato/CONVENCOES.md) — R1 a R14, o documento raiz
- [`CONTRATO-expx-eventos.md`](../docs/contrato/CONTRATO-expx-eventos.md) — a linha do rastro, hooks e agentes
- [`CONTRATO-expx-schema-v1.md`](../docs/contrato/CONTRATO-expx-schema-v1.md) — o frontmatter de estado
