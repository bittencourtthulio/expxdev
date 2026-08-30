import { describe, it, expect } from "vitest";
import { criarTela, type LimitesTela } from "./tela.js";

/**
 * A regressão do embaralhamento.
 *
 * O defeito relatado: depois de alguns redesenhos, o watch escrevia o rastro
 * por cima da árvore, repetia linhas no meio de outras e deixava texto
 * sobreposto — a tela virava um borrão.
 *
 * A causa não é o conteúdo, é aritmética de cursor. A tela sobe N linhas
 * contando o que DESENHOU; o terminal conta o que EXIBIU. Uma linha mais larga
 * que a janela é exibida em duas, os números divergem, e daí em diante todo
 * redesenho acerta a linha errada — o erro ACUMULA a cada ciclo.
 *
 * Este teste emula um terminal de verdade: aplica os escapes numa grade que
 * quebra linha na largura, exatamente como o terminal faz, e confere que a
 * tela final é a que se queria desenhar. É o único jeito de provar a ausência
 * do defeito, porque ele não aparece na saída — só na grade.
 */

const ESC = "\u001b";

/** Aplica a saída numa grade e devolve as linhas visíveis. */
function emular(saida: string, colunas: number): string[] {
  const raw = [...saida.normalize("NFC")];
  const grade: string[][] = [];
  let linha = 0;
  let coluna = 0;

  const escrever = (ch: string): void => {
    while (grade.length <= linha) grade.push([]);
    const l = grade[linha] as string[];
    while (l.length < coluna) l.push(" ");
    l[coluna] = ch;
    coluna++;
    // A quebra automática do terminal — a origem do defeito.
    if (coluna >= colunas) {
      coluna = 0;
      linha++;
    }
  };

  let i = 0;
  while (i < raw.length) {
    const c = raw[i];
    if (c === ESC && raw[i + 1] === "[") {
      const m = /^\u001b\[([0-9;?]*)([A-Za-z])/.exec(raw.slice(i, i + 14).join(""));
      if (m) {
        const n = m[1] === "" ? 1 : Number.parseInt(m[1], 10);
        if (m[2] === "A") linha = Math.max(0, linha - n);
        else if (m[2] === "B") linha += n;
        else if (m[2] === "G") coluna = (m[1] === "" ? 1 : n) - 1;
        else if (m[2] === "K") {
          while (grade.length <= linha) grade.push([]);
          (grade[linha] as string[]).length = coluna;
        }
        i += [...m[0]].length;
        continue;
      }
    }
    if (c === "\n") {
      linha++;
      coluna = 0;
      i++;
      continue;
    }
    if (c === "\r") {
      coluna = 0;
      i++;
      continue;
    }
    escrever(c as string);
    i++;
  }

  return grade.map((l) => l.join("").replace(/\s+$/, ""));
}

const limites = (colunas: number, linhas: number) => (): LimitesTela => ({ colunas, linhas });

describe("regressão: a tela não embaralha", () => {
  it("integração: cem redesenhos com linhas mais largas que a janela deixam a tela certa", () => {
    const saida: string[] = [];
    const COLUNAS = 60;
    const tela = criarTela((t) => saida.push(t), limites(COLUNAS, 40));

    // Conteúdo do tamanho que quebrava: títulos de ocorrência não cabem em 60
    // colunas, e é justamente esse o caso do painel de verdade.
    const quadro = (n: number): string[] => [
      "OC-2026-0003 · runx · Card nao acompanha o mouse ao ser arrastado no board",
      `    ████░░░░ ${String(n % 10)}/9 tasks   uma cauda longa o suficiente para passar`,
      "      [>] T-01.01 Teste de regressao do card arrastado fora do container",
      `      [>] T-01.02 Overlay do card e clique preservado ${String(n)}`,
      "atividade",
    ];

    for (let n = 0; n < 100; n++) tela.desenhar(quadro(n));

    const visivel = emular(saida.join(""), COLUNAS);
    const esperado = emular(
      // o que a tela DEVERIA mostrar: o último quadro, já cortado por ela
      quadro(99)
        .map((l) => ([...l].length > COLUNAS - 1 ? [...l].slice(0, COLUNAS - 2).join("") + "…" : l))
        .join("\n"),
      COLUNAS,
    );

    expect(visivel).toEqual(esperado);
    // e a tela não cresceu além do quadro: nada de linha órfã sobrando
    expect(visivel.length).toBe(5);
  });

  it("funcional: encolher e crescer o quadro não deixa resto de desenho antigo", () => {
    const saida: string[] = [];
    const tela = criarTela((t) => saida.push(t), limites(40, 20));

    tela.desenhar(["alfa", "beta", "gama", "delta"]);
    tela.desenhar(["alfa"]); // encolheu muito
    tela.desenhar(["alfa", "beta"]); // cresceu de novo

    // As linhas que sobraram são APAGADAS, não sobrescritas: no terminal elas
    // continuam existindo como linhas em branco, e é isso que se exige — o
    // defeito seria "gama" e "delta" ainda legíveis ali.
    const visivel = emular(saida.join(""), 40);
    expect(visivel.filter((l) => l !== "")).toEqual(["alfa", "beta"]);
    expect(visivel.join("\n")).not.toContain("gama");
    expect(visivel.join("\n")).not.toContain("delta");
  });
});
