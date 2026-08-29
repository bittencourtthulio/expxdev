import { describe, it, expect, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { criarRepoSkill } from "../teste/repo-fixture.js";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { executarInit } from "../cli/init.js";
import { interpretarFlagsUpdate, AVISO_ROLLBACK, executarUpdate } from "./flags.js";

let p: ProjetoTemporario | undefined;
const repos: string[] = [];
afterEach(() => {
  p?.descartar();
  p = undefined;
  for (const r of repos.splice(0)) rmSync(r, { recursive: true, force: true });
});

/** Publica uma versão nova na origem, para haver o que aplicar. */
function novaTag(repo: string, tag: string): void {
  writeFileSync(join(repo, ".claude/skills/sprintx/references/01.md"), `# conteudo de ${tag}\n`);
  const env = { ...process.env, GIT_AUTHOR_NAME: "e", GIT_AUTHOR_EMAIL: "e@e.invalid", GIT_COMMITTER_NAME: "e", GIT_COMMITTER_EMAIL: "e@e.invalid" };
  execFileSync("git", ["add", "-A"], { cwd: repo, env });
  execFileSync("git", ["commit", "-q", "-m", `publica ${tag}`], { cwd: repo, env });
  execFileSync("git", ["tag", tag], { cwd: repo });
}

describe("flags do update", () => {
  it("integração: as seis formas de invocação são interpretadas", () => {
    expect(interpretarFlagsUpdate([]).ok).toBe(true);
    const a = interpretarFlagsUpdate(["sprintx", "runx"]);
    expect(a.ok && a.opcoes.skills).toEqual(["sprintx", "runx"]);
    const b = interpretarFlagsUpdate(["--check"]);
    expect(b.ok && b.opcoes.check).toBe(true);
    const c = interpretarFlagsUpdate(["sprintx", "--to", "v2.0.0"]);
    expect(c.ok && c.opcoes.to).toBe("v2.0.0");
    const d = interpretarFlagsUpdate(["--latest"]);
    expect(d.ok && d.opcoes.latest).toBe(true);
    const e = interpretarFlagsUpdate(["--yes"]);
    expect(e.ok && e.opcoes.sim).toBe(true);
  });

  it("funcional: --to sem skill nomeada é recusado, porque fixaria todas de uma vez", () => {
    const r = interpretarFlagsUpdate(["--to", "v2.0.0"]);
    expect(r.ok).toBe(false);
  });

  it("funcional: --check não escreve nada em disco", async () => {
    const repo = criarRepoSkill({ nome: "sprintx", tags: ["v1.0.0"] });
    repos.push(repo);
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    await executarInit({ raiz: p.raiz, skills: ["sprintx"], harness: ["claude"], origens: { sprintx: repo } });

    const lock = join(p.raiz, ".expx/expx-lock.json");
    const antes = readFileSync(lock, "utf8");
    const r = await executarUpdate({ raiz: p.raiz, check: true, origens: { sprintx: repo } });

    expect(r.aplicou).toBe(false);
    expect(readFileSync(lock, "utf8")).toBe(antes);
  });

  it("funcional: toda execução que aplica cita o rollback pelo versionador", async () => {
    const repo = criarRepoSkill({ nome: "sprintx", tags: ["v1.0.0"] });
    repos.push(repo);
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    await executarInit({ raiz: p.raiz, skills: ["sprintx"], harness: ["claude"], origens: { sprintx: repo } });

    novaTag(repo, "v1.1.0");
    const r = await executarUpdate({ raiz: p.raiz, sim: true, origens: { sprintx: repo } });
    expect(r.aplicou).toBe(true);
    expect(r.atualizadas).toEqual(["sprintx"]);
    expect(r.mensagens.join(" ")).toContain(AVISO_ROLLBACK);
    expect(AVISO_ROLLBACK.toLowerCase()).toContain("versionador");
  });

  it("funcional: sem interatividade e sem --yes, mostra o que faria e não aplica", async () => {
    const repo = criarRepoSkill({ nome: "sprintx", tags: ["v1.0.0"] });
    repos.push(repo);
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    await executarInit({ raiz: p.raiz, skills: ["sprintx"], harness: ["claude"], origens: { sprintx: repo } });

    novaTag(repo, "v1.1.0");
    const r = await executarUpdate({ raiz: p.raiz, interativo: false, sim: false, origens: { sprintx: repo } });
    expect(r.aplicou).toBe(false);
    expect(r.mensagens.join(" ")).toContain("nada foi aplicado");
  });
});
