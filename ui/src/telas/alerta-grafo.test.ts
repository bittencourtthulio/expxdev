import { describe, expect, it } from "vitest";
import { motivosDoAlerta, rotuloDoMotivo } from "./alerta-grafo.js";
import type { Task, Trabalho } from "../tipos.js";

function task(p: { id: string; depende_de?: string[]; status?: Task["status"]; paralelizavel?: boolean }): Task {
  return {
    id: p.id,
    titulo: `task ${p.id}`,
    fase: "F-01.1",
    status: p.status ?? "pendente",
    objetivo: "",
    teste_integracao: "t",
    teste_funcional: "t",
    criterio_aceite: "c",
    depende_de: p.depende_de ?? [],
    paralelizavel: p.paralelizavel ?? false,
    concluida_em: null,
    suite: "verde",
    arquivo: "docs/x/sprint-01/tasks.md",
    linha: 1,
  } as Task;
}

function trabalho(tasks: Task[]): Trabalho {
  return {
    trabalho_id: "x",
    titulo: "Trabalho",
    sprints: [{ sprint_id: "sprint-01", titulo: "S1", status: "em_andamento", criterio_saida: null, riscos: [], fases: [], tasks, progresso: 0 }],
  } as unknown as Trabalho;
}

describe("motivosDoAlerta", () => {
  it("plano sadio não gera motivo nenhum — o bloco segue recolhido", () => {
    const m = motivosDoAlerta(
      trabalho([task({ id: "T-01" }), task({ id: "T-02", depende_de: ["T-01"] })]),
    );

    expect(m).toEqual([]);
  });

  it("acusa ciclo de dependências", () => {
    const m = motivosDoAlerta(
      trabalho([
        task({ id: "T-01", depende_de: ["T-03"] }),
        task({ id: "T-02", depende_de: ["T-01"] }),
        task({ id: "T-03", depende_de: ["T-02"] }),
      ]),
    );

    expect(m).toContain("ciclo");
  });

  it("acusa dependência que aponta para id inexistente", () => {
    const m = motivosDoAlerta(trabalho([task({ id: "T-01", depende_de: ["T-99"] })]));

    expect(m).toContain("dependencia_quebrada");
  });

  it("acusa paralelismo declarado com dependência ainda aberta", () => {
    const m = motivosDoAlerta(
      trabalho([
        task({ id: "T-01", status: "pendente" }),
        task({ id: "T-02", depende_de: ["T-01"], paralelizavel: true }),
      ]),
    );

    expect(m).toContain("paralela_suspeita");
  });

  it("não acusa paralelismo quando a dependência já está concluída", () => {
    const m = motivosDoAlerta(
      trabalho([
        task({ id: "T-01", status: "concluida" }),
        task({ id: "T-02", depende_de: ["T-01"], paralelizavel: true }),
      ]),
    );

    expect(m).toEqual([]);
  });

  it("plano sem task não gera motivo — não há grafo a mostrar", () => {
    expect(motivosDoAlerta(trabalho([]))).toEqual([]);
  });

  it("todo motivo tem rótulo legível para o cabeçalho", () => {
    expect(rotuloDoMotivo("ciclo")).toContain("ciclo");
    expect(rotuloDoMotivo("dependencia_quebrada")).toContain("inexistente");
    expect(rotuloDoMotivo("paralela_suspeita")).toContain("paralelismo");
  });
});
