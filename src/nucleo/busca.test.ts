import { describe, it, expect, afterEach } from "vitest";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { criarRepoSkill } from "../teste/repo-fixture.js";
import { buscarSkill } from "./busca.js";

const criados: string[] = [];
afterEach(() => {
  for (const c of criados.splice(0)) rmSync(c, { recursive: true, force: true });
});

describe("busca da skill por clone raso", () => {
  it("integração: clona na tag alvo e o SKILL.md existe no destino", async () => {
    const repo = criarRepoSkill({ nome: "sprintx", tags: ["v1.0.0", "v1.2.0"] });
    criados.push(repo);
    const r = await buscarSkill({ nome: "sprintx", repositorio: repo, referencia: "v1.2.0" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    criados.push(r.caminho);
    expect(existsSync(join(r.caminho, ".claude/skills/sprintx/SKILL.md"))).toBe(true);
    expect(r.commit).toMatch(/^[0-9a-f]{40}$/);
  });

  it("funcional: a tag pedida traz o conteúdo daquela tag, não o da mais recente", async () => {
    const repo = criarRepoSkill({ nome: "sprintx", tags: ["v1.0.0", "v1.2.0"] });
    criados.push(repo);
    const r = await buscarSkill({ nome: "sprintx", repositorio: repo, referencia: "v1.0.0" });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    criados.push(r.caminho);
    const ref = readFileSync(join(r.caminho, ".claude/skills/sprintx/references/01.md"), "utf8");
    expect(ref).toContain("v1.0.0");
    expect(ref).not.toContain("v1.2.0");
  });

  it("funcional: repositório inexistente devolve falha nomeando a skill, sem lançar", async () => {
    const r = await buscarSkill({
      nome: "fantasma",
      repositorio: "/caminho/inexistente/x.git",
      referencia: "main",
    });
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.nome).toBe("fantasma");
    expect(r.erro).not.toBe("");
  });
});
