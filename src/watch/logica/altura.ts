/**
 * Orçamento de altura: quantas linhas cada seção pode gastar.
 *
 * Existe por causa de um comportamento do Ink que só aparece em janela baixa
 * (`ink/build/ink.js`): quando o quadro renderizado tem altura MAIOR OU IGUAL
 * às linhas do terminal, o Ink desiste do redesenho no lugar e passa a
 * escrever `clearTerminal + saída` a cada atualização. Num painel que pulsa a
 * cada segundo isso empilha cópias do painel inteiro conforme a pessoa
 * redimensiona a janela — que foi exatamente o defeito observado.
 *
 * A defesa não é mexer no Ink: é o painel nunca pedir mais altura do que tem.
 * Este módulo distribui as linhas disponíveis entre as seções elásticas — a
 * atividade e as tasks ativas — preservando o que é fixo.
 */

/**
 * A margem de segurança sobre `stdout.rows`.
 *
 * Uma linha para a comparação do Ink ser `<` e não `>=`, e outra para o
 * prompt do shell que reaparece ao sair. Sem a segunda, o último redesenho
 * antes de sair rola a tela em um.
 */
const FOLGA = 2;

/** As linhas que o painel pode ocupar, dado o terminal. */
export function alturaDisponivel(linhasTerminal: number | undefined): number | undefined {
  if (linhasTerminal === undefined || linhasTerminal <= 0) return undefined;
  return Math.max(1, linhasTerminal - FOLGA);
}

export type OrcamentoAltura = {
  /** Quantas tasks ativas cabem na seção EM EXECUCAO. */
  tasks: number;
  /** Quantos grupos de evento cabem na seção ATIVIDADE. */
  atividade: number;
  /** Há espaço para as seções acessórias (próxima task, espaço entre blocos)? */
  folgado: boolean;
  /**
   * Janela tão baixa que só o essencial cabe: some a meta-linha do trabalho,
   * o cabeçalho de PROGRESSO e o balanço por status. O que fica é onde o
   * trabalho está (pipeline), quanto andou (barra) e o que roda agora.
   */
  apertado: boolean;
};

/**
 * Reparte a altura entre as seções elásticas.
 *
 * As duas encolhem juntas, mas não na mesma proporção: a task em execução é
 * o que a pessoa abriu o painel para ver, e a atividade é contexto. Numa
 * janela muito baixa sobra uma task e um evento — nunca zero de ambos, que
 * deixaria a tela sem dizer o que está acontecendo.
 */
export function orcarAltura(
  disponivel: number | undefined,
  tasksAtivas: number,
  gruposAtividade: number,
): OrcamentoAltura {
  // Sem altura conhecida (sem TTY), nada é cortado: quem atende esse caso é
  // o motor antigo, que não redesenha no lugar.
  if (disponivel === undefined) {
    return { tasks: tasksAtivas, atividade: gruposAtividade, folgado: true, apertado: false };
  }

  // O que as seções de altura FIXA consomem, contado na tela e não estimado:
  // cabeçalho e sua régua (2), título e meta do trabalho (2), cabeçalho do
  // pipeline e a esteira (2), cabeçalho de progresso, barra e balanço (3),
  // os cabeçalhos de EM EXECUCAO e ATIVIDADE (2), a régua e a barra de
  // status (2). Sem contar os espaços entre seções, que são condicionais.
  const FIXO = 14;

  // Abaixo disto a tela é só o essencial, e os espaços entre seções — que
  // custam cinco linhas — dão lugar ao conteúdo.
  const folgado = disponivel >= 26;

  // Abaixo disto nem o fixo cabe: três linhas acessórias saem para o
  // conteúdo caber (ver `apertado`).
  const apertado = disponivel < 18;

  const elastico = Math.max(
    2,
    disponivel - FIXO - (folgado ? 5 : 0) + (apertado ? 3 : 0),
  );

  // A execução leva a maior parte; a atividade fica com o resto.
  const paraTasks = Math.max(1, Math.min(tasksAtivas, Math.ceil(elastico * 0.45)));
  const paraAtividade = Math.max(1, Math.min(gruposAtividade, elastico - paraTasks));

  return { tasks: paraTasks, atividade: paraAtividade, folgado, apertado };
}
