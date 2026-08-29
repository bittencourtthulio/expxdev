import { readFileSync } from "node:fs";
import { classificar, MotivoRejeicao, type Resultado } from "./rejeicao.js";

/**
 * Lê um arquivo do disco e o classifica. Erro de I/O (arquivo apagado entre a
 * varredura e a leitura, permissão negada) vira rejeição como qualquer outra:
 * o painel nunca cai por causa de um arquivo.
 */
export function lerArquivoDeEstado(caminho: string): Resultado {
  let conteudo: string;
  try {
    conteudo = readFileSync(caminho, "utf8");
  } catch (e) {
    return {
      tipo: "rejeitado",
      arquivo: caminho,
      motivo: MotivoRejeicao.SemFrontmatter,
      detalhe: `nao foi possivel ler o arquivo: ${(e as Error).message}`,
      linha: null,
    };
  }
  return classificar(caminho, conteudo);
}

export { MotivoRejeicao };
export type { Resultado };
