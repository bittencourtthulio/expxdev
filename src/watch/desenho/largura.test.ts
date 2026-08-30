import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import matter from "gray-matter";
import { cortar, largura } from "./largura.js";

/**
 * T-02.01 — medir e cortar por COLUNA, não por code point.
 *
 * R13 garante acento em `titulo` e `objetivo`. Em NFC, "ç" é um code point e
 * uma coluna; em NFD são dois code points e ainda uma coluna. Nome vindo do
 * macOS chega em NFD, e o corte em 80 colunas erraria (decisão D-15).
 */

describe("largura e corte", () => {
  it("integração: nenhum título das fixtures excede 60 colunas depois de cortado", () => {
    const titulos: string[] = [];
    for (const f of ["com-estado", "legado-raio-alto", "concluido", "com-bloqueio"]) {
      const caminho =
        f === "legado-raio-alto"
          ? `fixtures/watch/${f}/docs/OC-2026-0142-frete/ORQUESTRADOR.md`
          : `fixtures/watch/${f}/docs/exportacao-csv/ORQUESTRADOR.md`;
      const fm = matter(readFileSync(caminho, "utf8")).data as { titulo: string };
      titulos.push(fm.titulo);
    }
    expect(titulos.length).toBe(4);

    for (const t of titulos) {
      const cortado = cortar(t, 60);
      expect(largura(cortado), `"${cortado}" excede 60`).toBeLessThanOrEqual(60);
    }
  });

  it("funcional: 'ç' em NFD conta uma coluna, não dois code points", () => {
    const nfd = "frança"; // c + cedilha combinante = 7 code points, 6 colunas
    const nfc = "franca";

    expect(nfd.length).toBe(7);
    expect(largura(nfd)).toBe(6);
    expect(largura(nfc)).toBe(6);

    // e o corte em 10 devolve dez COLUNAS, não dez code points
    const texto = nfd + nfd; // 12 colunas
    expect(largura(cortar(texto, 10))).toBeLessThanOrEqual(10);
  });

  it("funcional: texto que cabe não é alterado, e o que não cabe ganha reticência", () => {
    expect(cortar("curto", 20)).toBe("curto");
    expect(cortar("exatamente-dez", 14)).toBe("exatamente-dez");

    const longo = cortar("um titulo bem mais longo do que cabe", 12);
    expect(largura(longo)).toBeLessThanOrEqual(12);
    expect(longo.endsWith("…")).toBe(true);
  });

  it("funcional: largura zero ou negativa devolve string vazia, sem lançar", () => {
    expect(() => cortar("qualquer", 0)).not.toThrow();
    expect(cortar("qualquer", 0)).toBe("");
    expect(cortar("qualquer", -5)).toBe("");
  });
});
