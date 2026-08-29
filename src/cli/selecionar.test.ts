import { describe, it, expect, afterEach } from "vitest";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { criarRepoSkill } from "../teste/repo-fixture.js";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { executarInit } from "./init.js";
import { adicionarSkills, removerSkills } from "./selecionar.js";
import { lerLock } from "../nucleo/lock.js";

let p: ProjetoTemporario | undefined;
const repos: string[] = [];
afterEach(() => {
  p?.descartar();
  p = undefined;
  for (const r of repos.splice(0)) rmSync(r, { recursive: true, force: true });
});

function origens(nomes: readonly string[]): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const n of nomes) {
    const repo = criarRepoSkill({ nome: n, tags: ["v1.0.0"] });
    repos.push(repo);
    saida[n] = repo;
  }
  return saida;
}

async function projetoComSprintx(o: Record<string, string>): Promise<ProjetoTemporario> {
  const t = projetoTemporario("fixtures/cli/projeto-limpo");
  await executarInit({ raiz: t.raiz, skills: ["sprintx"], harness: ["claude"], origens: o });
  return t;
}

describe("add e remove", () => {
  it("integração: add acrescenta ao lock e ao plugin; remove tira dos dois", async () => {
    const o = origens(["sprintx", "mergex"]);
    p = await projetoComSprintx(o);
    const base = join(p.raiz, ".expx/marketplace/plugins/expx");

    await adicionarSkills({ raiz: p.raiz, skills: ["mergex"], origens: o });
    let l = lerLock(p.raiz);
    expect(l.ok && Object.keys(l.lock.skills).sort()).toEqual(["mergex", "sprintx"]);
    expect(existsSync(join(base, "skills/mergex/SKILL.md"))).toBe(true);

    await removerSkills({ raiz: p.raiz, skills: ["mergex"], origens: o });
    l = lerLock(p.raiz);
    expect(l.ok && Object.keys(l.lock.skills)).toEqual(["sprintx"]);
    expect(existsSync(join(base, "skills/mergex"))).toBe(false);
  });

  it("funcional: add de skill já instalada não duplica nem falha", async () => {
    const o = origens(["sprintx"]);
    p = await projetoComSprintx(o);
    const r = await adicionarSkills({ raiz: p.raiz, skills: ["sprintx"], origens: o });
    expect(r.ok).toBe(true);
    const l = lerLock(p.raiz);
    expect(l.ok && Object.keys(l.lock.skills)).toEqual(["sprintx"]);
  });

  it("funcional: remover a última skill é recusado, para não deixar instalação vazia", async () => {
    const o = origens(["sprintx"]);
    p = await projetoComSprintx(o);
    const r = await removerSkills({ raiz: p.raiz, skills: ["sprintx"], origens: o });
    expect(r.ok).toBe(false);
    expect(r.erro).toContain("ultima");
  });

  it("funcional: remover skill que não está instalada é recusado nomeando a skill", async () => {
    const o = origens(["sprintx"]);
    p = await projetoComSprintx(o);
    const r = await removerSkills({ raiz: p.raiz, skills: ["runx"], origens: o });
    expect(r.ok).toBe(false);
    expect(r.erro).toContain("runx");
  });
});
