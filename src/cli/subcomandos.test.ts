import { describe, it, expect } from "vitest";
import { interpretarSubcomando, SUBCOMANDOS, ajudaGeral } from "./subcomandos.js";

describe("roteador de subcomando", () => {
  it("integração: os seis subcomandos são reconhecidos", () => {
    expect([...SUBCOMANDOS]).toEqual(["init", "panel", "add", "remove", "update", "doctor"]);
    for (const s of SUBCOMANDOS) {
      const r = interpretarSubcomando([s]);
      expect(r.ok, `${s} deveria ser reconhecido`).toBe(true);
      if (r.ok) expect(r.subcomando).toBe(s);
    }
  });

  it("funcional: subcomando desconhecido devolve erro nomeando o token", () => {
    const r = interpretarSubcomando(["quack"]);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.erro).toContain("quack");
  });

  it("funcional: os argumentos após o subcomando são repassados intactos", () => {
    const r = interpretarSubcomando(["add", "sprintx", "runx", "--yes"]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.subcomando).toBe("add");
    expect(r.resto).toEqual(["sprintx", "runx", "--yes"]);
  });

  it("funcional: sem argumento nenhum pede ajuda em vez de falhar", () => {
    const r = interpretarSubcomando([]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.ajuda).toBe(true);
  });

  it("funcional: --ajuda e --help pedem ajuda", () => {
    for (const flag of ["--ajuda", "--help", "-h"]) {
      const r = interpretarSubcomando([flag]);
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.ajuda).toBe(true);
    }
    expect(ajudaGeral()).toContain("expx init");
  });
});
