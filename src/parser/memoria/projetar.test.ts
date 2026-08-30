import { describe, it, expect } from "vitest";
import { lerIndice } from "./ler.js";
import { projetar } from "./projetar.js";
import { MemoriaSchema } from "./tipos.js";

const indice = lerIndice("fixtures/projeto-memoria");

describe("projeção enxuta do índice", () => {
  it("integração: a projeção passa no schema e não carrega por_termo nem trabalhos", () => {
    expect(indice).not.toBeNull();
    const m = projetar(indice!);
    expect(MemoriaSchema.safeParse(m).success).toBe(true);
    // as duas chaves pesadas ficam de fora de propósito (D-04)
    expect(m).not.toHaveProperty("por_termo");
    expect(m).not.toHaveProperty("trabalhos");
  });

  it("funcional: calculo.ts vem primeiro por ter regressão, e tabela.ts depois", () => {
    const m = projetar(indice!);
    const nomes = m.arquivos_de_risco.map((a) => a.arquivo);
    expect(nomes[0]).toBe("src/frete/calculo.ts");
    expect(nomes.indexOf("src/frete/tabela.ts")).toBeGreaterThan(0);
  });

  it("funcional: a ordenação usa regressão antes de contagem de trabalhos", () => {
    // um arquivo com MAIS trabalhos mas sem regressão não pode passar à frente
    // de um com regressão — a regra é regressão > QA > trabalhos (D-10)
    const forjado = structuredClone(indice!);
    const sinais = forjado.sinais!.arquivo as Record<string, { trabalhos: number }>;
    sinais["src/frete/tabela.ts"]!.trabalhos = 99;
    const m = projetar(forjado);
    expect(m.arquivos_de_risco[0]?.arquivo).toBe("src/frete/calculo.ts");
  });

  it("funcional: leva os artefatos contaminados e as coincidências da fixture", () => {
    const m = projetar(indice!);
    expect(m.contaminados.map((c) => c.artefato)).toContain(
      "docs/relatorios/2026-08-25-OC-2026-0199-integracao/tecnico.md",
    );
    expect(m.coincidencias.length).toBeGreaterThan(0);
    expect(m.regressoes).toHaveLength(1);
  });
});
