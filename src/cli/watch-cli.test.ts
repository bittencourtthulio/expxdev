import { describe, it, expect } from "vitest";
import { executarExpx } from "./expx.js";

/**
 * T-03.07 — o `watch` como subcomando do CLI existente.
 *
 * Decisão D-01: subcomando, não binário separado. O ponto de extensão são os
 * três lugares que `base/cli-e-subcomandos.md` mapeou — `SUBCOMANDOS`, a
 * ajuda, e a tabela `EXECUTORES`.
 */

function capturar(): { saida: string[]; erro: string[]; escrever: (t: string) => void; escreverErro: (t: string) => void } {
  const saida: string[] = [];
  const erro: string[] = [];
  return {
    saida,
    erro,
    escrever: (t) => saida.push(t),
    escreverErro: (t) => erro.push(t),
  };
}

describe("expx watch pelo CLI", () => {
  it("integração: expx watch --ajuda escreve a ajuda e devolve zero", async () => {
    const c = capturar();
    const codigo = await executarExpx(["watch", "--ajuda"], {
      escrever: c.escrever,
      escreverErro: c.escreverErro,
    });

    expect(codigo).toBe(0);
    expect(c.erro).toEqual([]);
    const texto = c.saida.join("");
    expect(texto).toContain("expx watch");
    expect(texto).toContain("--todos");
    expect(texto).toContain("somente leitura");
  });

  it("funcional: opção desconhecida devolve 1 e explica, sem lançar", async () => {
    const c = capturar();
    const codigo = await executarExpx(["watch", "--invenatada"], {
      escrever: c.escrever,
      escreverErro: c.escreverErro,
    });

    expect(codigo).toBe(1);
    expect(c.erro.join("")).toContain("--invenatada");
  });

  it("funcional: a ajuda geral do expx anuncia o watch", async () => {
    const c = capturar();
    await executarExpx(["--ajuda"], { escrever: c.escrever, escreverErro: c.escreverErro });
    expect(c.saida.join("")).toContain("expx watch");
  });
});
