import { describe, it, expect } from "vitest";
import { avaliarSelecao } from "./selecao.js";

describe("regras de seleção de skills", () => {
  it("integração: avalia as combinações e diz quais geram aviso", () => {
    expect(avaliarSelecao(["sprintx"]).avisos).toHaveLength(0);
    expect(avaliarSelecao(["legadox"]).avisos.length).toBeGreaterThan(0);
    expect(avaliarSelecao(["legadox", "sprintx"]).avisos).toHaveLength(0);
    expect(avaliarSelecao(["stackx", "runx"]).avisos).toHaveLength(0);
  });

  it("funcional: legadox sozinho avisa que é camada, e nunca bloqueia", () => {
    const r = avaliarSelecao(["legadox"]);
    expect(r.permitido).toBe(true);
    expect(r.avisos.join(" ")).toContain("camada");
    expect(r.precisaConfirmar).toBe(true);
  });

  it("funcional: mergex com sprintx sinaliza a integração disponível", () => {
    const r = avaliarSelecao(["mergex", "sprintx"]);
    expect(r.permitido).toBe(true);
    expect(r.integracoes).toContain("mergex");
  });

  it("funcional: nome fora do catálogo é recusado nomeando o nome", () => {
    const r = avaliarSelecao(["sprintx", "inexistente"]);
    expect(r.permitido).toBe(false);
    expect(r.erros.join(" ")).toContain("inexistente");
  });

  it("funcional: seleção vazia é recusada", () => {
    expect(avaliarSelecao([]).permitido).toBe(false);
  });
});
