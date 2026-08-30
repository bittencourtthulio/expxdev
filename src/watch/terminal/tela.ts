/**
 * A tela: redesenho incremental, sem piscar.
 *
 * "Redesenho não pode piscar a tela inteira." Limpar tudo e reimprimir produz
 * exatamente o piscar que a especificação proíbe, e o buffer alternativo do
 * terminal foi descartado por apagar o que estava na tela quando o watch sai
 * (decisão D-20).
 *
 * A técnica: guardamos as linhas do último desenho, comparamos com as novas e
 * reescrevemos SÓ as que mudaram, movendo o cursor até cada uma.
 */

const ESC = "";
/** Move o cursor N linhas para cima. */
const sobe = (n: number): string => (n > 0 ? `${ESC}[${String(n)}A` : "");
/** Move o cursor N linhas para baixo. */
const desce = (n: number): string => (n > 0 ? `${ESC}[${String(n)}B` : "");
/** Começo da linha. */
const COLUNA_1 = `${ESC}[G`;
/** Apaga da posição do cursor até o fim da linha. */
const LIMPA_LINHA = `${ESC}[K`;

export type Tela = {
  desenhar: (linhas: readonly string[]) => void;
  /** Quantas linhas a tela ocupa agora — para quem precisa arrumar o cursor. */
  altura: () => number;
};

export function criarTela(escrever: (texto: string) => void): Tela {
  let anteriores: string[] = [];
  // Onde o cursor está, contando do topo do bloco desenhado.
  let cursor = 0;

  function irPara(linha: number): string {
    const delta = linha - cursor;
    cursor = linha;
    return delta > 0 ? desce(delta) : sobe(-delta);
  }

  return {
    altura: () => anteriores.length,

    desenhar(linhas) {
      const novas = [...linhas];
      const partes: string[] = [];

      const alturaAnterior = anteriores.length;
      const total = Math.max(novas.length, alturaAnterior);

      for (let i = 0; i < total; i++) {
        const nova = novas[i];
        const velha = anteriores[i];
        if (nova === velha) continue; // não mudou: não reescreve

        partes.push(irPara(i), COLUNA_1);
        // A tela encolheu? A linha que sobrou é apagada, não deixada para trás.
        partes.push(nova === undefined ? LIMPA_LINHA : nova + LIMPA_LINHA);
      }

      if (partes.length === 0) return; // nada mudou: nada a escrever

      // Deixa o cursor logo abaixo do bloco, onde o próximo desenho o espera.
      const fim = Math.max(0, novas.length - 1);
      partes.push(irPara(fim));

      // A primeira renderização precisa das quebras de linha para o bloco
      // existir; a partir daí é só movimento de cursor.
      if (alturaAnterior === 0) {
        escrever(novas.join("\n"));
        cursor = fim;
      } else {
        escrever(partes.join(""));
      }

      anteriores = novas;
    },
  };
}
