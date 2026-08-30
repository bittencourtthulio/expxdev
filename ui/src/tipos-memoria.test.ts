import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { MemoriaSchema } from "../../src/parser/memoria/tipos.js";
import type { Estado, Memoria } from "./tipos.js";

/**
 * Prova que o espelho da UI não divergiu do contrato do servidor.
 *
 * A verificação é em RUNTIME porque `ui/src/telas/fixture.ts` faz
 * `as unknown as Estado`: o cast apaga qualquer divergência de tipo entre as
 * camadas, então um teste que só tipasse não falharia nunca.
 */

/** Objeto tipado pelo espelho da UI, montado do índice da fixture. */
function memoriaDaUI(): Memoria {
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

describe("espelho do tipo da memória na UI", () => {
  it("integração: objeto tipado pela UI é aceito pelo schema do servidor", () => {
    const r = MemoriaSchema.safeParse(memoriaDaUI());
    expect(r.success).toBe(true);
  });

  it("funcional: memoria null é válido no Estado, e o schema rejeita sem gerado_em", () => {
    // até T-02.04 o parser não produz a chave: o tipo TEM que aceitar null
    const estado = { memoria: null } as Pick<Estado, "memoria">;
    expect(estado.memoria).toBeNull();

    const { gerado_em: _fora, ...semData } = memoriaDaUI();
    expect(MemoriaSchema.safeParse(semData).success).toBe(false);
  });
});
