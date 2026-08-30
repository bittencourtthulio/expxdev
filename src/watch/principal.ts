import { descobrirRaiz } from "./fontes/raiz.js";
import { ajudaWatch, interpretarOpcoes } from "./opcoes.js";
import { criarRestaurador } from "./terminal/restaurar.js";
import { corAtiva, ambienteAtual } from "./desenho/cor.js";
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

  const sessao = await executarWatch({
    raiz,
    opcoes: r.opcoes,
    escrever: saida.escrever,
    cor,
  });

  // Projeto sem `.expx/`: a mensagem já foi escrita e não há o que observar.
  if (sessao.encerrou) return sessao.codigo;

  // Só escondemos o cursor depois de saber que o watch vai mesmo rodar, e a
  // restauração cobre os quatro caminhos de saída (decisão D-21).
  restaurador.registrar();
  if (amb.tty) restaurador.esconderCursor();

  // O chokidar segura o event loop: o processo fica vivo até o sinal chegar.
  return 0;
}
