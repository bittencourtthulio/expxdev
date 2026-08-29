import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { classificar, MotivoRejeicao } from "./rejeicao.js";

const R = "fixtures/projeto-ruim/docs";

describe("classificacao de rejeicao", () => {
  it("integração: os quatro casos de leitura quebrada viram rejeição, sem exceção", () => {
    const casos = ["yaml-invalido", "kind-desconhecido", "schema-futuro", "sem-frontmatter"];
    const motivos = new Set<string>();
    for (const caso of casos) {
      const caminho = `${R}/${caso}/ORQUESTRADOR.md`;
      let r: ReturnType<typeof classificar> | undefined;
      expect(() => {
        r = classificar(caminho, readFileSync(caminho, "utf8"));
      }).not.toThrow();
      expect(r?.tipo, `${caso} deveria ser rejeitado`).toBe("rejeitado");
      if (r?.tipo === "rejeitado") motivos.add(r.motivo);
    }
    // os quatro casos dão motivos distintos, não um genérico
    expect(motivos.size).toBe(4);
  });

  it("funcional: expx_schema 2 é rejeitado com o motivo de versão futura", () => {
    const caminho = `${R}/schema-futuro/ORQUESTRADOR.md`;
    const r = classificar(caminho, readFileSync(caminho, "utf8"));
    expect(r.tipo).toBe("rejeitado");
    if (r.tipo !== "rejeitado") return;
    expect(r.motivo).toBe(MotivoRejeicao.VersaoFutura);
    expect(r.detalhe).toContain("2");
  });

  it("funcional: arquivo válido não é rejeitado", () => {
    const caminho = "fixtures/projeto-ok/docs/exportacao-csv/ORQUESTRADOR.md";
    const r = classificar(caminho, readFileSync(caminho, "utf8"));
    expect(r.tipo).toBe("aceito");
  });
});
