import { describe, it, expect, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import { writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { criarRepoSkill } from "../teste/repo-fixture.js";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { executarInit } from "../cli/init.js";
import { compararComRemoto } from "./comparar.js";

let p: ProjetoTemporario | undefined;
const repos: string[] = [];
afterEach(() => {
  p?.descartar();
  p = undefined;
  for (const r of repos.splice(0)) rmSync(r, { recursive: true, force: true });
});

function novaTag(repo: string, tag: string): void {
  writeFileSync(join(repo, ".claude/skills/sprintx/references/01.md"), `# atualizado em ${tag}\n`);
  const env = { ...process.env, GIT_AUTHOR_NAME: "e", GIT_AUTHOR_EMAIL: "e@e.invalid", GIT_COMMITTER_NAME: "e", GIT_COMMITTER_EMAIL: "e@e.invalid" };
  execFileSync("git", ["add", "-A"], { cwd: repo, env });
  execFileSync("git", ["commit", "-q", "-m", `melhora a referencia em ${tag}`], { cwd: repo, env });
  execFileSync("git", ["tag", tag], { cwd: repo });
}

describe("comparação com o remoto", () => {
  it("integração: skill desatualizada aparece com versão atual e nova", async () => {
    const repo = criarRepoSkill({ nome: "sprintx", tags: ["v1.0.0"] });
    repos.push(repo);
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    await executarInit({ raiz: p.raiz, skills: ["sprintx"], harness: ["claude"], origens: { sprintx: repo } });

    novaTag(repo, "v1.1.0");
    const r = await compararComRemoto({ raiz: p.raiz, origens: { sprintx: repo } });

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.itens).toHaveLength(1);
    expect(r.itens[0]?.emDia).toBe(false);
    expect(r.itens[0]?.atual).toBe("v1.0.0");
    expect(r.itens[0]?.nova).toBe("v1.1.0");
  });

  it("funcional: skill já na versão alvo é reportada em dia e não entra no plano", async () => {
    const repo = criarRepoSkill({ nome: "sprintx", tags: ["v1.0.0"] });
    repos.push(repo);
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    await executarInit({ raiz: p.raiz, skills: ["sprintx"], harness: ["claude"], origens: { sprintx: repo } });

    const r = await compararComRemoto({ raiz: p.raiz, origens: { sprintx: repo } });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.itens[0]?.emDia).toBe(true);
    expect(r.aAplicar).toHaveLength(0);
  });

  it("funcional: o resumo do que mudou traz os títulos dos commits entre as duas referências", async () => {
    const repo = criarRepoSkill({ nome: "sprintx", tags: ["v1.0.0"] });
    repos.push(repo);
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    await executarInit({ raiz: p.raiz, skills: ["sprintx"], harness: ["claude"], origens: { sprintx: repo } });

    novaTag(repo, "v1.1.0");
    const r = await compararComRemoto({ raiz: p.raiz, origens: { sprintx: repo } });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.itens[0]?.mudancas.join(" ")).toContain("melhora a referencia");
  });

  it("funcional: projeto sem lock devolve falha explicando o que falta", async () => {
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    const r = await compararComRemoto({ raiz: p.raiz });
    expect(r.ok).toBe(false);
  });
});
