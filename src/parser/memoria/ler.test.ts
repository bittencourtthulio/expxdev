import { describe, it, expect } from "vitest";
import { lerIndice } from "./ler.js";

/**
 * A leitura falha ABERTA: índice ausente ou corrompido devolve `null`, nunca
 * lança. Ausência é o caso comum — `.expx/memoria/` é gitignorado pelo próprio
 * motor do memox, então um clone recém-feito não tem índice nenhum (D-02).
 */

describe("leitura do índice de memória", () => {
  it("integração: devolve o índice na fixture válida e null nas outras duas", () => {
    expect(lerIndice("fixtures/projeto-memoria")).not.toBeNull();
    expect(lerIndice("fixtures/projeto-memoria-corrompida")).toBeNull();
    // projeto-ok não tem índice: é o caso "clone recém-feito"
    expect(lerIndice("fixtures/projeto-ok")).toBeNull();
  });

  it("funcional: índice corrompido devolve null sem lançar; o válido vem na versão 1", () => {
    expect(() => lerIndice("fixtures/projeto-memoria-corrompida")).not.toThrow();
    expect(lerIndice("fixtures/projeto-memoria")?.versao).toBe(1);
  });
});
