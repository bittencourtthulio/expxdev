# Atualização ao vivo — observação de arquivos e websocket

## Contrato de entrada

Requisito do pedido: "O painel observa a pasta `docs/` e atualiza a tela sozinho quando um arquivo muda, sem o usuário recarregar. Quando a skill marca uma task como concluída, o painel reflete em segundos."

Decisões já tomadas: chokidar com debounce, transporte por websocket.

O que o painel observa são arquivos gravados **pelas skills**. O comportamento de escrita delas, declarado nas fontes:

- `atualizado_em` é reescrito a cada gravação do arquivo (regra universal 9, nas três fontes). Todo arquivo tocado muda de conteúdo, sempre.
- Durante a execução (F6/E3), a skill marca tasks como concluídas uma a uma, gravando `tasks.md` a cada transição.
- As skills nunca reescrevem em massa e nunca migram pastas que não vão tocar (`sprintx:238-243`, `runx:360-368`). As gravações são pontuais.

## Contrato de saída

`NÃO DOCUMENTADO` pelas fontes: o formato da mensagem de websocket, se é o estado inteiro ou um delta, é decisão de projeto para a F3.

## Limites e cotas

- "em segundos" é o único número do requisito, sem valor exato. O debounce precisa ficar abaixo disso, mas nenhuma fonte declara quanto.
- `NÃO DOCUMENTADO`: número de clientes simultâneos. A v1 é local e monousuário, mas nada impede duas abas.

## Erros conhecidos e tratamento

Não há tratamento declarado nas fontes para nenhum destes casos:

| Caso | Consequência |
|---|---|
| Arquivo lido no meio de uma gravação da skill | YAML truncado → rejeição temporária, some na próxima leitura |
| Arquivo apagado enquanto o painel roda | trabalho some da tela |
| Pasta de trabalho nova criada com o painel rodando | precisa entrar na descoberta sem reiniciar |
| Websocket cai | tela congela mostrando estado velho sem avisar |

O primeiro caso é o mais provável e o mais incômodo: a skill grava `tasks.md` com frequência durante a execução, e uma leitura no instante errado produz uma rejeição que aparece na tela de "fora do schema" e desaparece sozinha. O debounce do chokidar existe justamente para isso, mas nenhuma fonte declara o valor.

## Riscos para a nossa implementação

- **Rejeição transitória por leitura durante gravação**: um arquivo válido aparecendo na tela de erro por meio segundo é, na prática, uma violação falsa — contraria a definição de pronto. O debounce e a releitura precisam absorver isso.
- **Reprocessar tudo a cada mudança** é simples e provavelmente rápido o bastante para dezenas de trabalhos, mas é a decisão que define se a arquitetura aguenta um `docs/` grande. Nenhuma fonte declara escala esperada.
- **A tela congelada com websocket caído** é pior que um erro visível, porque o usuário confia num estado velho. Nenhuma fonte pede indicador de conexão; vale levantar na F2.
- **Editor que grava por rename** (escreve temporário e renomeia) gera evento diferente de escrita direta no chokidar. As skills gravam via ferramentas de arquivo do harness — `NÃO DOCUMENTADO` qual estratégia usam.

## Fonte

- Pedido da feature (blocos "Atualização ao vivo" e "RESPOSTAS ANTECIPADAS"), transcrito nesta sessão — 2026-08-29
- `~/.claude/skills/sprintx/references/00-schema.md:29,238-243` — acessado em 2026-08-29
- `~/.claude/skills/runx/references/00-schema.md:29,360-368` — acessado em 2026-08-29
