import { descobrirRaiz } from "./fontes/raiz.js";
import { ajudaWatch, interpretarOpcoes } from "./opcoes.js";
import { criarRestaurador } from "./terminal/restaurar.js";
import { corAtiva, ambienteAtual } from "./desenho/cor.js";
import { renderInkApp } from "./ink/raiz.js";
import { executarWatch } from "./watch.js";

/**
 * O `expx watch` como comando: junta opções, terminal e loop.
 *
 * Segue o padrão de saída injetável de `src/cli/expx.ts` — capturar
 * `process.stdout` global vaza entre testes paralelos e produz falha
 * intermitente, e a alternativa adotada pelo projeto é receber a saída.
 */

export type SaidaWatch = {
  escrever: (texto: string) => void;
  escreverErro: (texto: string) => void;
};

export async function principalWatch(
  argv: readonly string[],
  saida: SaidaWatch,
  raizPedida?: string,
): Promise<number> {
  const r = interpretarOpcoes(argv);
  if (!r.ok) {
    saida.escreverErro(`${r.erro}\n\n${ajudaWatch()}\n`);
    return 1;
  }
  if (r.opcoes.ajuda) {
    saida.escrever(`${ajudaWatch()}\n`);
    return 0;
  }

  const raiz = raizPedida ?? descobrirRaiz();

  // A cor sai por `stdout.isTTY` SOZINHO — em `expx watch | less` o stdin
  // continua TTY, e usar o `ehInterativo()` do CLI sujaria o arquivo.
  const amb = ambienteAtual();
  const cor = corAtiva(amb);

  // Controle de cursor é coisa de terminal, e é governado por `isTTY`, não
  // por cor: com `NO_COLOR` num terminal de verdade o cursor ainda precisa
  // ser escondido e restaurado. Com a saída redirecionada, nenhum escape pode
  // sair — nem esse, que foi o único a vazar para o arquivo na primeira
  // versão.
  const restaurador = criarRestaurador({
    escrever: amb.tty ? saida.escrever : () => undefined,
    sair: (codigo) => {
      process.exit(codigo);
    },
  });

  // TTY real decide o motor — nunca uma flag de usuário (ver `watch.ts`).
  // `--todos` é sempre o motor antigo mesmo com TTY: `executarWatch` já
  // aplica essa exceção, então basta pedir Ink quando há terminal.
  const usarInk = amb.tty;

  const sessao = await executarWatch({
    raiz,
    opcoes: r.opcoes,
    escrever: saida.escrever,
    cor,
    usarInk,
  });

  // Projeto sem `.expx/`: a mensagem já foi escrita e não há o que observar.
  if (sessao.encerrou) return sessao.codigo;

  // A restauração cobre os quatro caminhos de saída (decisão D-21), nos dois
  // motores. O controle de CURSOR diverge: o Ink já esconde e restaura o
  // cursor sozinho ao montar/desmontar (via `cli-cursor`), então só o motor
  // antigo pede isso ao restaurador — pedir os dois duplicaria o escape.
  restaurador.registrar();

  if (sessao.store !== undefined) {
    renderInkApp(sessao.store, {
      ...(sessao.colunas !== undefined ? { colunas: sessao.colunas } : {}),
      ...(sessao.arvore !== undefined ? { arvore: sessao.arvore } : {}),
    });
  } else if (amb.tty) {
    restaurador.esconderCursor();
  }

  // O chokidar segura o event loop: o processo fica vivo até o sinal chegar.
  return 0;
}
