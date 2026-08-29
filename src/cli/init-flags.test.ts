import { describe, it, expect } from "vitest";
import { interpretarFlagsInit } from "./init-flags.js";

describe("flags do init", () => {
  it("integração: toda pergunta do init tem equivalente por flag", () => {
    const r = interpretarFlagsInit(["--skills", "sprintx,runx", "--harness", "claude,opencode", "--painel", "--yes"]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.opcoes.skills).toEqual(["sprintx", "runx"]);
    expect(r.opcoes.harness).toEqual(["claude", "opencode"]);
    expect(r.opcoes.painel).toBe(true);
    expect(r.opcoes.sim).toBe(true);
  });

  it("funcional: --skills aceita repetição da flag além da lista separada por vírgula", () => {
    const r = interpretarFlagsInit(["--skills", "sprintx", "--skills", "mergex"]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.opcoes.skills).toEqual(["sprintx", "mergex"]);
  });

  it("funcional: harness inválido é recusado nomeando o valor", () => {
    const r = interpretarFlagsInit(["--harness", "emacs"]);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.erro).toContain("emacs");
  });

  it("funcional: sem flags, nada é assumido — a seleção fica vazia para a interação decidir", () => {
    const r = interpretarFlagsInit([]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.opcoes.skills).toEqual([]);
    expect(r.opcoes.sim).toBe(false);
  });

  it("funcional: --skills sem valor é erro, não silêncio", () => {
    const r = interpretarFlagsInit(["--skills"]);
    expect(r.ok).toBe(false);
  });
});
