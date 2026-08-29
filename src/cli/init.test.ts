import { describe, it, expect, afterEach } from "vitest";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { criarRepoSkill } from "../teste/repo-fixture.js";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { executarInit } from "./init.js";
import { lerLock } from "../nucleo/lock.js";

let p: ProjetoTemporario | undefined;
const repos: string[] = [];
afterEach(() => {
  p?.descartar();
  p = undefined;
  for (const r of repos.splice(0)) rmSync(r, { recursive: true, force: true });
});

/** Catálogo de teste: repositórios locais no lugar dos do GitHub. */
function catalogoLocal(nomes: readonly string[]): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const n of nomes) {
    const repo = criarRepoSkill({ nome: n, tags: ["v1.0.0"], layout: n === "runx" ? "plano" : "embutido" });
    repos.push(repo);
    saida[n] = repo;
  }
  return saida;
}

describe("init de ponta a ponta", () => {
  it("integração: cria a árvore .expx com lock, marketplace e plugin", async () => {
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    const r = await executarInit({
      raiz: p.raiz,
      skills: ["sprintx", "runx"],
      harness: ["claude"],
      origens: catalogoLocal(["sprintx", "runx"]),
    });

    expect(r.ok).toBe(true);
    expect(existsSync(join(p.raiz, ".expx/expx-lock.json"))).toBe(true);
    expect(existsSync(join(p.raiz, ".expx/marketplace/.claude-plugin/marketplace.json"))).toBe(true);
    expect(existsSync(join(p.raiz, ".expx/marketplace/plugins/expx/.claude-plugin/plugin.json"))).toBe(true);
  });

  it("funcional: dado sprintx e runx, o lock lista as duas e o plugin tem as duas skills", async () => {
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    await executarInit({
      raiz: p.raiz,
      skills: ["sprintx", "runx"],
      harness: ["claude"],
      origens: catalogoLocal(["sprintx", "runx"]),
    });

    const l = lerLock(p.raiz);
    expect(l.ok).toBe(true);
    if (!l.ok) return;
    expect(Object.keys(l.lock.skills).sort()).toEqual(["runx", "sprintx"]);

    const base = join(p.raiz, ".expx/marketplace/plugins/expx");
    expect(existsSync(join(base, "skills/sprintx/SKILL.md"))).toBe(true);
    expect(existsSync(join(base, "skills/runx/SKILL.md"))).toBe(true);
    expect(existsSync(join(base, "commands/sprintx.md"))).toBe(true);
  });

  it("funcional: o lock registra hash por arquivo de cada skill instalada", async () => {
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    await executarInit({
      raiz: p.raiz,
      skills: ["sprintx"],
      harness: ["claude"],
      origens: catalogoLocal(["sprintx"]),
    });
    const l = lerLock(p.raiz);
    expect(l.ok).toBe(true);
    if (!l.ok) return;
    const arquivos = l.lock.skills["sprintx"]?.arquivos ?? {};
    expect(Object.keys(arquivos).length).toBeGreaterThan(0);
    expect(arquivos["SKILL.md"]).toMatch(/^[0-9a-f]{64}$/);
  });

  it("funcional: skill inacessível não aborta as demais e é reportada", async () => {
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    const origens = catalogoLocal(["sprintx"]);
    origens["fantasma"] = "/caminho/que/nao/existe.git";

    const r = await executarInit({
      raiz: p.raiz,
      skills: ["sprintx", "fantasma"],
      harness: ["claude"],
      origens,
    });

    expect(r.ok).toBe(true);
    expect(r.falhas.map((f) => f.nome)).toEqual(["fantasma"]);
    const l = lerLock(p.raiz);
    expect(l.ok).toBe(true);
    if (!l.ok) return;
    expect(Object.keys(l.lock.skills)).toEqual(["sprintx"]);
  });

  it("funcional: com opencode escolhido, as skills vão para .claude/skills e os comandos para .opencode/commands", async () => {
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    await executarInit({
      raiz: p.raiz,
      skills: ["sprintx"],
      harness: ["claude", "opencode"],
      origens: catalogoLocal(["sprintx"]),
    });
    expect(existsSync(join(p.raiz, ".claude/skills/sprintx/SKILL.md"))).toBe(true);
    expect(existsSync(join(p.raiz, ".opencode/commands/sprintx.md"))).toBe(true);
    expect(existsSync(join(p.raiz, ".opencode/skills"))).toBe(false);
  });
});
