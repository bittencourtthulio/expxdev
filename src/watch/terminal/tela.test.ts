import { describe, it, expect } from "vitest";
import { criarTela } from "./tela.js";

/**
 * T-03.03 — redesenho sem piscar.
 *
 * "Redesenho não pode piscar a tela inteira." A técnica é reposicionar o
 * cursor e reescrever só as linhas que mudaram — nunca limpar a tela (decisão
 * D-20, que também descartou o buffer alternativo, porque ele apaga o que
 * estava na tela ao sair).
 */

function telaFalsa(): { escrito: string[]; escrever: (t: string) => void } {
  const escrito: string[] = [];
  return { escrito, escrever: (t) => escrito.push(t) };
}

describe("tela", () => {
  it("integração: duas visões que diferem em uma linha reescrevem uma linha só", () => {
    const f = telaFalsa();
    const tela = criarTela(f.escrever);

    tela.desenhar(["alfa", "beta", "gama"]);
    f.escrito.length = 0; // o primeiro desenho escreve tudo, e deve mesmo

    tela.desenhar(["alfa", "BETA", "gama"]);
    const saida = f.escrito.join("");

    expect(saida).toContain("BETA");
    // as que não mudaram não são reescritas
    expect(saida).not.toContain("alfa");
    expect(saida).not.toContain("gama");
  });

  it("funcional: desenhar a mesma visão duas vezes não escreve nada na segunda", () => {
    const f = telaFalsa();
    const tela = criarTela(f.escrever);

    tela.desenhar(["uma", "duas"]);
    f.escrito.length = 0;

    tela.desenhar(["uma", "duas"]);
    expect(f.escrito.join("")).toBe("");
  });

  it("funcional: nenhum caminho emite limpeza de tela inteira", () => {
    const f = telaFalsa();
    const tela = criarTela(f.escrever);

    tela.desenhar(["a", "b", "c"]);
    tela.desenhar(["a", "x", "c"]);
    tela.desenhar(["a"]); // encolheu
    tela.desenhar(["a", "b", "c", "d"]); // cresceu

    const saida = f.escrito.join("");
    // \u001b[2J limpa a tela toda; \u001bc reseta o terminal. Nenhum dos dois.
    expect(saida).not.toContain("\u001b[2J");
    expect(saida).not.toContain("\u001bc");
  });

  it("funcional: a tela encolhendo apaga as linhas que sobraram", () => {
    const f = telaFalsa();
    const tela = criarTela(f.escrever);

    tela.desenhar(["a", "b", "c"]);
    f.escrito.length = 0;

    tela.desenhar(["a"]);
    const saida = f.escrito.join("");
    // limpar da linha para a direita, para "b" e "c" não ficarem na tela
    expect(saida).toContain("\u001b[K");
  });
});
