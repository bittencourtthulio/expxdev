import { describe, expect, it } from "vitest";
import { montarTopologia } from "./topologia.js";
import type { TrabalhoMontado, TaskSituada } from "../parser/projeto/montar.js";
import type { StatusTask } from "../parser/esquema/enums.js";

type Parcial = {
  id: string;
  depende_de?: string[];
  status?: StatusTask;
  paralelizavel?: boolean;
  fase?: string;
};

function task(p: Parcial): TaskSituada {
  return {
    id: p.id,
    titulo: `task ${p.id}`,
    fase: p.fase ?? "F-01.1",
    status: p.status ?? "pendente",
    objetivo: "",
    arquivos: { cria: [], altera: [] },
    teste_integracao: "t",
    teste_funcional: "t",
    criterio_aceite: "c",
    depende_de: p.depende_de ?? [],
    paralelizavel: p.paralelizavel ?? false,
    concluida_em: null,
    suite: "verde",
    arquivo: "docs/x/sprint-01/tasks.md",
    linha: 1,
    trabalho_id: "x",
    sprint_id: "sprint-01",
  };
}

function trabalho(tasks: TaskSituada[]): TrabalhoMontado {
  return {
    trabalho_id: "x",
    titulo: "Trabalho de teste",
    pasta: "docs/x",
    arquivo: "docs/x/ORQUESTRADOR.md",
    expx_tool: "sprintx",
    tipo_trabalho: "feature",
    tipo_ocorrencia: null,
    estagio: "execucao",
    status: "em_andamento",
    criado_em: "2026-09-01",
    atualizado_em: "2026-09-01",
    concluido_em: null,
    sprints: [
      {
        sprint_id: "sprint-01",
        titulo: "Sprint 1",
        status: "em_andamento",
        criterio_saida: "c",
        riscos: [],
        fases: [],
        tasks,
        progresso: 0,
        arquivo: "docs/x/sprint-01/tasks.md",
        linha: 1,
      },
    ],
    sprints_declaradas: ["sprint-01"],
    progresso: 0,
    bloqueios: [],
    divergente: false,
    linhas: new Map(),
    branch: null,
  } as TrabalhoMontado;
}

