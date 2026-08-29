import { describe, it, expect, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { criarTrioDeLayouts } from "./layouts-fixture.js";

let criados: string[] = [];
afterEach(() => {
  for (const c of criados.splice(0)) rmSync(c, { recursive: true, force: true });
});

function contaTags(repo: string): number {
  const saida = execFileSync("git", ["ls-remote", "--tags", repo], { encoding: "utf8" });
  return saida.split("\n").filter((l) => l.includes("refs/tags/") && !l.includes("^{}")).length;
}

describe("fixtures dos dois layouts", () => {
  it("integração: cada repositório tem o SKILL.md no caminho esperado do seu layout", () => {
    const trio = criarTrioDeLayouts();
    criados = [trio.embutido, trio.plano, trio.semTag];
    expect(existsSync(join(trio.embutido, ".claude/skills/sprintx/SKILL.md"))).toBe(true);
    expect(existsSync(join(trio.plano, "skill/SKILL.md"))).toBe(true);
    expect(existsSync(join(trio.semTag, ".claude/skills/stackx/SKILL.md"))).toBe(true);
  });

  it("funcional: o layout embutido põe o SKILL.md sob .claude/skills e o plano sob skill/", () => {
    const trio = criarTrioDeLayouts();
    criados = [trio.embutido, trio.plano, trio.semTag];
    expect(existsSync(join(trio.embutido, "skill/SKILL.md"))).toBe(false);
    expect(existsSync(join(trio.plano, ".claude/skills"))).toBe(false);
    expect(existsSync(join(trio.plano, "commands/runx.md"))).toBe(true);
  });

  it("funcional: o repositório sem tag tem zero tags e os outros dois têm tags", () => {
    const trio = criarTrioDeLayouts();
    criados = [trio.embutido, trio.plano, trio.semTag];
    expect(contaTags(trio.semTag)).toBe(0);
    expect(contaTags(trio.embutido)).toBeGreaterThan(0);
    expect(contaTags(trio.plano)).toBeGreaterThan(0);
  });
});
