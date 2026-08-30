import { describe, it, expect } from "vitest";
import { montarProjeto } from "./montar.js";

/**
 * A memória entra no `Projeto` (decisão D-18): `montarProjeto` é quem monta o
 * projeto, e `estado.ts` só acrescenta as violações. A chave existe SEMPRE —
 * `null` quando não há índice —, porque o painel diferencia "não se aplica" de
 * "esqueceram de escrever".
 */

describe("memória no projeto montado", () => {
  it("integração: memória preenchida na fixture com índice, null nas outras duas", () => {
    expect(montarProjeto("fixtures/projeto-memoria").memoria).not.toBeNull();
    expect(montarProjeto("fixtures/projeto-memoria-corrompida").memoria).toBeNull();
    expect(montarProjeto("fixtures/projeto-ok").memoria).toBeNull();
  });

  it("funcional: a fixture com índice traz uma regressão e o arquivo de risco no topo", () => {
    const m = montarProjeto("fixtures/projeto-memoria").memoria;
    expect(m?.totais.regressoes).toBe(1);
    expect(m?.arquivos_de_risco[0]?.arquivo).toBe("src/frete/calculo.ts");
    // a chave existe mesmo quando vazia: ausente seria "esqueceram de escrever"
    expect(montarProjeto("fixtures/projeto-ok")).toHaveProperty("memoria");
  });
});
