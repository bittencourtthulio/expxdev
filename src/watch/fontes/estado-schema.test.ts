import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { EstadoExpx, CHAVES_ESTADO } from "./estado-schema.js";

/**
 * T-01.04 — o schema do contrato `expx-estado` v1.
 *
 * Não existia schema nenhum deste contrato no repositório: a busca por
 * `estado.json|expx_estado` em `src/`, `ui/src` e `nucleo/` não devolvia nada
 * (base/estado-json.md, risco 1). Este é o primeiro.
 */

function fixture(nome: string): unknown {
  return JSON.parse(
    readFileSync(`fixtures/watch/${nome}/.expx/estado.json`, "utf8"),
  ) as unknown;
}

describe("schema do expx-estado", () => {
  it("integração: o estado.json da fixture com-estado é válido", () => {
    const r = EstadoExpx.safeParse(fixture("com-estado"));
    expect(r.success, r.success ? "" : JSON.stringify(r.error.issues)).toBe(true);
    if (r.success) {
      expect(r.data.trabalho).toBe("exportacao-csv");
      expect(r.data.ferramenta).toBe("sprintx");
      // fora do modo legado, raio é null — e a chave existe (R6)
      expect(r.data.raio).toBe(null);
    }

    // legado-raio-alto também precisa passar, com os campos de legado preenchidos
    const l = EstadoExpx.safeParse(fixture("legado-raio-alto"));
    expect(l.success).toBe(true);
    if (l.success) expect(l.data.raio).toBe("alto");
  });

  it("funcional: objeto sem uma chave obrigatória é rejeitado, porque R6 proíbe omitir", () => {
    const base = fixture("com-estado") as Record<string, unknown>;

    // cada uma das quinze chaves, removida uma por vez, precisa reprovar
    for (const chave of CHAVES_ESTADO) {
      const parcial = { ...base };
      delete parcial[chave];
      const r = EstadoExpx.safeParse(parcial);
      expect(r.success, `remover ${chave} deveria reprovar`).toBe(false);
    }
  });

  it("funcional: enum fora do vocabulário é rejeitado", () => {
    const base = fixture("com-estado") as Record<string, unknown>;
    // R3: minúsculo e sem acento. "F6" é forma inválida de "f6".
    expect(EstadoExpx.safeParse({ ...base, fase: "F6" }).success).toBe(false);
    expect(EstadoExpx.safeParse({ ...base, ferramenta: "inventada" }).success).toBe(false);
    expect(EstadoExpx.safeParse({ ...base, raio: "ALTO" }).success).toBe(false);
  });
});
