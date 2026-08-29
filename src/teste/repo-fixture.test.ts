import { describe, it, expect, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { criarRepoSkill } from "./repo-fixture.js";

const criados: string[] = [];
afterEach(() => {
  for (const c of criados.splice(0)) rmSync(c, { recursive: true, force: true });
});

function tags(repo: string): string[] {
  const saida = execFileSync("git", ["ls-remote", "--tags", repo], { encoding: "utf8" });
  return saida
    .split("\n")
    .filter((l) => l.includes("refs/tags/"))
    .map((l) => l.split("refs/tags/")[1] ?? "")
    .filter((t) => t !== "" && !t.endsWith("^{}"));
}

describe("repositório git de fixture", () => {
  it("integração: cria um repositório com duas tags e git as lista", () => {
    const repo = criarRepoSkill({ nome: "sprintx", tags: ["v1.0.0", "v1.1.0"] });
    criados.push(repo);
    expect(existsSync(repo)).toBe(true);
    expect(tags(repo).sort()).toEqual(["v1.0.0", "v1.1.0"]);
  });

  it("funcional: dado tags v1.0.0 e v1.1.0, ls-remote devolve as duas referências", () => {
    const repo = criarRepoSkill({ nome: "runx", tags: ["v1.0.0", "v1.1.0"] });
    criados.push(repo);
    const t = tags(repo);
    expect(t).toContain("v1.0.0");
    expect(t).toContain("v1.1.0");
    expect(t).toHaveLength(2);
  });

  it("funcional: repositório sem tag nenhuma tem lista de tags vazia", () => {
    const repo = criarRepoSkill({ nome: "stackx", tags: [] });
    criados.push(repo);
    expect(tags(repo)).toHaveLength(0);
  });
});
