import { describe, it, expect } from "vitest";
import { montarProjeto } from "../parser/projeto/montar.js";

/**
 * T-01.03 — a fixture de bloqueio aberto.
 *
 * É a que sustenta a regra mais importante do desenho: bloqueio aberto sobe
 * para o topo. Sem ela, a seção de bloqueios não teria como ser testada.
 */

const FIXTURE = "fixtures/watch/com-bloqueio";

describe("fixture de bloqueio aberto", () => {
  it("integração: tem um bloqueio com resolvido_em null e uma task bloqueada", () => {
    const p = montarProjeto(FIXTURE);
    expect(p.trabalhos.length).toBe(1);

    // dois bloqueios: um aberto e um resolvido, para o filtro de "aberto"
    // ter o que distinguir
    expect(p.bloqueios.length).toBe(2);
    const aberto = p.bloqueios.find((b) => b.id === "B-01");
    expect(aberto?.resolvido_em).toBe(null);
    expect(aberto?.task).toBe("T-01.02");
    expect(p.bloqueios.find((b) => b.id === "B-02")?.resolvido_em).toBe("2026-08-28");

    const tasks = p.trabalhos[0]?.sprints.flatMap((s) => s.tasks) ?? [];
    expect(tasks.filter((t) => t.status === "bloqueada").length).toBe(1);
  });

  it("funcional: o bloqueio devolvido tem aberto igual a true", () => {
    const p = montarProjeto(FIXTURE);
    expect(p.bloqueios.find((b) => b.id === "B-01")?.aberto).toBe(true);
    // um bloqueio resolvido não pode contar como aberto
    expect(p.bloqueios.find((b) => b.id === "B-02")?.aberto).toBe(false);
    expect(p.bloqueios.filter((b) => b.aberto).length).toBe(1);
  });
});
