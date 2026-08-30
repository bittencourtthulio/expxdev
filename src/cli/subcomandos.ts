/**
 * Roteador de subcomando do `expx`.
 *
 * O parser original (`argumentos.ts`) só entende opções: qualquer token solto é
 * erro. O `expx` precisa do contrário — o primeiro token é o subcomando e o
 * resto é repassado para quem sabe interpretá-lo. As duas camadas convivem: o
 * `panel` delega para o parser antigo, que continua sendo o dono das opções do
 * painel.
 */

export const SUBCOMANDOS = ["init", "panel", "watch", "add", "remove", "update", "doctor"] as const;
export type Subcomando = (typeof SUBCOMANDOS)[number];

export type Roteamento =
  | { ok: true; ajuda: true }
  | { ok: true; ajuda: false; subcomando: Subcomando; resto: string[] }
  | { ok: false; erro: string };

const AJUDA = `
expx — CLI do metodo Expx

  npx expxdev <subcomando> [opcoes]

  expx init                 instala as skills escolhidas neste projeto
  expx panel                sobe o painel de operacao lendo o docs/ do projeto
  expx watch                acompanha um trabalho no terminal, ao vivo
  expx add <skill...>       acrescenta skills a selecao
  expx remove <skill...>    remove skills da selecao
  expx update [skill...]    atualiza as skills instaladas
  expx doctor               diagnostica uma instalacao quebrada

  --ajuda              mostra esta ajuda

O painel e o watch funcionam sem init: nenhum dos dois escreve no projeto.
`.trim();

export function ajudaGeral(): string {
  return AJUDA;
}

function ehSubcomando(v: string): v is Subcomando {
  return (SUBCOMANDOS as readonly string[]).includes(v);
}

export function interpretarSubcomando(argv: readonly string[]): Roteamento {
  const primeiro = argv[0];
  if (primeiro === undefined || primeiro === "--ajuda" || primeiro === "--help" || primeiro === "-h") {
    return { ok: true, ajuda: true };
  }
  if (!ehSubcomando(primeiro)) {
    return { ok: false, erro: `subcomando desconhecido: ${primeiro}` };
  }
  return { ok: true, ajuda: false, subcomando: primeiro, resto: [...argv.slice(1)] };
}
