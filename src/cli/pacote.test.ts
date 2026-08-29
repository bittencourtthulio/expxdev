import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { executarExpx } from "./expx.js";

type Pacote = {
  name: string;
  bin: Record<string, string>;
  files: string[];
  version: string;
};

function pacote(): Pacote {
  return JSON.parse(readFileSync("package.json", "utf8")) as Pacote;
}

describe("pacote publicável", () => {
  it("integração: o pacote declara expxdev com os dois binários", () => {
    const p = pacote();
    expect(p.name).toBe("expxdev");
    expect(p.bin["expx"]).toBe("dist/cli/expx-bin.js");
    expect(p.bin["expx-painel"]).toBe("dist/cli/principal.js");
    expect(p.files).toContain("dist");
    expect(p.files).toContain("ui/dist");
  });

  it("funcional: expx --ajuda lista os seis subcomandos e devolve 0", async () => {
    const linhas: string[] = [];
    const codigo = await executarExpx(["--ajuda"], { escrever: (s) => linhas.push(s) });
    expect(codigo).toBe(0);
    for (const s of ["init", "panel", "add", "remove", "update", "doctor"]) {
      expect(linhas.join(""), `falta ${s}`).toContain(`expx ${s}`);
    }
  });

  it("funcional: todo subcomando declarado tem executor ligado", async () => {
    for (const s of ["add", "remove", "update", "doctor"]) {
      const erros: string[] = [];
      await executarExpx([s], { escrever: () => {}, escreverErro: (t) => erros.push(t) });
      expect(erros.join(""), `${s} sem executor`).not.toContain("ainda nao esta disponivel");
    }
  });
});
