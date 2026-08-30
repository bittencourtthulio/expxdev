import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { MemoriaSchema, type Memoria } from "./tipos.js";

/**
 * O schema valida em RUNTIME, e não é preciosismo: `tsconfig.json` exclui
 * `**\/*.test.ts` e o vitest não faz typecheck, então uma asserção de tipo não
 * falharia nunca. Pior, `ui/src/telas/fixture.ts` faz `as unknown as Estado` —
 * o cast apagaria qualquer divergência entre as camadas (decisão D-27).
 */

/**
 * A projeção é montada INLINE a partir do índice lido: `projetar.ts` só nasce
 * em T-02.02, e esta task não pode depender dela.
 */
function projecaoDaFixture(): Memoria {
  const i = JSON.parse(
    readFileSync("fixtures/projeto-memoria/.expx/memoria/indice.json", "utf8"),
  ) as Record<string, any>;
  return {
    gerado_em: i["gerado_em"] as string,
    versao: i["versao"] as number,
    totais: i["totais"] as Memoria["totais"],
    arquivos_de_risco: [],
    regressoes: i["regressoes"] as Memoria["regressoes"],
    coincidencias: i["coincidencias_arquivo"] as Memoria["coincidencias"],
    contaminados: [],
    modulos: [],
  };
}

describe("schema da memória", () => {
  it("integração: a projeção montada da fixture passa no schema", () => {
    const r = MemoriaSchema.safeParse(projecaoDaFixture());
    expect(r.success).toBe(true);
  });

  it("funcional: objeto sem gerado_em é rejeitado apontando o campo", () => {
    const { gerado_em: _omitido, ...semData } = projecaoDaFixture();
    const r = MemoriaSchema.safeParse(semData);
    expect(r.success).toBe(false);
    if (!r.success) {
      expect(r.error.issues.some((i) => i.path.includes("gerado_em"))).toBe(true);
    }
  });
});
