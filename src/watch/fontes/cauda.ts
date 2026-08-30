import { closeSync, openSync, readSync, statSync } from "node:fs";

/**
 * Lê apenas o fim de um arquivo de texto, em linhas completas.
 *
 * O rastro só rotaciona em 5 MB (contrato `expx-eventos`), e o watch relê a
 * cada evento novo. Ler o arquivo inteiro todas as vezes é a "chamada externa
 * cara" que a especificação proíbe — daí a decisão D-09 de ler só a cauda.
 *
 * O preço de ler pelo fim é cortar a primeira linha ao meio. Este módulo
 * DESCARTA esse fragmento: quem consome recebe só linhas íntegras, e uma linha
 * perdida no começo da janela é irrelevante para "as últimas N linhas".
 */

/** Teto de bytes lidos por arquivo. */
export const LIMITE_CAUDA = 64 * 1024;

export function lerCauda(caminho: string, limite: number = LIMITE_CAUDA): string[] {
  let fd: number | undefined;
  try {
    const tamanho = statSync(caminho).size;
    if (tamanho === 0) return [];

    const inicio = Math.max(0, tamanho - limite);
    const bytes = tamanho - inicio;

    fd = openSync(caminho, "r");
    const buf = Buffer.allocUnsafe(bytes);
    readSync(fd, buf, 0, bytes, inicio);

    const texto = buf.toString("utf8");
    const linhas = texto.split("\n");

    // Cortamos no meio do arquivo? Então a primeira linha é um fragmento do
    // que veio antes da janela, e não um registro. Fora.
    if (inicio > 0) linhas.shift();

    return linhas.filter((l) => l.trim() !== "");
  } catch {
    // arquivo ausente, sem permissão, sumiu entre o stat e o open: sem rastro
    return [];
  } finally {
    if (fd !== undefined) {
      try {
        closeSync(fd);
      } catch {
        // fechar não pode derrubar quem só queria ler
      }
    }
  }
}
