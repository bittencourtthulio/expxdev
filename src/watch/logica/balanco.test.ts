import { describe, it, expect } from "vitest";
import { projetarVisao } from "../visao/projetar.js";
import { balancoDe, proximaTask } from "./balanco.js";

/**
 * O balanço separa trabalhos que a barra de progresso mostraria iguais —
 * ver o cabeçalho de `balanco.ts`.
 */

const raiz = (n: string): string => `fixtures/watch/${n}`;

describe("balancoDe", () => {
  it("funcional: quebra as tasks do plano por status", () => {
    const v = projetarVisao(raiz("com-estado"));
    const t = v.frota.find((f) => f.trabalho.trabalho_id === "exportacao-csv");
    expect(t).toBeDefined();

    // A fixture tem exatamente uma task de cada: concluída, em andamento e
    // pendente — o caso que a barra `1/3` esconderia.
    expect(balancoDe(t!.trabalho)).toEqual({
      concluidas: 1,
      emAndamento: 1,
      bloqueadas: 0,
      pendentes: 1,
      total: 3,
    });
  });

  it("integracao: o total do balanco bate com as tasks das sprints", () => {
    const v = projetarVisao(raiz("com-estado"));
    const t = v.frota.find((f) => f.trabalho.trabalho_id === "exportacao-csv")!;
    const tasksDoPlano = t.trabalho.sprints.flatMap((s) => s.tasks).length;

    expect(balancoDe(t.trabalho).total).toBe(tasksDoPlano);
  });

  it("funcional: trabalho sem sprints devolve balanco zerado, nao quebra", () => {
    const v = projetarVisao(raiz("varios-trabalhos"));
    const t = v.frota.find((f) => f.trabalho.trabalho_id === "em-andamento");
    expect(t).toBeDefined();

    expect(balancoDe(t!.trabalho).total).toBe(0);
  });
});

describe("proximaTask", () => {
  it("funcional: aponta a primeira pendente na ordem do plano", () => {
    const v = projetarVisao(raiz("com-estado"));
    const t = v.frota.find((f) => f.trabalho.trabalho_id === "exportacao-csv")!;

    // T-01.01 está concluída e T-01.02 em andamento: a próxima em ABERTO é a
    // T-01.03, não a que está rodando agora.
    expect(proximaTask(t.trabalho)?.id).toBe("T-01.03");
  });

  it("funcional: sem pendente nenhuma, nao ha proxima", () => {
    const v = projetarVisao(raiz("concluido"));
    const t = v.frota[0];
    if (t !== undefined) {
      const b = balancoDe(t.trabalho);
      if (b.pendentes === 0) expect(proximaTask(t.trabalho)).toBeNull();
    }
  });
});
