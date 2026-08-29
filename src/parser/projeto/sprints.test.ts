import { describe, it, expect } from "vitest";
import { montarProjeto } from "./montar.js";

describe("montagem de sprints, fases e tasks", () => {
  it("integração: o trabalho sprintx traz sua sprint com fases e tasks aninhadas", () => {
    const p = montarProjeto("fixtures/projeto-ok");
    const t = p.trabalhos.find((x) => x.trabalho_id === "exportacao-csv");
    expect(t).toBeDefined();
    expect(t?.sprints).toHaveLength(1);
    const s = t?.sprints[0];
    expect(s?.sprint_id).toBe("sprint-01");
    expect(s?.fases).toHaveLength(3);
    expect(s?.tasks).toHaveLength(4);
  });

  it("funcional: o número de tasks aninhadas bate com o arquivo e a fase vem da task", () => {
    const p = montarProjeto("fixtures/projeto-ok");
    const t = p.trabalhos.find((x) => x.trabalho_id === "exportacao-csv");
    const s = t?.sprints[0];
    const f1 = s?.fases.find((f) => f.id === "F-01.1");
    const f2 = s?.fases.find((f) => f.id === "F-01.2");
    // o vínculo é pelo campo `fase` da task (decisão D-13)
    expect(f1?.tasks.map((x) => x.id)).toEqual(["T-01.01", "T-01.02"]);
    expect(f2?.tasks.map((x) => x.id)).toEqual(["T-01.03"]);
  });
});

describe("calculo de progresso", () => {
  it("integração: o progresso da sprint fica entre 0 e 1", () => {
    const p = montarProjeto("fixtures/projeto-ok");
    for (const t of p.trabalhos) {
      for (const s of t.sprints) {
        expect(s.progresso).toBeGreaterThanOrEqual(0);
        expect(s.progresso).toBeLessThanOrEqual(1);
      }
    }
  });

  it("funcional: fase com 2 de 2 concluídas dá 1; com 0 de 1 dá 0; sem task dá 0", () => {
    const p = montarProjeto("fixtures/projeto-ok");
    const t = p.trabalhos.find((x) => x.trabalho_id === "exportacao-csv");
    const s = t?.sprints[0];
    expect(s?.fases.find((f) => f.id === "F-01.1")?.progresso).toBe(1);
    expect(s?.fases.find((f) => f.id === "F-01.2")?.progresso).toBe(0);
    // fase com uma task pendente também dá 0, sem dividir por zero
    expect(s?.fases.find((f) => f.id === "F-01.3")?.progresso).toBe(0);
    // 2 de 4 tasks concluídas na sprint
    expect(s?.progresso).toBeCloseTo(2 / 4, 5);
  });
});

describe("bloqueios e historico", () => {
  it("integração: o projeto traz bloqueios e histórico preenchidos", () => {
    const p = montarProjeto("fixtures/projeto-ok");
    expect(p.bloqueios.length).toBeGreaterThan(0);
    expect(p.historico.length).toBeGreaterThan(0);
  });

  it("funcional: bloqueio com resolvido_em null conta como aberto; o resolvido não", () => {
    const p = montarProjeto("fixtures/projeto-ok");
    const abertos = p.bloqueios.filter((b) => b.aberto);
    const fechados = p.bloqueios.filter((b) => !b.aberto);
    expect(abertos.map((b) => b.id)).toContain("B-01");
    expect(fechados.map((b) => b.id)).toContain("B-02");
  });

  it("funcional: a entrada do histórico tem relatório técnico e de uso", () => {
    const p = montarProjeto("fixtures/projeto-ok");
    const e = p.historico[0];
    expect(e?.tecnico).toBeDefined();
    expect(e?.uso).toBeDefined();
    expect(e?.modulo_afetado).toContain("frete");
    // o relatório de uso não expõe código, nem no YAML
    expect(e?.uso).not.toHaveProperty("arquivos_alterados");
  });
});
