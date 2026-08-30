import { largura } from "../desenho/largura.js";

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
 *
 * DUAS invariantes sustentam essa aritmética de cursor. Quebrar qualquer uma
 * delas embaralha a tela em vez de redesenhá-la:
 *
 *  1. UMA linha desenhada ocupa UMA linha física. Se o texto passar da largura
 *     do terminal, ele quebra sozinho, o bloco fica mais alto do que as linhas
 *     que contamos, e todo movimento de cursor seguinte erra o alvo — foi o
 *     que produziu o rastro sobrescrevendo a árvore no meio da tela. Por isso
 *     a tela CORTA na largura recebida, como último guarda, e corta em
 *     `colunas - 1`: escrever na última coluna deixa muitos terminais em
 *     "pending wrap", e o caractere seguinte pula de linha sem aviso.
 *  2. O bloco cabe na altura do terminal. Se não couber, o terminal rola, as
 *     linhas de cima saem da vista e o cursor não tem como voltar até elas.
 *     Por isso o bloco é truncado na altura disponível.
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

export type LimitesTela = {
  /** Largura do terminal, em colunas. */
  colunas: number;
  /** Altura do terminal, em linhas. */
  linhas: number;
};

/**
 * Corta o texto por COLUNA sem partir escape ANSI no meio.
 *
 * As linhas chegam aqui já pintadas, e um `[32m` não ocupa coluna
 * nenhuma: medir o texto pintado daria largura errada, e cortar às cegas
 * partiria o escape ao meio, despejando `[32m` como texto na tela.
 */
export function cortarComAnsi(texto: string, colunas: number): string {
  if (colunas <= 0) return "";

  const partes = texto.split(/(\[[0-9;]*m)/);
  let usadas = 0;
  let saida = "";
  let cortou = false;

  for (const parte of partes) {
    if (parte === "") continue;
    // escape: passa inteiro e não conta coluna
    if (parte.startsWith(`${ESC}[`)) {
      saida += parte;
      continue;
    }
    if (cortou) continue;

    const pontos = [...parte.normalize("NFC")];
    if (usadas + pontos.length <= colunas) {
      saida += pontos.join("");
      usadas += pontos.length;
      continue;
    }
    // -1 para a reticência, que também ocupa uma coluna
    saida += pontos.slice(0, Math.max(0, colunas - usadas - 1)).join("") + "…";
    usadas = colunas;
    cortou = true;
  }

  return saida;
}

export function criarTela(
  escrever: (texto: string) => void,
  limites?: () => LimitesTela,
): Tela {
  let anteriores: string[] = [];
  // Onde o cursor está, contando do topo do bloco desenhado.
  let cursor = 0;

  function irPara(linha: number): string {
    const delta = linha - cursor;
    cursor = linha;
    return delta > 0 ? desce(delta) : sobe(-delta);
  }

  /**
   * Impõe as duas invariantes: nada mais largo que o terminal, nada mais alto.
   *
   * Sem `limites` — o caso dos testes de unidade da tela — não há terminal a
   * respeitar e as linhas passam como estão.
   */
  function ajustar(linhas: readonly string[]): string[] {
    if (limites === undefined) return [...linhas];
    const { colunas, linhas: altura } = limites();

    const largo = colunas > 1 ? colunas - 1 : 1;
    const cortadas = linhas.map((l) => (largura(l) > largo ? cortarComAnsi(l, largo) : l));

    // -1 na altura: a linha onde o cursor descansa depois do bloco.
    const alto = Math.max(1, altura - 1);
    if (cortadas.length <= alto) return cortadas;

    // Não cabe: mostramos o começo e dizemos quantas linhas ficaram de fora,
    // em vez de rolar a tela e perder o controle do cursor.
    const sobraram = cortadas.length - alto + 1;
    return [
      ...cortadas.slice(0, alto - 1),
      cortarComAnsi(`  … mais ${String(sobraram)} linhas (aumente a janela)`, largo),
    ];
  }

  return {
    altura: () => anteriores.length,

    desenhar(entrada) {
      const novas = ajustar(entrada);
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
