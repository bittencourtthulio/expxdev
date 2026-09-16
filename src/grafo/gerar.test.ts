import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, isAbsolute } from "node:path";
import { gerarGrafos, NOME_ARQUIVO } from "./gerar.js";

let raiz: string;

beforeEach(() => {
  raiz = mkdtempSync(join(tmpdir(), "expx-grafo-"));
});

afterEach(() => {
  rmSync(raiz, { recursive: true, force: true });
});

/** Escreve um trabalho mínimo válido: orquestrador mais um plano condensado. */
function trabalho(id: string, tasks: string): void {
  escreverEm(join("docs", id), id, tasks);
}

/** O mesmo trabalho, num caminho arbitrário relativo à raiz. */
function escreverEm(caminhoRelativo: string, id: string, tasks: string): void {
  const pasta = join(raiz, caminhoRelativo);
  mkdirSync(join(pasta, "sprint-01"), { recursive: true });

  writeFileSync(
    join(pasta, "ORQUESTRADOR.md"),
    `---
expx_schema: 1
expx_tool: sprintx
kind: orquestrador
trabalho_id: ${id}
titulo: Trabalho ${id}
tipo_trabalho: feature
tipo_ocorrencia: null
estagio: f6
status: em_andamento
criado_em: 2026-09-01
atualizado_em: 2026-09-01
concluido_em: null
sprints: [sprint-01]
caminho_critico: []
---

prosa
`,
    "utf8",
  );

  writeFileSync(join(pasta, "sprint-01", "tasks.md"), tasks, "utf8");
}

const TASKS_OK = `---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: alfa
sprint_id: sprint-01
atualizado_em: 2026-09-01
tasks:
  - id: T-01
    titulo: Primeira
    fase: F-01.1
    status: concluida
    objetivo: o
    arquivos: { cria: [], altera: [] }
    teste_integracao: t
    teste_funcional: t
    criterio_aceite: c
    depende_de: []
    paralelizavel: false
    concluida_em: 2026-09-01
    suite: verde
  - id: T-02
    titulo: Segunda
    fase: F-01.1
    status: pendente
    objetivo: o
    arquivos: { cria: [], altera: [] }
    teste_integracao: t
    teste_funcional: t
    criterio_aceite: c
    depende_de: [T-01]
    paralelizavel: false
    concluida_em: null
    suite: verde
---

prosa
`;

describe("gerarGrafos", () => {
  it("grava o GRAFO.svg ao lado do ORQUESTRADOR do trabalho", () => {
    trabalho("alfa", TASKS_OK);

    const r = gerarGrafos({ raiz });

    expect(r.gerados).toHaveLength(1);
    expect(existsSync(join(raiz, "docs", "alfa", NOME_ARQUIVO))).toBe(true);
    expect(readFileSync(join(raiz, "docs", "alfa", NOME_ARQUIVO), "utf8")).toContain("<svg");
  });

  it("reporta caminho relativo, nunca absoluto (regra R10)", () => {
    trabalho("alfa", TASKS_OK);

    const r = gerarGrafos({ raiz });

    expect(isAbsolute(r.gerados[0]!.arquivo)).toBe(false);
    expect(r.gerados[0]!.arquivo).toBe(join("docs", "alfa", NOME_ARQUIVO));
    expect(r.gerados[0]!.arquivo).not.toContain(raiz);
  });

  it("com --simular calcula o resumo sem escrever no disco", () => {
    trabalho("alfa", TASKS_OK);

    const r = gerarGrafos({ raiz, simular: true });

    expect(r.gerados).toHaveLength(1);
    expect(r.gerados[0]!.tasks).toBe(2);
    expect(existsSync(join(raiz, "docs", "alfa", NOME_ARQUIVO))).toBe(false);
  });

  it("filtra por trabalho quando o id é informado", () => {
    trabalho("alfa", TASKS_OK);
    trabalho("beta", TASKS_OK.replace("trabalho_id: alfa", "trabalho_id: beta"));

    const r = gerarGrafos({ raiz, trabalho: "alfa" });

    expect(r.gerados.map((g) => g.trabalho_id)).toEqual(["alfa"]);
    expect(existsSync(join(raiz, "docs", "beta", NOME_ARQUIVO))).toBe(false);
  });

  it("ignora trabalho sem task nenhuma, dizendo o motivo", () => {
    trabalho(
      "vazio",
      `---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: vazio
sprint_id: sprint-01
atualizado_em: 2026-09-01
tasks: []
---
`,
    );

    const r = gerarGrafos({ raiz });

    expect(r.gerados).toHaveLength(0);
    expect(r.ignorados[0]).toMatchObject({ trabalho_id: "vazio" });
    expect(r.ignorados[0]!.motivo).toContain("nenhuma task");
  });

  it("resume o que o revisor precisa saber: tasks, níveis e caminho crítico", () => {
    trabalho("alfa", TASKS_OK);

    const r = gerarGrafos({ raiz, simular: true });

    expect(r.gerados[0]).toMatchObject({
      tasks: 2,
      niveis: 2,
      caminho_critico: 2,
      em_ciclo: 0,
      dependencias_quebradas: [],
    });
  });

  it("não varre material de teste: fixtures fica de fora sem filtro", () => {
    escreverEm(join("fixtures", "projeto-x", "docs", "alfa"), "alfa", TASKS_OK);

    const r = gerarGrafos({ raiz });

    expect(r.gerados).toEqual([]);
  });

  it("mas gera o grafo de uma fixture quando ela é pedida pelo id", () => {
    escreverEm(join("fixtures", "projeto-x", "docs", "alfa"), "alfa", TASKS_OK);

    const r = gerarGrafos({ raiz, trabalho: "alfa", simular: true });

    expect(r.gerados.map((g) => g.trabalho_id)).toEqual(["alfa"]);
  });

  it("não derruba a geração quando o projeto não tem trabalho nenhum", () => {
    const r = gerarGrafos({ raiz });

    expect(r.gerados).toEqual([]);
    expect(r.ignorados).toEqual([]);
  });
});