describe("montarTopologia", () => {
  it("põe no nível 0 a task que não espera ninguém e escalona as dependentes", () => {
    const t = montarTopologia(
      trabalho([
        task({ id: "T-01" }),
        task({ id: "T-02", depende_de: ["T-01"] }),
        task({ id: "T-03", depende_de: ["T-02"] }),
      ]),
    );

    expect(t.nos.find((n) => n.id === "T-01")?.nivel).toBe(0);
    expect(t.nos.find((n) => n.id === "T-02")?.nivel).toBe(1);
    expect(t.nos.find((n) => n.id === "T-03")?.nivel).toBe(2);
    expect(t.niveis).toHaveLength(3);
  });

  it("agrupa no mesmo nível as tasks que podem rodar em paralelo de verdade", () => {
    const t = montarTopologia(
      trabalho([
        task({ id: "T-01" }),
        task({ id: "T-02", depende_de: ["T-01"] }),
        task({ id: "T-03", depende_de: ["T-01"] }),
      ]),
    );

    expect(t.niveis[1]?.map((n) => n.id)).toEqual(["T-02", "T-03"]);
  });

  it("calcula o caminho crítico como a cadeia mais longa, não a mais numerosa", () => {
    // T-04 depende de uma cadeia de três; T-05 pendura direto na raiz.
    const t = montarTopologia(
      trabalho([
        task({ id: "T-01" }),
        task({ id: "T-02", depende_de: ["T-01"] }),
        task({ id: "T-03", depende_de: ["T-02"] }),
        task({ id: "T-04", depende_de: ["T-03"] }),
        task({ id: "T-05", depende_de: ["T-01"] }),
      ]),
    );

    expect(t.caminho_critico).toEqual(["T-01", "T-02", "T-03", "T-04"]);
    expect(t.nos.find((n) => n.id === "T-05")?.critico).toBe(false);
  });

  it("marca a aresta como crítica só entre vizinhos do caminho crítico", () => {
    const t = montarTopologia(
      trabalho([
        task({ id: "T-01" }),
        task({ id: "T-02", depende_de: ["T-01"] }),
        task({ id: "T-03", depende_de: ["T-01"] }),
      ]),
    );

    const criticas = t.arestas.filter((a) => a.critica);
    expect(criticas).toHaveLength(1);
    expect(criticas[0]).toMatchObject({ de: "T-01", para: "T-02" });
  });

  it("detecta ciclo e não entra em laço infinito ao calcular nível", () => {
    const t = montarTopologia(
      trabalho([
        task({ id: "T-01", depende_de: ["T-03"] }),
        task({ id: "T-02", depende_de: ["T-01"] }),
        task({ id: "T-03", depende_de: ["T-02"] }),
      ]),
    );

    expect(t.nos.every((n) => n.em_ciclo)).toBe(true);
    expect(t.nos).toHaveLength(3);
  });

  it("registra dependência que aponta para id inexistente sem derrubar o grafo", () => {
    const t = montarTopologia(
      trabalho([task({ id: "T-01" }), task({ id: "T-02", depende_de: ["T-99"] })]),
    );

    expect(t.dependencias_quebradas).toEqual(["T-99"]);
    expect(t.arestas.find((a) => a.de === "T-99")?.quebrada).toBe(true);
    expect(t.nos).toHaveLength(2);
  });

  it("acusa paralelismo falso: paralelizavel com dependência não concluída", () => {
    const t = montarTopologia(
      trabalho([
        task({ id: "T-01", status: "pendente" }),
        task({ id: "T-02", depende_de: ["T-01"], paralelizavel: true }),
      ]),
    );

    expect(t.nos.find((n) => n.id === "T-02")?.paralela_suspeita).toBe(true);
  });

  it("não acusa paralelismo falso quando a dependência já está concluída", () => {
    const t = montarTopologia(
      trabalho([
        task({ id: "T-01", status: "concluida" }),
        task({ id: "T-02", depende_de: ["T-01"], paralelizavel: true }),
      ]),
    );

    expect(t.nos.find((n) => n.id === "T-02")?.paralela_suspeita).toBe(false);
  });

  it("aproxima o dependente da coluna de quem ele espera", () => {
    // T-0A e T-0B abrem duas colunas no nível 0. No nível 1, quem depende de
    // T-0B (a segunda coluna) não pode ser posicionado antes de quem depende de
    // T-0A, senão a aresta atravessa o desenho.
    const t = montarTopologia(
      trabalho([
        task({ id: "T-0A" }),
        task({ id: "T-0B" }),
        // ids escolhidos para que a ordem alfabética contrarie a posicional
        task({ id: "T-1A", depende_de: ["T-0B"] }),
        task({ id: "T-1B", depende_de: ["T-0A"] }),
      ]),
    );

    expect(t.niveis[0]?.map((n) => n.id)).toEqual(["T-0A", "T-0B"]);
    expect(t.niveis[1]?.map((n) => n.id)).toEqual(["T-1B", "T-1A"]);
  });

  it("devolve topologia vazia para trabalho sem task, sem quebrar", () => {
    const t = montarTopologia(trabalho([]));

    expect(t.nos).toEqual([]);
    expect(t.niveis).toEqual([]);
    expect(t.caminho_critico).toEqual([]);
  });

  it("produz a mesma saída em duas execuções seguidas (estável para diff)", () => {
    const entrada = () =>
      trabalho([
        task({ id: "T-03", depende_de: ["T-01"] }),
        task({ id: "T-02", depende_de: ["T-01"] }),
        task({ id: "T-01" }),
      ]);

    expect(JSON.stringify(montarTopologia(entrada()))).toBe(
      JSON.stringify(montarTopologia(entrada())),
    );
  });
});
