import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

/**
 * As fixtures de memória são artefato de teste, mas artefato que precisa ser
 * fiel: elas vêm de `exemplos/indice.exemplo.json` do repositório MemoX, que é
 * a única forma real do índice disponível (decisão D-24). Um índice reduzido
 * escrito à mão passaria a mentir no dia em que o motor mudasse.
 */

const VALIDA = "fixtures/projeto-memoria/.expx/memoria/indice.json";
const CORROMPIDA = "fixtures/projeto-memoria-corrompida/.expx/memoria/indice.json";

type Indice = {
  versao: number;
  totais: { regressoes: number };
  sinais: {
    arquivo: Record<string, { regressoes: unknown[]; reprovacoes_qa: number }>;
  };
  artefatos_contaminados: Record<string, string[]>;
};

describe("fixture de projeto com índice de memória", () => {
  it("integração: o índice da fixture é JSON válido na versão 1", () => {
    const bruto = readFileSync(VALIDA, "utf8");
    const indice = JSON.parse(bruto) as Indice;
    expect(indice.versao).toBe(1);
  });

  it("funcional: calculo.ts tem uma regressão e uma reprovação de QA", () => {
    const indice = JSON.parse(readFileSync(VALIDA, "utf8")) as Indice;
    expect(indice.totais.regressoes).toBe(1);
    const calculo = indice.sinais.arquivo["src/frete/calculo.ts"];
    expect(calculo?.regressoes).toHaveLength(1);
    expect(calculo?.reprovacoes_qa).toBe(1);
    // o artefato contaminado é o que a tela precisa mostrar em destaque
    expect(Object.keys(indice.artefatos_contaminados)).toContain(
      "docs/relatorios/2026-08-25-OC-2026-0199-integracao/tecnico.md",
    );
  });
});

describe("fixture de índice corrompido", () => {
  it("integração: o índice truncado faz JSON.parse lançar", () => {
    const bruto = readFileSync(CORROMPIDA, "utf8");
    expect(() => JSON.parse(bruto)).toThrow();
  });

  it("funcional: o arquivo não está vazio — é truncado, não ausente", () => {
    const bruto = readFileSync(CORROMPIDA, "utf8");
    expect(bruto.length).toBeGreaterThan(0);
    // representa o índice lido no instante da gravação, não um arquivo em branco
    expect(bruto.trimStart().startsWith("{")).toBe(true);
  });
});
