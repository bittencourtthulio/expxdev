/**
 * Cor no terminal, escrita à mão.
 *
 * O projeto não tem nenhuma biblioteca de cor disponível em runtime: os três
 * pacotes ANSI em `node_modules` (`picocolors`, `ansi-styles`, `ansi-regex`)
 * são transitivos de devDependencies e somem numa instalação de produção
 * (base/bibliotecas-de-terminal.md). Seis códigos SGR não justificam uma
 * dependência nova — decisão D-04.
 */

const ESC = "";
const RESET = `${ESC}[0m`;

/**
 * Os papéis de cor do painel, por significado e não por cor.
 *
 * Nomear por papel é o que permite trocar a paleta depois sem caçar "vermelho"
 * espalhado pelo desenho.
 */
export const PAPEIS = [
  "sucesso",
  "atencao",
  "erro",
  "destaque",
  "apagado",
  "neutro",
] as const;

export type Papel = (typeof PAPEIS)[number];

/** Código SGR de cada papel. */
const CODIGO: Record<Papel, string> = {
  sucesso: "32", // verde: concluído
  atencao: "33", // amarelo: em andamento, aviso
  erro: "31", // vermelho: bloqueado, violação
  destaque: "1;36", // ciano forte: a task em andamento
  apagado: "90", // cinza: pendente, metadado
  neutro: "0", // sem cor, mas passa pelo mesmo caminho
};

export type Ambiente = {
  /** `process.stdout.isTTY` — e SÓ ele. */
  tty: boolean;
  /** A variável `NO_COLOR` está definida? */
  noColor: boolean;
};

/**
 * Decide se a cor sai.
 *
 * Duas condições, nesta ordem: a saída precisa ser terminal (especificação:
 * "sem cor quando a saída não for terminal, para não sujar redirecionamento de
 * arquivo") e `NO_COLOR` não pode estar definida (decisão D-10).
 *
 * Repare que NÃO usamos `ehInterativo()` do CLI: aquele exige stdin E stdout, e
 * aqui stdin é irrelevante — o que suja o arquivo é o stdout.
 */
export function corAtiva(amb: Ambiente): boolean {
  return amb.tty && !amb.noColor;
}

/** Lê o ambiente real. Isolado para o teste nunca depender de TTY de verdade. */
export function ambienteAtual(): Ambiente {
  return {
    tty: process.stdout.isTTY === true,
    noColor: process.env["NO_COLOR"] !== undefined,
  };
}

export type Pintor = (texto: string, papel: Papel) => string;

/**
 * Devolve a função de pintura já com a decisão tomada.
 *
 * Com a cor desligada, `pintar` é identidade — nenhum escape chega ao arquivo,
 * e o desenho não precisa de um `if` em cada linha.
 */
export function criarPintor(ativa: boolean): Pintor {
  if (!ativa) return (texto) => texto;
  return (texto, papel) => `${ESC}[${CODIGO[papel]}m${texto}${RESET}`;
}
