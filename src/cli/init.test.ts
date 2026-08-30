import { describe, it, expect, afterEach } from "vitest";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { criarRepoSkill } from "../teste/repo-fixture.js";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { executarInit } from "./init.js";
import { lerLock } from "../nucleo/lock.js";

let p: ProjetoTemporario | undefined;
const repos: string[] = [];
afterEach(() => {
  p?.descartar();
  p = undefined;
  for (const r of repos.splice(0)) rmSync(r, { recursive: true, force: true });
});

/** Catálogo de teste: repositórios locais no lugar dos do GitHub. */
function catalogoLocal(nomes: readonly string[]): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const n of nomes) {
    const repo = criarRepoSkill({ nome: n, tags: ["v1.0.0"], layout: n === "runx" ? "plano" : "embutido" });
    repos.push(repo);
    saida[n] = repo;
  }
  return saida;
}

describe("init de ponta a ponta", () => {
  it("integração: cria a árvore .expx com lock, marketplace e plugin", async () => {
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    const r = await executarInit({
      raiz: p.raiz,
      skills: ["sprintx", "runx"],
      harness: ["claude"],
      origens: catalogoLocal(["sprintx", "runx"]),
    });

    expect(r.ok).toBe(true);
    expect(existsSync(join(p.raiz, ".expx/expx-lock.json"))).toBe(true);
    expect(existsSync(join(p.raiz, ".expx/marketplace/.claude-plugin/marketplace.json"))).toBe(true);
    expect(existsSync(join(p.raiz, ".expx/marketplace/plugins/expx/.claude-plugin/plugin.json"))).toBe(true);
  });

  it("funcional: dado sprintx e runx, o lock lista as duas e o plugin tem as duas skills", async () => {
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    await executarInit({
      raiz: p.raiz,
      skills: ["sprintx", "runx"],
      harness: ["claude"],
      origens: catalogoLocal(["sprintx", "runx"]),
    });

    const l = lerLock(p.raiz);
    expect(l.ok).toBe(true);
    if (!l.ok) return;
    expect(Object.keys(l.lock.skills).sort()).toEqual(["runx", "sprintx"]);

    const base = join(p.raiz, ".expx/marketplace/plugins/expx");
    expect(existsSync(join(base, "skills/sprintx/SKILL.md"))).toBe(true);
    expect(existsSync(join(base, "skills/runx/SKILL.md"))).toBe(true);
    expect(existsSync(join(base, "commands/sprintx.md"))).toBe(true);
  });

  it("funcional: o lock registra hash por arquivo de cada skill instalada", async () => {
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    await executarInit({
      raiz: p.raiz,
      skills: ["sprintx"],
      harness: ["claude"],
      origens: catalogoLocal(["sprintx"]),
    });
    const l = lerLock(p.raiz);
    expect(l.ok).toBe(true);
    if (!l.ok) return;
    const arquivos = l.lock.skills["sprintx"]?.arquivos ?? {};
    expect(Object.keys(arquivos).length).toBeGreaterThan(0);
    expect(arquivos["SKILL.md"]).toMatch(/^[0-9a-f]{64}$/);
  });

  it("funcional: skill inacessível não aborta as demais e é reportada", async () => {
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    const origens = catalogoLocal(["sprintx"]);
    origens["fantasma"] = "/caminho/que/nao/existe.git";

    const r = await executarInit({
      raiz: p.raiz,
      skills: ["sprintx", "fantasma"],
      harness: ["claude"],
      origens,
    });

    expect(r.ok).toBe(true);
    expect(r.falhas.map((f) => f.nome)).toEqual(["fantasma"]);
    const l = lerLock(p.raiz);
    expect(l.ok).toBe(true);
    if (!l.ok) return;
    expect(Object.keys(l.lock.skills)).toEqual(["sprintx"]);
  });

  it("funcional: com opencode escolhido, as skills vão para .claude/skills e os comandos para .opencode/commands", async () => {
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    await executarInit({
      raiz: p.raiz,
      skills: ["sprintx"],
      harness: ["claude", "opencode"],
      origens: catalogoLocal(["sprintx"]),
    });
    expect(existsSync(join(p.raiz, ".claude/skills/sprintx/SKILL.md"))).toBe(true);
    expect(existsSync(join(p.raiz, ".opencode/commands/sprintx.md"))).toBe(true);
    expect(existsSync(join(p.raiz, ".opencode/skills"))).toBe(false);
  });
});

describe("skill sem tag publicada", () => {
  it("integração: instala do topo da branch e NAO polui a saida com aviso", async () => {
    // O caso real: nenhum dos seis repositorios do metodo publica tag hoje.
    // Sem tag, o alvo e a branch padrao — e isso e instalacao valida, nao
    // defeito. Um aviso que dispara para toda skill em toda instalacao deixa
    // de ser lido e afoga os avisos que pedem atencao de verdade.
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    const repo = criarRepoSkill({ nome: "sprintx", tags: [], layout: "embutido" });
    repos.push(repo);

    const r = await executarInit({
      raiz: p.raiz,
      skills: ["sprintx"],
      harness: ["claude"],
      origens: { sprintx: repo },
    });

    expect(r.ok).toBe(true);
    expect(r.instaladas).toEqual(["sprintx"]);
    expect(r.avisos.join(" ")).not.toContain("travada");
  });

  it("funcional: o fato continua no resultado e no lock, para o doctor achar", async () => {
    // Silenciar o aviso nao apaga a informacao: quem procurar — o doctor, o
    // lock — continua encontrando que a skill segue branch, nao versao.
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    const repo = criarRepoSkill({ nome: "sprintx", tags: [], layout: "embutido" });
    repos.push(repo);

    const r = await executarInit({
      raiz: p.raiz,
      skills: ["sprintx"],
      harness: ["claude"],
      origens: { sprintx: repo },
    });

    expect(r.naoTravadas).toEqual(["sprintx"]);
    const l = lerLock(p.raiz);
    expect(l.ok).toBe(true);
    if (!l.ok) return;
    expect(l.lock.skills["sprintx"]?.travado).toBe(false);
  });

  it("funcional: skill COM tag continua travada na maior versao", async () => {
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    const repo = criarRepoSkill({ nome: "sprintx", tags: ["v1.0.0", "v1.10.0", "v1.2.0"], layout: "embutido" });
    repos.push(repo);

    const r = await executarInit({
      raiz: p.raiz,
      skills: ["sprintx"],
      harness: ["claude"],
      origens: { sprintx: repo },
    });

    expect(r.naoTravadas).toEqual([]);
    const l = lerLock(p.raiz);
    expect(l.ok).toBe(true);
    if (!l.ok) return;
    expect(l.lock.skills["sprintx"]?.referencia).toBe("v1.10.0");
    expect(l.lock.skills["sprintx"]?.travado).toBe(true);
  });
});
