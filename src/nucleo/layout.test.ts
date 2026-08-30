import { describe, it, expect, afterEach } from "vitest";
import { existsSync, rmSync, mkdirSync, writeFileSync } from "node:fs";
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

describe("detecção de hooks", () => {
  it("integração: devolve os hooks da skill quando o repositório os traz", () => {
    const raiz = criarRepoSkill({
      nome: "memox",
      tags: [],
      hooks: ["memox-injetar.sh", "memox-reindexar.sh"],
      assets: { "memox.py": "print('memox')\n" },
    });
    criados.push(raiz);
    const l = detectarLayout(raiz, "memox");
    expect(l.ok).toBe(true);
    if (l.ok) expect(l.hooks).toHaveLength(2);
  });

  it("funcional: só os hooks com o prefixo da skill entram; sem hooks, lista vazia", () => {
    const comHooks = criarRepoSkill({
      nome: "memox",
      tags: [],
      // o `.sh` de outra skill não pode ser arrastado junto
      hooks: ["memox-injetar.sh", "outra-coisa.sh"],
    });
    criados.push(comHooks);
    const l = detectarLayout(comHooks, "memox");
    expect(l.ok).toBe(true);
    if (l.ok) {
      expect(l.hooks).toHaveLength(1);
      expect(l.hooks[0]).toContain("memox-injetar.sh");
    }

    const semHooks = criarRepoSkill({ nome: "sprintx", tags: [] });
    criados.push(semHooks);
    const s = detectarLayout(semHooks, "sprintx");
    expect(s.ok).toBe(true);
    if (s.ok) expect(s.hooks).toEqual([]);
  });

  it("funcional: PASTA de hook não é confundida com hook", () => {
    // a sprintx real tem `.claude/hooks/sprintx/` como DIRETÓRIO. Tratá-lo como
    // arquivo faz o `cp` do init falhar com EISDIR e derruba a instalação
    // inteira. A pasta já viaja junto na cópia da própria skill.
    const repo = criarRepoSkill({ nome: "sprintx", tags: [], hooks: ["sprintx-um.sh"] });
    criados.push(repo);
    mkdirSync(join(repo, ".claude/hooks/sprintx"), { recursive: true });
    writeFileSync(join(repo, ".claude/hooks/sprintx/interno.sh"), "#!/usr/bin/env bash\n");

    const l = detectarLayout(repo, "sprintx");
    expect(l.ok).toBe(true);
    if (l.ok) {
      expect(l.hooks).toHaveLength(1);
      expect(l.hooks[0]).toContain("sprintx-um.sh");
    }
  });
});
