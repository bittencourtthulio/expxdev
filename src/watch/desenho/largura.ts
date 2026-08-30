/**
 * Medir e cortar texto por COLUNA de terminal.
 *
 * R13 (`CONVENCOES.md`) garante acento em `titulo`, `objetivo` e `detalhe`. Em
 * NFC o "ç" é um code point; em NFD são dois — e nome vindo do macOS chega em
 * NFD. Medir com `String.length` erraria o corte em 80 colunas (decisão D-15).
 *
 * Normalizar para NFC resolve o caso real do método. Não tratamos largura
 * dupla (CJK, emoji): a especificação proíbe emoji decorativo e a prosa do
 * método é português. Um caractere de largura dupla contaria como uma coluna
 * aqui — limitação conhecida, não acidente.
 */

/** Reticência de uma coluna, para marcar o que foi cortado. */
const RETICENCIA = "…";

/** Quantas colunas o texto ocupa. */
export function largura(texto: string): number {
  // O spread itera por code point, não por unidade UTF-16: um par surrogate
  // conta como um, e não como dois.
  return [...texto.normalize("NFC")].length;
}

/**
 * Corta o texto para caber em `colunas`, com reticência quando sobra coisa.
 *
 * "Corta com elegância em vez de quebrar linha", como manda a especificação:
 * quem lê num terminal estreito perde o fim da frase, nunca o alinhamento.
 */
export function cortar(texto: string, colunas: number): string {
  if (colunas <= 0) return "";

  const normalizado = texto.normalize("NFC");
  const pontos = [...normalizado];
  if (pontos.length <= colunas) return normalizado;

  // -1 para a reticência, que também ocupa uma coluna
  return pontos.slice(0, colunas - 1).join("") + RETICENCIA;
}

/** Completa com espaços à direita até `colunas`, cortando se passar. */
export function preencher(texto: string, colunas: number): string {
  const cortado = cortar(texto, colunas);
  return cortado + " ".repeat(Math.max(0, colunas - largura(cortado)));
}
