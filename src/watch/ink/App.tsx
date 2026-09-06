import React, { useSyncExternalStore } from "react";
import { Box, useApp, useInput, useStdout } from "ink";
import type { StoreVisao } from "./estadoExterno.js";
import { usePulso } from "./hooks/usePulso.js";
import { useNavegacaoFrota } from "./hooks/useNavegacaoFrota.js";
import { alturaDisponivel, orcarAltura } from "../logica/altura.js";
import { BarraStatus } from "./componentes/BarraStatus.js";
import { Bloqueios } from "./componentes/Bloqueios.js";
import { Cabecalho } from "./componentes/Cabecalho.js";
import { Detalhe } from "./componentes/Detalhe.js";
import { ListaFrota } from "./componentes/ListaFrota.js";
import { SemTrabalho } from "./componentes/SemTrabalho.js";

/**
 * O painel Ink como APLICAÇÃO de terminal, não como saída de comando.
 *
 * A versão anterior empilhava cards com borda, um por trabalho, e emendava
 * atividade e rodapé embaixo. Funcionava como relatório e falhava como
 * painel: cada trabalho tinha o mesmo peso visual, a altura crescia com a
 * frota, e o que estava rodando agora saía da tela assim que havia três
 * trabalhos abertos. Era uma lista, não uma tela.
 *
 * A troca é layout de regiões fixas, que é o que faz uma TUI ler como
 * aplicação:
 *
 *   ┌──────────────────────────────────────────┐
 *   │ expx watch          régua do projeto     │  cabeçalho (âncora)
 *   ├───────────────┬──────────────────────────┤
 *   │ FROTA         │ o trabalho selecionado:  │
 *   │ ▌ trabalho a  │ pipeline, balanço,       │  corpo (duas colunas)
 *   │   trabalho b  │ execução, atividade      │
 *   ├───────────────┴──────────────────────────┤
 *   │ ↑↓ trabalho  ⏎ plano  q sair    saúde    │  barra de status
 *   └──────────────────────────────────────────┘
 *
 * A esquerda dá a visão da frota inteira em altura fixa por trabalho; a
 * direita dá profundidade sobre UM. Bloqueio aberto rompe o layout e sobe
 * para o topo — é a única coisa mais urgente que a estrutura.
 *
 * Interatividade: `↑`/`↓`/`j`/`k` trocam o trabalho; `Enter`/`→`/`←` alternam
 * a árvore do plano; `q` sai. `arvore` (a flag `--arvore`) só decide o estado
 * INICIAL, para não haver dois donos do mesmo estado.
 */

/** Abaixo disto não cabem duas colunas: a direita ficaria ilegível. */
const LARGURA_MINIMA_DUAS_COLUNAS = 100;
/** Quanto da largura a lista da frota ocupa, quando há duas colunas. */
const LARGURA_LISTA = 34;

export function App({
  store,
  pulsoMs = 1000,
  colunas,
  linhas,
  arvore = false,
}: {
  store: StoreVisao;
  pulsoMs?: number;
  colunas?: number;
  /**
   * Altura fixa, como `colunas` é para a largura. Existe pelo mesmo motivo:
   * tornar o layout verificável sem TTY de verdade — é o que permite testar
   * que o painel nunca atinge `stdout.rows` (ver `logica/altura.ts`).
   */
  linhas?: number;
  arvore?: boolean;
}): React.ReactElement {
  const visao = useSyncExternalStore(store.inscrever, store.obter);
  const agora = usePulso(pulsoMs);
  const { exit } = useApp();
  const { stdout } = useStdout();

  const { selecionado, expandido } = useNavegacaoFrota(visao.frota.length);
  const arvoreVisivel = expandido || (arvore && selecionado === 0);

  useInput((input) => {
    if (input === "q") exit();
  });

  // Ink já observa resize nativamente; a prop `colunas` (de `--colunas`)
  // continua tendo prioridade explícita quando informada.
  const largura = colunas ?? stdout?.columns;

  // A ALTURA é tão obrigatória quanto a largura, por um motivo que só aparece
  // em janela baixa: o Ink troca o redesenho no lugar por `clearTerminal`
  // assim que o quadro atinge `stdout.rows`, e o painel passa a se empilhar a
  // cada pulso enquanto a pessoa redimensiona (ver `logica/altura.ts`).
  const altura = alturaDisponivel(linhas ?? stdout?.rows);

  if (visao.frota.length === 0) {
    return (
      <Box flexDirection="column" {...(largura !== undefined ? { width: largura } : {})}>
        <Cabecalho frota={visao.frota} largura={largura} />
        <SemTrabalho />
      </Box>
    );
  }

  const atual = visao.frota[selecionado ?? 0] ?? visao.frota[0]!;

  // Quanto cabe de cada seção elástica nesta janela.
  const orcamento = orcarAltura(altura, atual.ativas.length, 6);

  // Uma coluna só quando a janela é estreita: espremer o detalhe em 40
  // colunas quebra cada linha em três e desmonta o alinhamento que o layout
  // existe para dar. Abaixo do limite, a lista some e fica só o detalhe do
  // selecionado — a navegação continua funcionando.
  const duasColunas = largura === undefined || largura >= LARGURA_MINIMA_DUAS_COLUNAS;

  return (
    <Box
      flexDirection="column"
      {...(largura !== undefined ? { width: largura } : {})}
    >
      <Cabecalho frota={visao.frota} largura={largura} />

      {/* Bloqueio aberto é a única coisa que rompe o layout: exige decisão
          humana e não pode esperar a pessoa navegar até o trabalho certo. */}
      <Bloqueios bloqueios={visao.bloqueiosAbertos} agora={agora} largura={largura} />

      <Box>
        {duasColunas ? (
          <ListaFrota
            frota={visao.frota}
            agora={agora}
            selecionado={selecionado}
            largura={LARGURA_LISTA}
          />
        ) : null}

        {/* A largura do detalhe é CALCULADA, não deixada a `flexGrow`: as
            linhas que alinham à direita (situação, hora do evento, tempo
            decorrido) precisam de uma largura conhecida para colar na borda,
            e `flexGrow` só a resolve depois de medir o conteúdo. */}
        <Detalhe
          trabalho={atual}
          agora={agora}
          estado={visao.estado}
          expandido={arvoreVisivel}
          orcamento={orcamento}
          largura={
            largura === undefined ? undefined : duasColunas ? largura - LARGURA_LISTA : largura
          }
        />
      </Box>

      <BarraStatus
        eventos={visao.eventos}
        violacoesAviso={visao.violacoesAviso}
        degradado={visao.degradado}
        agora={agora}
        largura={largura}
        compacta={orcamento.apertado}
      />
    </Box>
  );
}
