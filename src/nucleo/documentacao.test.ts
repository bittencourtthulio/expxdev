import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

/**
 * A contagem de skills está escrita em prosa em vários lugares, e prosa
 * desatualizada não quebra teste nenhum — ela só mente. Este teste é a guarda.
 *
 * Cuidado deliberado: "cinco estágios" fala dos estágios E1–E5 da runx e
 * NÃO deve ser trocado. Só a contagem de skills muda: hoje são sete.
 */

const ARQUIVOS = ["README.md", "src/nucleo/catalogo.ts", "src/nucleo/catalogo.test.ts"];

describe("contagem de skills na documentação", () => {
  it("integração: nenhum arquivo ainda diz 'cinco skills' nem 'seis skills'", () => {
    for (const a of ARQUIVOS) {
      const conteudo = readFileSync(a, "utf8");
      expect(conteudo).not.toContain("cinco skills");
      expect(conteudo).not.toContain("seis skills");
    }
  });

  it("funcional: o README diz sete skills e preserva 'cinco estágios'", () => {
    const readme = readFileSync("README.md", "utf8");
    expect(readme).toContain("sete skills");
    // os estágios da runx continuam sendo cinco: E1 a E5
    expect(readme).toContain("cinco estágios");
  });
});
