import { describe, it, expect } from "vitest";
import { cortar, esquerdaDireita, preencher } from "./texto.js";

/**
 * O corte é o que impede a quebra de palavra que embaralhava a faixa estreita
 * — ver o cabeçalho de `texto.ts`.
 */

describe("cortar", () => {
  it("funcional: texto que cabe passa intacto", () => {
    expect(cortar("frete", 10)).toBe("frete");
    expect(cortar("frete", 5)).toBe("frete");
  });

  it("funcional: texto longo sai cortado com reticencia, nunca quebrado", () => {
    // O caso da tela: um título que não cabe vira "Corrigir a…", não
    // "Corrigir a" numa linha e "faixa" na outra.
    expect(cortar("Corrigir a faixa acima de 50kg", 12)).toBe("Corrigir a…");
    expect([...cortar("Corrigir a faixa acima de 50kg", 12)]).toHaveLength(11);
  });

  it("funcional: o corte nunca passa da largura pedida", () => {
    for (const n of [2, 3, 7, 15, 40]) {
      expect([...cortar("uma frase razoavelmente longa aqui", n)].length).toBeLessThanOrEqual(n);
    }
  });

  it("funcional: largura zero ou negativa devolve vazio, nao o texto inteiro", () => {
    // Devolver o texto faria o layout vazar justamente na tela mais espremida.
    expect(cortar("qualquer", 0)).toBe("");
    expect(cortar("qualquer", -3)).toBe("");
  });

  it("funcional: uma coluna cabe so a reticencia", () => {
    expect(cortar("qualquer", 1)).toBe("…");
  });
});

describe("preencher", () => {
  it("funcional: texto curto ganha espaco ate a largura", () => {
    expect(preencher("ok", 5)).toBe("ok   ");
    expect([...preencher("ok", 5)]).toHaveLength(5);
  });

  it("funcional: texto longo e cortado, e a largura continua exata", () => {
    expect([...preencher("texto bem maior que a coluna", 8)]).toHaveLength(8);
  });
});

describe("esquerdaDireita", () => {
  it("funcional: cola um lado em cada ponta da largura", () => {
    const l = esquerdaDireita("frota", "45%", 20);
    expect([...l]).toHaveLength(20);
    expect(l.startsWith("frota")).toBe(true);
    expect(l.endsWith("45%")).toBe(true);
  });

  it("funcional: sem espaco, a ESQUERDA cede e o valor sobrevive inteiro", () => {
    // O valor é o dado que a pessoa procura: "45%" cortado para "4…" não
    // informa nada, enquanto o rótulo cortado continua reconhecível.
    const l = esquerdaDireita("rotulo bem comprido", "45%", 12);
    expect([...l]).toHaveLength(12);
    expect(l.endsWith("45%")).toBe(true);
  });

  it("integracao: em nenhuma largura a linha passa do pedido", () => {
    for (const n of [4, 8, 13, 21, 34, 55]) {
      const l = esquerdaDireita("Demonstracao ao vivo do painel", "2 em paralelo", n);
      expect([...l].length, `largura ${String(n)}`).toBeLessThanOrEqual(n);
    }
  });

  it("funcional: os dois lados nunca se encostam sem espaco", () => {
    const l = esquerdaDireita("abcdefgh", "xyz", 12);
    expect(l).toMatch(/ /);
  });
});
