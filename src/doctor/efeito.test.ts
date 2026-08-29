import { describe, it, expect, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { criarRepoSkill } from "../teste/repo-fixture.js";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { executarInit } from "../cli/init.js";
import { diagnosticar } from "./verificadores.js";
import { detectarColisoes } from "./efeito.js";

let p: ProjetoTemporario | undefined;
const repos: string[] = [];
afterEach(() => {
  p?.descartar();
  p = undefined;
  for (const r of repos.splice(0)) rmSync(r, { recursive: true, force: true });
});

async function projetoComOsDoisHarness(): Promise<ProjetoTemporario> {
  const repo = criarRepoSkill({ nome: "sprintx", tags: ["v1.0.0"] });
  repos.push(repo);
  const t = projetoTemporario("fixtures/cli/projeto-limpo");
  await executarInit({
    raiz: t.raiz,
    skills: ["sprintx"],
    harness: ["claude", "opencode"],
    origens: { sprintx: repo },
  });
  return t;
}

describe("colisão entre harnesses", () => {
  it("integração: a mesma skill nos dois diretórios que o OpenCode lê é acusada", async () => {
    p = await projetoComOsDoisHarness();
    const duplicada = join(p.raiz, ".opencode", "skills", "sprintx");
    mkdirSync(duplicada, { recursive: true });
    writeFileSync(join(duplicada, "SKILL.md"), "---\nname: sprintx\ndescription: copia\n---\n");

    const c = detectarColisoes(p.raiz, ["sprintx"]);
    expect(c).toHaveLength(1);
    expect(c[0]?.nome).toBe("sprintx");
    expect(c[0]?.caminhos).toHaveLength(2);

    const a = diagnosticar(p.raiz).achados.find((x) => x.id === "colisao-de-nome");
    expect(a?.problema).toContain("sprintx");
  });

  it("funcional: instalação normal com os dois harnesses não gera colisão", async () => {
    p = await projetoComOsDoisHarness();
    expect(detectarColisoes(p.raiz, ["sprintx"])).toHaveLength(0);
    expect(diagnosticar(p.raiz).achados.filter((a) => a.severidade === "erro")).toHaveLength(0);
  });

  it("funcional: a colisão nomeia os dois caminhos, para a pessoa saber o que apagar", async () => {
    p = await projetoComOsDoisHarness();
    const duplicada = join(p.raiz, ".opencode", "skills", "sprintx");
    mkdirSync(duplicada, { recursive: true });
    writeFileSync(join(duplicada, "SKILL.md"), "---\nname: sprintx\ndescription: copia\n---\n");

    const c = detectarColisoes(p.raiz, ["sprintx"]);
    expect(c[0]?.caminhos.some((x) => x.includes(".claude"))).toBe(true);
    expect(c[0]?.caminhos.some((x) => x.includes(".opencode"))).toBe(true);
  });
});
