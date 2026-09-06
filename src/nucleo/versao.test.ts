import { describe, it, expect, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { criarRepoSkill } from "../teste/repo-fixture.js";
import { commitRemotoDaBranch, maiorTagSemver, resolverAlvo } from "./versao.js";

const criados: string[] = [];
afterEach(() => {
  for (const c of criados.splice(0)) rmSync(c, { recursive: true, force: true });
});

describe("resolução de versão alvo", () => {
  it("integração: resolve contra um repositório com tags e contra um sem tag", async () => {
    const comTag = criarRepoSkill({ nome: "sprintx", tags: ["v1.0.0", "v1.2.0"] });
    const semTag = criarRepoSkill({ nome: "stackx", tags: [] });
    criados.push(comTag, semTag);

    const a = await resolverAlvo(comTag);
    expect(a.travado).toBe(true);
    expect(a.referencia).toBe("v1.2.0");

    const b = await resolverAlvo(semTag);
    expect(b.travado).toBe(false);
    expect(b.referencia).toBe("main");
  });

  it("funcional: dadas v1.0.0, v1.2.0 e v1.10.0, escolhe v1.10.0 e não v1.2.0", () => {
    expect(maiorTagSemver(["v1.0.0", "v1.2.0", "v1.10.0"])).toBe("v1.10.0");
    expect(maiorTagSemver(["v2.0.0-rc.1", "v1.9.9"])).toBe("v1.9.9");
    expect(maiorTagSemver(["nao-semver", "v0.1.0"])).toBe("v0.1.0");
    expect(maiorTagSemver([])).toBeUndefined();
  });

  it("funcional: repositório inacessível devolve falha sem lançar", async () => {
    const r = await resolverAlvo("/caminho/que/nao/existe/repo.git");
    expect(r.ok).toBe(false);
  });

  it("integração: sem tag, a resolução também traz o commit do HEAD remoto da branch", async () => {
    const semTag = criarRepoSkill({ nome: "stackx", tags: [] });
    criados.push(semTag);

    const commitEsperado = execFileSync("git", ["rev-parse", "HEAD"], { cwd: semTag }).toString().trim();
    const a = await resolverAlvo(semTag);
    expect(a.travado).toBe(false);
    expect(a.referencia).toBe("main");
    expect(a.commit).toBe(commitEsperado);

    // Um commit novo na main muda o SHA resolvido, mesmo com o nome "main" intacto —
    // é essa diferença que permite ao `update` notar novidade sem depender de tag.
    writeFileSync(join(semTag, "novidade.md"), "# novidade\n");
    execFileSync("git", ["add", "-A"], { cwd: semTag });
    execFileSync("git", ["commit", "-q", "-m", "novidade sem tag"], {
      cwd: semTag,
      env: { ...process.env, GIT_AUTHOR_NAME: "e", GIT_AUTHOR_EMAIL: "e@e.invalid", GIT_COMMITTER_NAME: "e", GIT_COMMITTER_EMAIL: "e@e.invalid" },
    });
    const b = await resolverAlvo(semTag);
    expect(b.commit).not.toBe(commitEsperado);
  });

  it("funcional: commitRemotoDaBranch devolve undefined para branch inexistente", async () => {
    const repo = criarRepoSkill({ nome: "sprintx", tags: [] });
    criados.push(repo);
    const r = await commitRemotoDaBranch(repo, "branch-que-nao-existe");
    expect(r).toBeUndefined();
  });
});
