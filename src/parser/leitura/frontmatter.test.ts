import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { lerFrontmatter } from "./frontmatter.js";

const TASKS = "fixtures/projeto-ok/docs/exportacao-csv/sprint-01/tasks.md";

describe("leitura de frontmatter com posicao", () => {
  it("integração: lê um tasks.md devolvendo dados e mapa de linhas", () => {
    const r = lerFrontmatter(readFileSync(TASKS, "utf8"));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect((r.dados as { kind: string }).kind).toBe("tasks");
    expect(r.linhas.size).toBeGreaterThan(0);
    // a linha de uma chave de topo é conhecida
    expect(r.linhas.get("kind")).toBeGreaterThan(0);
  });

  it("funcional: o mapa aponta a linha em que a segunda task começa", () => {
    const conteudo = readFileSync(TASKS, "utf8");
    const r = lerFrontmatter(conteudo);
    expect(r.ok).toBe(true);
    if (!r.ok) return;

    const linhaT2 = r.linhas.get("tasks.1");
    expect(linhaT2).toBeDefined();

    // a linha apontada contém de fato o id da segunda task
    const linhas = conteudo.split("\n");
    const trecho = linhas.slice((linhaT2 as number) - 1, (linhaT2 as number) + 1).join("\n");
    expect(trecho).toContain("T-01.02");
  });

  it("funcional: YAML inválido devolve erro com linha, sem lançar", () => {
    const ruim = readFileSync("fixtures/projeto-ruim/docs/yaml-invalido/ORQUESTRADOR.md", "utf8");
    const r = lerFrontmatter(ruim);
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.motivo).toBeTruthy();
  });

  it("funcional: arquivo sem bloco de frontmatter é reportado como ausente", () => {
    const r = lerFrontmatter("# Só um título\n\nsem YAML aqui.\n");
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.tipo).toBe("sem_frontmatter");
  });
});
