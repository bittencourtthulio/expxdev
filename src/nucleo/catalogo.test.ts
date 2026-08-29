import { describe, it, expect } from "vitest";
import { CATALOGO, buscarNoCatalogo, ehCamada, NOMES } from "./catalogo.js";

describe("catálogo das skills", () => {
  it("integração: tem as cinco skills e nenhuma URL repetida", () => {
    expect(CATALOGO).toHaveLength(5);
    const urls = CATALOGO.map((s) => s.repositorio);
    expect(new Set(urls).size).toBe(5);
    expect(NOMES).toEqual(["sprintx", "runx", "legadox", "stackx", "mergex"]);
  });

  it("funcional: dado o nome legadox, devolve a URL do repositório correspondente", () => {
    const s = buscarNoCatalogo("legadox");
    expect(s?.repositorio).toBe("https://github.com/bittencourtthulio/legadox");
    expect(buscarNoCatalogo("inexistente")).toBeUndefined();
  });

  it("funcional: legadox e stackx são camadas; sprintx e runx não são", () => {
    expect(ehCamada("legadox")).toBe(true);
    expect(ehCamada("stackx")).toBe(true);
    expect(ehCamada("sprintx")).toBe(false);
    expect(ehCamada("runx")).toBe(false);
  });
});
