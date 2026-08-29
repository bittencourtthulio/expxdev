import { describe, it, expect } from "vitest";
import { lerEstado } from "../../servidor/estado.js";

const HOJE = new Date("2026-08-29T12:00:00Z");
const ler = (raiz: string) => lerEstado({ raiz, diasBloqueio: 7 }, HOJE);

/**
 * O painel descobre trabalhos pelo CONTEÚDO (`kind: orquestrador`), nunca pelo
 * caminho. Isso é o que o deixa imune a reorganização de pastas: a sprintx vai
 * passar de `docs/<slug>/` para `docs/sprintx/features/<slug>/`, e o painel
 * precisa ler as duas — inclusive misturadas, durante a migração.
 *
 * Este teste existe para que essa propriedade não se perca por acidente.
 */
describe("compatibilidade entre layouts de pasta", () => {
  it("integração: o layout novo devolve os mesmos trabalhos que o antigo", () => {
    const antigo = ler("fixtures/projeto-ok");
    const novo = ler("fixtures/projeto-novo-layout");

    expect(novo.trabalhos.map((t) => t.trabalho_id).sort()).toEqual(
      antigo.trabalhos.map((t) => t.trabalho_id).sort(),
    );
    expect(novo.rejeicoes).toHaveLength(0);
    expect(novo.violacoes).toHaveLength(0);
  });

  it("funcional: sprints, tasks e progresso são idênticos nos dois layouts", () => {
    const antigo = ler("fixtures/projeto-ok");
    const novo = ler("fixtures/projeto-novo-layout");

    for (const t of novo.trabalhos) {
      const par = antigo.trabalhos.find((x) => x.trabalho_id === t.trabalho_id);
      expect(par, `${t.trabalho_id} deveria existir nos dois`).toBeDefined();
      expect(t.sprints.length).toBe(par?.sprints.length);
      expect(t.sprints.flatMap((s) => s.tasks).length).toBe(par?.sprints.flatMap((s) => s.tasks).length);
      expect(t.progresso).toBeCloseTo(par?.progresso ?? -1, 5);
    }
  });

  it("funcional: o histórico é encontrado sob docs/relatorios em qualquer layout", () => {
    expect(ler("fixtures/projeto-novo-layout").historico).toHaveLength(1);
  });

  it("funcional: a pasta do trabalho reflete o caminho real, não um caminho presumido", () => {
    const novo = ler("fixtures/projeto-novo-layout");
    const f = novo.trabalhos.find((t) => t.expx_tool === "sprintx");
    const o = novo.trabalhos.find((t) => t.expx_tool === "runx");
    expect(f?.pasta).toContain("sprintx/features/");
    expect(o?.pasta).toContain("runx/ocorrencias/");
  });
});
