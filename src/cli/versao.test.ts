import { describe, it, expect } from "vitest";
import { executarExpx } from "./expx.js";
import { versaoDoCli } from "../nucleo/lock.js";

describe("expx --version", () => {
  it("imprime a versao do CLI e devolve 0", async () => {
    const linhas: string[] = [];
    const codigo = await executarExpx(["--version"], { escrever: (s) => linhas.push(s) });
    expect(codigo).toBe(0);
    expect(linhas.join("").trim()).toBe(versaoDoCli());
  });

  it("aceita -v como atalho", async () => {
    const linhas: string[] = [];
    const codigo = await executarExpx(["-v"], { escrever: (s) => linhas.push(s) });
    expect(codigo).toBe(0);
    expect(linhas.join("").trim()).toBe(versaoDoCli());
  });
});
