# Integração — runx

O runx trata ocorrências de manutenção, E1 a E5. É **o caminho mais comum** do prodx, porque hoje o pedido chega pelo suporte.

## O que o prodx entrega ao runx

### Caminho da avaliação completa

O `BRIEFING.md` vira o `00-OCORRENCIA.md` da ocorrência, já com duas coisas que o runx não teria como descobrir sozinho:

- **o tipo classificado** (`correcao`), confirmado no P2
- **o comportamento intencional verificado** (regra 7) — a garantia de que não se está corrigindo uma regra de negócio deliberada

O `00-OCORRENCIA.md` referencia o `PD-ID` de origem no frontmatter, e o E1 pode voltar ao `VEREDITO.md` para entender por que aquilo virou trabalho.

### Caminho da triagem

Pedido aprovado na triagem entrega **um briefing de uma linha, não um documento**:

```
PD-2026-0031 | correcao | botao Salvar desalinhado no mobile na tela de pedido | aprovado por: Thulio, 2026-03-04 | runx
```

Nenhum arquivo é criado. A linha do `INDICE.md` é a entrada. Criar sete arquivos para aprovar a correção de um rótulo é exatamente o atrito que faz o dev contornar o processo.

## Mapeamento de campos

| Campo do BRIEFING.md | Campo do 00-OCORRENCIA.md |
|----------------------|---------------------------|
| problema | descrição da ocorrência |
| escopo mínimo aprovado | escopo da correção |
| o que está fora | fora de escopo |
| critérios de aceite de negócio | critérios de aceite |
| PD-ID | `origem_prodx` no frontmatter |

## O que o prodx consome do runx

**Os relatórios de uso** — a melhor descrição existente do que o sistema faz na linguagem do cliente.

- **P1** usa para montar o mapa de funcionalidades.
- **P3** usa como quarto lugar de busca na verificação de existência. Funcionalidade obscura aparece ali descrita como o usuário a entende, não como o código a nomeia.

## Comportamento sem prodx instalado

O runx funciona igual. O `origem_prodx` é opcional; ocorrência sem ele segue normalmente, com um aviso de uma linha de que não houve veredito assinado — **aviso, não bloqueio**.
