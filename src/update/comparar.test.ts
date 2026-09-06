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

  it("integração: sem tag, um commit novo na main é detectado — não fica 'em dia' só por o nome da branch não mudar", async () => {
    const repo = criarRepoSkill({ nome: "sprintx", tags: [] });
    repos.push(repo);
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    // `file://` faz o init clonar (não copiar): só assim o lock grava um SHA de
    // verdade em `commit`, e não o "<sha>-local" de `copiarLocal` — que nunca é
    // comparável ao commit remoto resolvido (ver `ehCaminhoLocal`).
    const origem = `file://${repo}`;
    await executarInit({ raiz: p.raiz, skills: ["sprintx"], harness: ["claude"], origens: { sprintx: origem } });

    // Sem tag: a referência trava em "main" nas duas pontas. O bug original
    // comparava só esse nome e nunca via a novidade — por isso o commit aqui
    // NÃO ganha tag nova, só um commit a mais na própria main.
    const commitAntes = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo }).toString().trim();
    writeFileSync(join(repo, ".claude/skills/sprintx/references/01.md"), "# atualizado sem tag\n");
    execFileSync("git", ["add", "-A"], { cwd: repo });
    execFileSync("git", ["commit", "-q", "-m", "melhora sem publicar tag"], {
      cwd: repo,
      env: { ...process.env, GIT_AUTHOR_NAME: "e", GIT_AUTHOR_EMAIL: "e@e.invalid", GIT_COMMITTER_NAME: "e", GIT_COMMITTER_EMAIL: "e@e.invalid" },
    });
    const commitDepois = execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo }).toString().trim();
    expect(commitDepois).not.toBe(commitAntes);

    const r = await compararComRemoto({ raiz: p.raiz, origens: { sprintx: origem } });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.itens[0]?.atual).toBe("main");
    expect(r.itens[0]?.nova).toBe("main");
    expect(r.itens[0]?.emDia).toBe(false);
    expect(r.aAplicar).toHaveLength(1);
    expect(r.itens[0]?.mudancas.join(" ")).toContain("melhora sem publicar tag");
  });
});
