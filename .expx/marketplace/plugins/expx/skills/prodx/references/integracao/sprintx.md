# Integração — sprintx

O sprintx planeja e executa features novas, F1 a F6. Recebe do prodx os pedidos classificados como `novo` ou `melhoria`.

## O que o prodx entrega ao sprintx

O `BRIEFING.md` é a **entrada da F1** (ingestão / base de conhecimento). O plano gerado referencia o `PD-ID` de origem.

O que o briefing carrega e que a F1 não teria de outro jeito:

- **o problema, não a solução pedida** (regra 4) — a F1 recebe o requisito real já destilado
- **o escopo mínimo aprovado** — a versão dez vezes menor, já decidida e assinada
- **o que está explicitamente fora** — evita que a F2 (descoberta) reabra escopo já recusado
- **os critérios de aceite do ponto de vista do negócio**

## A fronteira

O briefing **nunca contém decisão técnica** (regra 10). Arquitetura, camada e tecnologia são do sprintx.

O prodx também **não estima esforço**: isso é a F3.5, e depende do plano. Um briefing que chega com estimativa está invadindo o sprintx e deve ser corrigido.

## Divisão de responsabilidade

| Pergunta | Quem responde |
|----------|---------------|
| Vale fazer? | prodx |
| Já existe? | prodx |
| Qual é a menor versão que resolve? | prodx (escopo mínimo) |
| Como construir? | sprintx |
| Quanto custa? | sprintx, F3.5 |
| Em que ordem? | sprintx, F3 |

## Mapeamento de campos

| Campo do BRIEFING.md | Destino na F1 |
|----------------------|---------------|
| problema | descrição da feature |
| escopo mínimo aprovado | escopo |
| o que está fora | não-objetivos |
| critérios de aceite de negócio | critérios de aceite |
| PD-ID | `origem_prodx` no frontmatter do plano |

## Comportamento sem prodx instalado

O sprintx funciona igual. O `origem_prodx` é opcional; feature sem ele segue normalmente, com um aviso de uma linha de que não houve veredito assinado — **aviso, não bloqueio**.
