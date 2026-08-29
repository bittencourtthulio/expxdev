import { describe, it, expect, afterEach } from "vitest";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { escreverAtomico } from "./atomico.js";

let p: ProjetoTemporario | undefined;
afterEach(() => {
  p?.descartar();
  p = undefined;
});

describe("escrita atômica de .expx", () => {
  it("integração: falha no meio deixa o .expx anterior intacto e sem pasta temporária", () => {
    p = projetoTemporario();
    const expx = join(p.raiz, ".expx");
    mkdirSync(expx, { recursive: true });
    writeFileSync(join(expx, "marca.txt"), "conteudo original");

    expect(() =>
      escreverAtomico(p!.raiz, (tmp) => {
        writeFileSync(join(tmp, "novo.txt"), "parcial");
        throw new Error("falha simulada no meio da montagem");
      }),
    ).toThrow("falha simulada");

    expect(readFileSync(join(expx, "marca.txt"), "utf8")).toBe("conteudo original");
    expect(existsSync(join(expx, "novo.txt"))).toBe(false);
    expect(readdirSync(p.raiz).filter((e) => e.startsWith(".expx.tmp"))).toHaveLength(0);
  });

  it("funcional: sucesso troca o conteúdo e não deixa resíduo temporário", () => {
    p = projetoTemporario();
    const expx = join(p.raiz, ".expx");
    mkdirSync(expx, { recursive: true });
    writeFileSync(join(expx, "antigo.txt"), "vai sumir");

    escreverAtomico(p.raiz, (tmp) => {
      writeFileSync(join(tmp, "novo.txt"), "conteudo novo");
    });

    expect(readFileSync(join(expx, "novo.txt"), "utf8")).toBe("conteudo novo");
    expect(existsSync(join(expx, "antigo.txt"))).toBe(false);
    expect(readdirSync(p.raiz).filter((e) => e.startsWith(".expx.tmp"))).toHaveLength(0);
  });

  it("funcional: projeto sem .expx anterior é criado do zero", () => {
    p = projetoTemporario();
    escreverAtomico(p.raiz, (tmp) => {
      writeFileSync(join(tmp, "primeiro.txt"), "ok");
    });
    expect(readFileSync(join(p.raiz, ".expx", "primeiro.txt"), "utf8")).toBe("ok");
  });
});
