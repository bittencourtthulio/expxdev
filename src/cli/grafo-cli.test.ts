import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { executarExpx } from "./expx.js";
import { interpretarSubcomando } from "./subcomandos.js";

let raiz: string;
let anterior: string;

beforeEach(() => {
  raiz = mkdtempSync(join(tmpdir(), "expx-grafo-cli-"));
  anterior = process.cwd();
  process.chdir(raiz);
});

afterEach(() => {
  process.chdir(anterior);
  rmSync(raiz, { recursive: true, force: true });
});

function orquestrador(id: string): string {
  return `---
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
`;
}

function task(id: string, depende: string[], status = "pendente"): string {
  return `  - id: ${id}
    titulo: Task ${id}
    fase: F-01.1
    status: ${status}
    objetivo: o
    arquivos: { cria: [], altera: [] }
    teste_integracao: t
    teste_funcional: t
    criterio_aceite: c
    depende_de: [${depende.join(", ")}]
    paralelizavel: false
    concluida_em: null
    suite: verde
`;
}

function escreverTrabalho(id: string, tasks: string): void {
  const pasta = join(raiz, "docs", id);
  mkdirSync(join(pasta, "sprint-01"), { recursive: true });
  writeFileSync(join(pasta, "ORQUESTRADOR.md"), orquestrador(id), "utf8");
  writeFileSync(
    join(pasta, "sprint-01", "tasks.md"),
    `---
expx_schema: 1
expx_tool: sprintx
kind: tasks
trabalho_id: ${id}
sprint_id: sprint-01
atualizado_em: 2026-09-01
tasks:
${tasks}---

prosa
`,
    "utf8",
  );
}

function capturar(): { saida: string[]; erro: string[] } {
  const saida: string[] = [];
  const erro: string[] = [];
  return { saida, erro };
}

describe("expx grafo", () => {
  it("é reconhecido como subcomando", () => {
    const r = interpretarSubcomando(["grafo"]);

    expect(r.ok).toBe(true);
    expect(r).toMatchObject({ subcomando: "grafo" });
  });

  it("grava o SVG e relata o que gerou", async () => {
    escreverTrabalho("alfa", task("T-01", []) + task("T-02", ["T-01"]));
    const c = capturar();

    const codigo = await executarExpx(["grafo"], {
      escrever: (t) => c.saida.push(t),
      escreverErro: (t) => c.erro.push(t),
    });

    expect(codigo).toBe(0);
    expect(existsSync(join(raiz, "docs", "alfa", "GRAFO.svg"))).toBe(true);
    expect(c.saida.join("")).toContain("gravado");
    expect(c.saida.join("")).toContain("2 tasks");
  });

  it("com --conferir não escreve nada no projeto", async () => {
    escreverTrabalho("alfa", task("T-01", []));
    const c = capturar();

    const codigo = await executarExpx(["grafo", "--conferir"], {
      escrever: (t) => c.saida.push(t),
      escreverErro: (t) => c.erro.push(t),
    });

    expect(codigo).toBe(0);
    expect(existsSync(join(raiz, "docs", "alfa", "GRAFO.svg"))).toBe(false);
    expect(c.saida.join("")).toContain("conferido");
  });

  it("com --conferir reprova quando o plano tem ciclo", async () => {
    escreverTrabalho(
      "alfa",
      task("T-01", ["T-03"]) + task("T-02", ["T-01"]) + task("T-03", ["T-02"]),
    );
    const c = capturar();

    const codigo = await executarExpx(["grafo", "--conferir"], {
      escrever: (t) => c.saida.push(t),
      escreverErro: (t) => c.erro.push(t),
    });

    expect(codigo).toBe(1);
    expect(c.saida.join("")).toContain("em ciclo");
  });

  it("com --conferir reprova quando há dependência inexistente", async () => {
    escreverTrabalho("alfa", task("T-01", []) + task("T-02", ["T-99"]));
    const c = capturar();

    const codigo = await executarExpx(["grafo", "--conferir"], {
      escrever: (t) => c.saida.push(t),
      escreverErro: (t) => c.erro.push(t),
    });

    expect(codigo).toBe(1);
    expect(c.saida.join("")).toContain("T-99");
  });

  it("gravando um plano defeituoso, aponta o defeito mas não falha", async () => {
    escreverTrabalho("alfa", task("T-01", []) + task("T-02", ["T-99"]));
    const c = capturar();

    const codigo = await executarExpx(["grafo"], {
      escrever: (t) => c.saida.push(t),
      escreverErro: (t) => c.erro.push(t),
    });

    expect(codigo).toBe(0);
    expect(c.saida.join("")).toContain("T-99");
    expect(existsSync(join(raiz, "docs", "alfa", "GRAFO.svg"))).toBe(true);
  });

  it("aceita o id do trabalho como filtro posicional", async () => {
    escreverTrabalho("alfa", task("T-01", []));
    escreverTrabalho("beta", task("T-01", []));
    const c = capturar();

    await executarExpx(["grafo", "alfa"], {
      escrever: (t) => c.saida.push(t),
      escreverErro: (t) => c.erro.push(t),
    });

    expect(existsSync(join(raiz, "docs", "alfa", "GRAFO.svg"))).toBe(true);
    expect(existsSync(join(raiz, "docs", "beta", "GRAFO.svg"))).toBe(false);
  });

  it("avisa quando não há trabalho nenhum, sem falhar", async () => {
    const c = capturar();

    const codigo = await executarExpx(["grafo"], {
      escrever: (t) => c.saida.push(t),
      escreverErro: (t) => c.erro.push(t),
    });

    expect(codigo).toBe(0);
    expect(c.saida.join("")).toContain("nenhum trabalho encontrado");
  });
});
