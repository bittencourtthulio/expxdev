import { describe, it, expect, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import { existsSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";
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

describe("repositório de fixture com hooks e assets", () => {
  /**
   * O memox é a primeira skill do catálogo que traz hooks. Sem o gerador saber
   * criá-los, as fixtures dos testes de instalação não teriam o que exercitar.
   */
  it("integração: cria os hooks e os assets pedidos", () => {
    const raiz = criarRepoSkill({
      nome: "memox",
      tags: [],
      hooks: ["memox-injetar.sh", "memox-reindexar.sh"],
      assets: { "memox.py": "print('memox')\n" },
    });
    expect(existsSync(join(raiz, ".claude/hooks/memox-injetar.sh"))).toBe(true);
    expect(existsSync(join(raiz, ".claude/hooks/memox-reindexar.sh"))).toBe(true);
    expect(existsSync(join(raiz, ".claude/skills/memox/assets/memox.py"))).toBe(true);
    rmSync(raiz, { recursive: true, force: true });
  });

  it("funcional: o hook nasce executável e sem hooks nada é criado", () => {
    const comHooks = criarRepoSkill({ nome: "memox", tags: [], hooks: ["memox-injetar.sh"] });
    const modo = statSync(join(comHooks, ".claude/hooks/memox-injetar.sh")).mode;
    // bit de execução do dono: o README do memox manda `chmod +x`
    expect(modo & 0o100).toBe(0o100);
    rmSync(comHooks, { recursive: true, force: true });

    const semHooks = criarRepoSkill({ nome: "sprintx", tags: [] });
    expect(existsSync(join(semHooks, ".claude/hooks"))).toBe(false);
    rmSync(semHooks, { recursive: true, force: true });
  });
});
