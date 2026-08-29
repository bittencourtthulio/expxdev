import { describe, it, expect } from "vitest";
import matter from "gray-matter";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const OK = "fixtures/projeto-ok/docs";
const RUIM = "fixtures/projeto-ruim/docs";

function fm(caminho: string): Record<string, unknown> {
  return matter(readFileSync(caminho, "utf8")).data as Record<string, unknown>;
}

/** T-01.03 — trabalho sprintx completo. */
describe("fixture: trabalho sprintx", () => {
  const base = join(OK, "exportacao-csv");
  const esperado: Array<[string, string]> = [
    ["ORQUESTRADOR.md", "orquestrador"],
    ["00-BLOQUEIOS.md", "bloqueios"],
    ["00-DECISOES.md", "decisoes"],
    ["base/00-INDICE.md", "base_indice"],
    ["sprint-01/sprint.md", "sprint"],
    ["sprint-01/fases.md", "fases"],
    ["sprint-01/tasks.md", "tasks"],
  ];

  it("integração: os sete arquivos existem com frontmatter válido", () => {
    for (const [arq, kind] of esperado) {
      const caminho = join(base, arq);
      expect(existsSync(caminho), `falta ${caminho}`).toBe(true);
      expect(fm(caminho)["kind"], `kind errado em ${arq}`).toBe(kind);
    }
  });

  it("funcional: o ORQUESTRADOR é kind orquestrador e expx_tool sprintx", () => {
    const d = fm(join(base, "ORQUESTRADOR.md"));
    expect(d["kind"]).toBe("orquestrador");
    expect(d["expx_tool"]).toBe("sprintx");
  });
});

/** T-01.04 — trabalho runx completo. */
describe("fixture: trabalho runx", () => {
  const base = join(OK, "manutencao/OC-2026-0142-frete");
  const esperado: Array<[string, string]> = [
    ["ORQUESTRADOR.md", "orquestrador"],
    ["00-OCORRENCIA.md", "ocorrencia"],
    ["01-CAUSA-RAIZ.md", "causa_raiz"],
    ["QA.md", "qa"],
    ["BLOQUEIOS.md", "bloqueios"],
    ["sprint-01/tasks.md", "tasks"],
  ];

  it("integração: os seis arquivos existem com frontmatter válido", () => {
    for (const [arq, kind] of esperado) {
      const caminho = join(base, arq);
      expect(existsSync(caminho), `falta ${caminho}`).toBe(true);
      expect(fm(caminho)["kind"], `kind errado em ${arq}`).toBe(kind);
    }
  });

  it("funcional: a primeira task do bug traz teste_regressao preenchido", () => {
    const d = fm(join(base, "sprint-01/tasks.md"));
    const tasks = d["tasks"] as Array<Record<string, unknown>>;
    expect(tasks[0]?.["teste_regressao"]).toBeTruthy();
    expect(fm(join(base, "ORQUESTRADOR.md"))["tipo_trabalho"]).toBe("ocorrencia");
  });
});

/** T-01.05 — histórico de relatórios. */
describe("fixture: historico", () => {
  const base = join(OK, "relatorios");

  it("integração: índice e os dois relatórios existem com seus kinds", () => {
    expect(fm(join(base, "INDICE.md"))["kind"]).toBe("relatorios_indice");
    const pasta = join(base, "2026-08-29-OC-2026-0142-frete");
    expect(fm(join(pasta, "tecnico.md"))["kind"]).toBe("relatorio_tecnico");
    expect(fm(join(pasta, "uso.md"))["kind"]).toBe("relatorio_uso");
  });

  it("funcional: o relatorio de uso nao expoe codigo e o indice nao tem trabalho_id", () => {
    const uso = fm(join(base, "2026-08-29-OC-2026-0142-frete/uso.md"));
    expect(uso).not.toHaveProperty("arquivos_alterados");
    expect(uso).not.toHaveProperty("testes_adicionados");
    expect(fm(join(base, "INDICE.md"))).not.toHaveProperty("trabalho_id");
  });
});

/** T-01.06 — casos de leitura quebrada. */
describe("fixture: leitura quebrada", () => {
  const casos = ["yaml-invalido", "kind-desconhecido", "schema-futuro", "sem-frontmatter"];

  it("integração: os quatro casos existem e nenhum derruba a leitura", () => {
    for (const caso of casos) {
      const caminho = join(RUIM, caso, "ORQUESTRADOR.md");
      expect(existsSync(caminho), `falta ${caminho}`).toBe(true);
      // ler dentro de try: o parser da sprint-02 precisa fazer o mesmo
      expect(() => {
        try {
          matter(readFileSync(caminho, "utf8"));
        } catch {
          /* rejeição esperada, nunca propagada */
        }
      }).not.toThrow();
    }
  });

  it("funcional: o yaml invalido lanca e o erro e capturavel", () => {
    const caminho = join(RUIM, "yaml-invalido/ORQUESTRADOR.md");
    // gray-matter mantem cache global por string: sem limpar, a 2a leitura do
    // mesmo conteudo devolve dados vazios em vez de lancar. O parser da
    // sprint-02 tera de limpar o cache a cada releitura (ver B-01).
    matter.clearCache();
    expect(() => matter(readFileSync(caminho, "utf8"))).toThrow();
    matter.clearCache();
    expect(fm(join(RUIM, "schema-futuro/ORQUESTRADOR.md"))["expx_schema"]).toBe(2);
  });
});

/** T-01.07 — casos de conteúdo defeituoso. */
describe("fixture: conteudo defeituoso", () => {
  it("integração: os arquivos existem e todos tem YAML sintaticamente valido", () => {
    const arquivos = [
      "enum-errado/ORQUESTRADOR.md",
      "chave-ausente/sprint-01/tasks.md",
      "violacoes/ORQUESTRADOR.md",
      "violacoes/sprint-01/tasks.md",
      "pasta-sem-orquestrador/leiame.md",
    ];
    for (const arq of arquivos) {
      const caminho = join(RUIM, arq);
      expect(existsSync(caminho), `falta ${caminho}`).toBe(true);
      expect(() => matter(readFileSync(caminho, "utf8")), `YAML quebrado em ${arq}`).not.toThrow();
    }
  });

  it("funcional: a task paralelizavel da fixture tem depende_de nao vazio", () => {
    const d = fm(join(RUIM, "violacoes/sprint-01/tasks.md"));
    const tasks = d["tasks"] as Array<Record<string, unknown>>;
    const paralela = tasks.find((t) => t["paralelizavel"] === true);
    expect(paralela).toBeDefined();
    expect((paralela?.["depende_de"] as unknown[]).length).toBeGreaterThan(0);
  });
});
