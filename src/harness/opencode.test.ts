import { describe, it, expect, afterEach } from "vitest";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { criarRepoSkill } from "../teste/repo-fixture.js";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { detectarLayout } from "../nucleo/layout.js";
import { materializarOpenCode } from "./opencode.js";
import type { SkillMontavel } from "../plugin/montagem.js";

let p: ProjetoTemporario | undefined;
const repos: string[] = [];
afterEach(() => {
  p?.descartar();
  p = undefined;
  for (const r of repos.splice(0)) rmSync(r, { recursive: true, force: true });
});

function montavel(nome: string): SkillMontavel {
  const repo = criarRepoSkill({ nome, tags: [] });
  repos.push(repo);
  const l = detectarLayout(repo, nome);
  if (!l.ok) throw new Error(l.erro);
  return { nome, raizSkill: l.raizSkill, comandos: l.comandos };
}

describe("materialização para o OpenCode", () => {
  it("integração: skills em .claude/skills e comandos em .opencode/commands", () => {
    p = projetoTemporario();
    materializarOpenCode(p.raiz, [montavel("sprintx"), montavel("runx")]);

    expect(existsSync(join(p.raiz, ".claude/skills/sprintx/SKILL.md"))).toBe(true);
    expect(existsSync(join(p.raiz, ".claude/skills/runx/SKILL.md"))).toBe(true);
    expect(existsSync(join(p.raiz, ".opencode/commands/sprintx.md"))).toBe(true);
    expect(existsSync(join(p.raiz, ".opencode/commands/runx.md"))).toBe(true);
  });

  it("funcional: o comando no OpenCode não leva prefixo de plugin", () => {
    p = projetoTemporario();
    materializarOpenCode(p.raiz, [montavel("sprintx")]);
    const conteudo = readFileSync(join(p.raiz, ".opencode/commands/sprintx.md"), "utf8");
    expect(conteudo).not.toContain("expx:");
    expect(existsSync(join(p.raiz, ".opencode/commands/expx-sprintx.md"))).toBe(false);
  });

  it("funcional: as skills NÃO são copiadas para .opencode/skills, para não colidir", () => {
    p = projetoTemporario();
    materializarOpenCode(p.raiz, [montavel("sprintx")]);
    expect(existsSync(join(p.raiz, ".opencode/skills"))).toBe(false);
  });
});
