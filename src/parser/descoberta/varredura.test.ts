import { describe, it, expect } from "vitest";
import { varrerCandidatos, ehCandidato } from "./varredura.js";

describe("varredura de candidatos", () => {
  it("integração: só nomes conhecidos do método entram na lista", () => {
    const achados = varrerCandidatos("fixtures/projeto-ok");
    expect(achados.length).toBeGreaterThan(10);
    for (const c of achados) {
      expect(ehCandidato(c), `${c} não deveria ser candidato`).toBe(true);
    }
    // os arquivos de base e LACUNAS existem no disco mas NÃO são candidatos:
    // eles legitimamente não têm frontmatter (decisão D-11)
    expect(achados.some((c) => c.endsWith("00-LACUNAS.md"))).toBe(false);
    expect(achados.some((c) => c.endsWith("geracao-csv.md"))).toBe(false);
  });

  it("funcional: um leiame.md solto não é candidato", () => {
    expect(ehCandidato("docs/pasta/leiame.md")).toBe(false);
    expect(ehCandidato("docs/x/base/00-LACUNAS.md")).toBe(false);
    expect(ehCandidato("docs/x/00-AUDITORIA.md")).toBe(false);
    // os que são
    expect(ehCandidato("docs/x/ORQUESTRADOR.md")).toBe(true);
    expect(ehCandidato("docs/x/sprint-01/tasks.md")).toBe(true);
    expect(ehCandidato("docs/x/BLOQUEIOS.md")).toBe(true);
    expect(ehCandidato("docs/x/00-BLOQUEIOS.md")).toBe(true);
    expect(ehCandidato("docs/x/base/00-INDICE.md")).toBe(true);
    expect(ehCandidato("docs/relatorios/INDICE.md")).toBe(true);
  });

  it("funcional: node_modules e .git são ignorados", () => {
    const achados = varrerCandidatos("fixtures");
    expect(achados.some((c) => c.includes("node_modules"))).toBe(false);
    expect(achados.some((c) => c.includes("/.git/"))).toBe(false);
  });
});
