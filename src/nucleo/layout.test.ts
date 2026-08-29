import { describe, it, expect, afterEach } from "vitest";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { criarRepoSkill } from "../teste/repo-fixture.js";
import { detectarLayout } from "./layout.js";

const criados: string[] = [];
afterEach(() => {
  for (const c of criados.splice(0)) rmSync(c, { recursive: true, force: true });
});

describe("detecção de layout do repositório de skill", () => {
  it("integração: os dois layouts produzem o mesmo formato de saída", () => {
    const embutido = criarRepoSkill({ nome: "sprintx", tags: [], layout: "embutido" });
    const plano = criarRepoSkill({ nome: "runx", tags: [], layout: "plano" });
    criados.push(embutido, plano);

    const a = detectarLayout(embutido, "sprintx");
    const b = detectarLayout(plano, "runx");

    for (const r of [a, b]) {
      expect(r.ok).toBe(true);
      if (!r.ok) return;
      expect(existsSync(join(r.raizSkill, "SKILL.md"))).toBe(true);
      expect(r.comandos.length).toBeGreaterThan(0);
      expect(r.nome).not.toBe("");
    }
  });

  it("funcional: o layout plano devolve skill em skill/ e comandos em commands/", () => {
    const plano = criarRepoSkill({ nome: "runx", tags: [], layout: "plano" });
    criados.push(plano);
    const r = detectarLayout(plano, "runx");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.raizSkill).toBe(join(plano, "skill"));
    expect(r.comandos[0]).toContain(join("commands", "runx.md"));
    expect(r.nome).toBe("runx");
  });

  it("funcional: o layout embutido devolve skill em .claude/skills/<nome>/", () => {
    const emb = criarRepoSkill({ nome: "sprintx", tags: [], layout: "embutido" });
    criados.push(emb);
    const r = detectarLayout(emb, "sprintx");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.raizSkill).toBe(join(emb, ".claude", "skills", "sprintx"));
  });

  it("funcional: repositório sem SKILL.md devolve falha", () => {
    const vazio = criarRepoSkill({ nome: "x", tags: [] });
    criados.push(vazio);
    rmSync(join(vazio, ".claude/skills/x/SKILL.md"));
    const r = detectarLayout(vazio, "x");
    expect(r.ok).toBe(false);
  });
});
