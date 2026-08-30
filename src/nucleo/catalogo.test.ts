import { describe, it, expect } from "vitest";
import { CATALOGO, buscarNoCatalogo, ehCamada, NOMES } from "./catalogo.js";

describe("catálogo das skills", () => {
  it("integração: tem as seis skills do catalogo e nenhuma URL repetida", () => {
    expect(CATALOGO).toHaveLength(6);
    const urls = CATALOGO.map((s) => s.repositorio);
    expect(new Set(urls).size).toBe(6);
    expect(NOMES).toEqual(["sprintx", "runx", "legadox", "stackx", "mergex", "memox"]);
  });

  it("funcional: memox aponta para o repositório do MemoX e é camada", () => {
    // o memox não tem fluxo próprio: só produz o índice que as outras consultam
    expect(buscarNoCatalogo("memox")?.repositorio).toBe("https://github.com/bittencourtthulio/MemoX");
    expect(ehCamada("memox")).toBe(true);
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
