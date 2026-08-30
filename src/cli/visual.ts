/**
 * A identidade visual do CLI no terminal.
 *
 * Cor aqui é enfeite, nunca informação: todo texto continua legível sem
 * nenhum código ANSI. É o que mantém a saída utilizável em log, em pipe e
 * em terminal que não suporta cor — e é por isso que `pintar` devolve o
 * texto cru quando a cor está desligada, em vez de um fallback diferente.
 */

const ESC = "[";

/**
 * Respeita NO_COLOR (no-color.org) e FORCE_COLOR, nesta ordem.
 *
 * Sem TTY não há cor: escrever ANSI num pipe suja o arquivo de quem
 * redirecionou a saída.
 */
export function temCor(env: NodeJS.ProcessEnv = process.env, tty = process.stdout.isTTY === true): boolean {
  if (env["NO_COLOR"] !== undefined && env["NO_COLOR"] !== "") return false;
  if (env["FORCE_COLOR"] !== undefined && env["FORCE_COLOR"] !== "0") return true;
  if (env["TERM"] === "dumb") return false;
  return tty;
}

type Estilo = "azul" | "azulClaro" | "cinza" | "negrito" | "branco";

const CODIGOS: Record<Estilo, string> = {
  // O azul do expxdev. 256 cores em vez de 16: o azul básico do terminal
  // varia demais entre temas, e a marca precisa ser a mesma em todos.
  azul: "38;5;33",
  azulClaro: "38;5;75",
  cinza: "38;5;245",
  negrito: "1",
  branco: "38;5;255",
};

export function pintar(texto: string, estilo: Estilo, cor = temCor()): string {
  if (!cor) return texto;
  return `${ESC}${CODIGOS[estilo]}m${texto}${ESC}0m`;
}

/**
 * O bloco de abertura do `init`.
 *
 * O desenho é feito com meio-bloco (▀▄) para o logotipo caber em poucas
 * linhas sem virar arte ASCII ilegível — a intenção é enquadrar o comando,
 * não ocupar a tela inteira.
 */
export function hero(versao: string, cor = temCor()): string {
  const a = (t: string): string => pintar(t, "azul", cor);
  const c = (t: string): string => pintar(t, "azulClaro", cor);
  const g = (t: string): string => pintar(t, "cinza", cor);
  const b = (t: string): string => pintar(t, "negrito", cor);

  return [
    "",
    `  ${a("███████╗")}${c("██╗  ██╗")}${a("██████╗ ")}${c("██╗  ██╗")}   ${g("dev")}`,
    `  ${a("██╔════╝")}${c("╚██╗██╔╝")}${a("██╔══██╗")}${c("╚██╗██╔╝")}`,
    `  ${a("█████╗  ")}${c(" ╚███╔╝ ")}${a("██████╔╝")}${c(" ╚███╔╝ ")}`,
    `  ${a("██╔══╝  ")}${c(" ██╔██╗ ")}${a("██╔═══╝ ")}${c(" ██╔██╗ ")}`,
    `  ${a("███████╗")}${c("██╔╝ ██╗")}${a("██║     ")}${c("██╔╝ ██╗")}`,
    `  ${a("╚══════╝")}${c("╚═╝  ╚═╝")}${a("╚═╝     ")}${c("╚═╝  ╚═╝")}`,
    "",
    `  ${b("o metodo Expx no seu projeto")}  ${g(`v${versao}`)}`,
    "",
  ].join("\n");
}

/** Linha de seção, para separar as etapas do wizard sem poluir. */
export function secao(titulo: string, cor = temCor()): string {
  return `\n${pintar("▸", "azulClaro", cor)} ${pintar(titulo, "negrito", cor)}\n`;
}

/** O fecho do init, quando deu certo. */
export function sucesso(linhas: readonly string[], cor = temCor()): string {
  const marca = pintar("✓", "azulClaro", cor);
  return `\n${marca} ${linhas.join(`\n  `)}\n`;
}
