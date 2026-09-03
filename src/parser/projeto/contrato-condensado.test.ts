import { describe, it, expect } from "vitest";
import { montarProjeto } from "./montar.js";

/**
 * Teste de CONTRATO, e nao de codigo do painel.
 *
 * As fixturas destes dois casos sao os exemplos `kind: plano` copiados dos
 * `references/00-schema.md` da runx e da sprintx. Se uma das skills mudar o
 * formato que documenta sem avisar o painel, este teste quebra — que e
 * exatamente o alarme que faltou quando o `kind: plano` nasceu na runx e o
 * parser daqui ainda nao o conhecia.
 */
describe("contrato: o painel le o plano condensado das duas skills", () => {
  it("runx: ocorrencia com plano condensado monta sprint, fases e tasks", () => {
    const p = montarProjeto("fixtures/projeto-condensado");
    const s = p.trabalhos.find((x) => x.trabalho_id === "OC-2026-0143")?.sprints[0];
    expect(s?.titulo).toBe("Corrigir o tooltip do badge");
    expect(s?.fases).toHaveLength(1);
    expect(s?.tasks).toHaveLength(2);
    expect(s?.tasks[0].suite).toBe("parcial");
  });

  it("sprintx: feature com sprint de fase unica monta igual", () => {
    const p = montarProjeto("fixtures/projeto-condensado-sprintx");
    const s = p.trabalhos.find((x) => x.trabalho_id === "exportacao-csv-relatorios")?.sprints[0];
    expect(s?.titulo).toBe("Geracao do CSV");
    expect(s?.criterio_saida).toBe("Relatorio de 10 mil linhas exporta em CSV valido");
    expect(s?.fases).toHaveLength(1);
    expect(s?.tasks).toHaveLength(1);
    expect(s?.tasks[0].suite).toBe("parcial");
  });

  it("nenhum arquivo das duas fixturas cai fora do schema", () => {
    for (const raiz of ["fixtures/projeto-condensado", "fixtures/projeto-condensado-sprintx"]) {
      const p = montarProjeto(raiz);
      expect(p.rejeitados ?? [], `${raiz} rejeitou arquivo`).toHaveLength(0);
    }
  });
});
