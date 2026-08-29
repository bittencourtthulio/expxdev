import { describe, it, expect } from "vitest";
import { descobrirTrabalhos } from "./trabalhos.js";

describe("identificacao de trabalhos", () => {
  it("integração: projeto-ok devolve exatamente dois trabalhos, um de cada ferramenta", () => {
    const r = descobrirTrabalhos("fixtures/projeto-ok");
    expect(r.trabalhos).toHaveLength(2);
    const ferramentas = r.trabalhos.map((t) => t.expx_tool).sort();
    expect(ferramentas).toEqual(["runx", "sprintx"]);
    expect(r.rejeicoes).toHaveLength(0);
  });

  it("funcional: a pasta sem ORQUESTRADOR não vira trabalho nem gera rejeição", () => {
    const r = descobrirTrabalhos("fixtures/projeto-ruim");
    const pastas = r.trabalhos.map((t) => t.pasta);
    expect(pastas.some((p) => p.includes("pasta-sem-orquestrador"))).toBe(false);
    // e não aparece na lista de rejeições: é ignorada em silêncio (D-12)
    expect(r.rejeicoes.some((x) => x.arquivo.includes("pasta-sem-orquestrador"))).toBe(false);
  });

  it("funcional: os ORQUESTRADOR quebrados viram rejeição com motivo", () => {
    const r = descobrirTrabalhos("fixtures/projeto-ruim");
    // yaml-invalido, kind-desconhecido, schema-futuro, sem-frontmatter
    expect(r.rejeicoes.length).toBeGreaterThanOrEqual(4);
    const motivos = new Set(r.rejeicoes.map((x) => x.motivo));
    expect(motivos.size).toBeGreaterThanOrEqual(4);
    // enum-errado e violacoes são legíveis: viram trabalho, não rejeição
    const ids = r.trabalhos.map((t) => t.trabalho_id);
    expect(ids).toContain("OC-2026-9999");
  });
});
