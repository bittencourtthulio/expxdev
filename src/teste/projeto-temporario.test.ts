import { describe, it, expect } from "vitest";
import { existsSync, writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { projetoTemporario } from "./projeto-temporario.js";

describe("harness de projeto temporário", () => {
  it("integração: cria a pasta, aceita escrita e some ao descartar", () => {
    const p = projetoTemporario();
    expect(existsSync(p.raiz)).toBe(true);
    writeFileSync(join(p.raiz, "arquivo.txt"), "conteudo");
    expect(existsSync(join(p.raiz, "arquivo.txt"))).toBe(true);
    p.descartar();
    expect(existsSync(p.raiz)).toBe(false);
  });

  it("funcional: a cópia de uma fixture é independente da origem", () => {
    const origem = "fixtures/cli/projeto-com-expx";
    const p = projetoTemporario(origem);
    const lockCopia = join(p.raiz, ".expx/expx-lock.json");
    expect(existsSync(lockCopia)).toBe(true);

    writeFileSync(lockCopia, '{"alterado":true}');
    const original = readFileSync(join(origem, ".expx/expx-lock.json"), "utf8");
    expect(original).not.toContain("alterado");

    p.descartar();
    expect(existsSync(join(origem, ".expx/expx-lock.json"))).toBe(true);
  });
});
