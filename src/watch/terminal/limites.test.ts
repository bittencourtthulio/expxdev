import { describe, it, expect } from "vitest";
import { criarTela, cortarComAnsi, type LimitesTela } from "./tela.js";
import { largura } from "../desenho/largura.js";

/**
 * As duas invariantes da tela — e o defeito que elas existem para impedir.
 *
 * O sintoma relatado foi a tela embaralhada: o rastro escrito por cima da
 * árvore, linhas repetidas no meio de outras, texto sobreposto. A causa não é
 * o conteúdo: é aritmética de cursor. A tela move o cursor N linhas para cima
 * contando as linhas que DESENHOU, e o terminal conta as linhas que EXIBIU.
 * Uma linha mais larga que a janela é exibida em duas, os dois números
 * divergem, e a partir daí todo redesenho acerta a linha errada.
 */

function telaFalsa(): { escrito: string[]; escrever: (t: string) => void } {
  const escrito: string[] = [];
  return { escrito, escrever: (t) => escrito.push(t) };
}

const limites = (colunas: number, linhas: number) => (): LimitesTela => ({ colunas, linhas });

describe("limites da tela", () => {
  it("integração: nenhuma linha desenhada alcança a largura do terminal", () => {
    const f = telaFalsa();
    const tela = criarTela(f.escrever, limites(40, 50));

    tela.desenhar([
      "uma linha bem mais comprida do que quarenta colunas, de longe, muito mais",
      "curta",
    ]);

    for (const linha of f.escrito.join("").split("\n")) {
      // < 40, não <= 40: escrever NA última coluna deixa o terminal em
      // "pending wrap", e o caractere seguinte pula de linha sem que a tela
      // tenha contado essa quebra.
      expect(largura(linha), linha).toBeLessThan(40);
    }
  });

  it("funcional: o bloco nunca passa da altura do terminal", () => {
    const f = telaFalsa();
    const tela = criarTela(f.escrever, limites(80, 10));

    tela.desenhar(Array.from({ length: 40 }, (_, i) => `linha ${String(i)}`));

    const linhas = f.escrito.join("").split("\n");
    expect(linhas.length).toBeLessThanOrEqual(10);
    // E diz o que ficou de fora, em vez de esconder em silêncio.
    expect(linhas[linhas.length - 1]).toContain("mais");
  });

  it("funcional: redimensionar a janela para menos colunas não deixa linha larga", () => {
    const f = telaFalsa();
    let colunas = 100;
    const tela = criarTela(f.escrever, () => ({ colunas, linhas: 50 }));

    const conteudo = ["OC-2026-0003 · runx · uma ocorrencia com titulo longo o bastante"];
    tela.desenhar(conteudo);

    // A pessoa arrasta a janela no meio da execução. A tela lê os limites a
    // cada desenho justamente por isso: presa à largura da subida, ela passaria
    // a desenhar linhas que não cabem mais.
    colunas = 30;
    f.escrito.length = 0;
    tela.desenhar(conteudo);

    for (const linha of f.escrito.join("").split("\n")) {
      expect(largura(linha.replace(/\[[0-9;]*[A-Za-z]/g, "")), linha).toBeLessThan(30);
    }
  });

  it("funcional: cortar não parte um escape de cor ao meio", () => {
    // A linha chega pintada, e um escape partido despeja "[32m" na tela
    // como texto — o defeito clássico de cortar texto colorido pelo tamanho.
    const pintada = "[32mverde e comprido demais para caber[0m";
    const cortada = cortarComAnsi(pintada, 10);

    expect(cortada).toContain("[32m");
    expect(cortada).toContain("[0m");
    // O escape não conta coluna: só o texto visível é medido.
    expect(largura(cortada.replace(/\[[0-9;]*m/g, ""))).toBeLessThanOrEqual(10);
    expect(cortada).not.toMatch(/\[3$|\[$/);
  });

  it("funcional: sem limites, as linhas passam como estão", () => {
    // O caminho dos testes de unidade e da saída redirecionada: não há
    // terminal a respeitar, e cortar ali seria inventar limite que não existe.
    const f = telaFalsa();
    const tela = criarTela(f.escrever);
    const longa = "x".repeat(500);

    tela.desenhar([longa]);
    expect(f.escrito.join("")).toContain(longa);
  });
});
