import { describe, it, expect, afterEach } from "vitest";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { detectarProjeto, expxNoGitignore } from "./projeto.js";

let p: ProjetoTemporario | undefined;
afterEach(() => {
  p?.descartar();
  p = undefined;
});

describe("detecção do projeto", () => {
  it("integração: distingue projeto limpo de projeto com .expx", () => {
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    expect(detectarProjeto(p.raiz).existe).toBe(false);
    p.descartar();

    p = projetoTemporario("fixtures/cli/projeto-com-expx");
    const d = detectarProjeto(p.raiz);
    expect(d.existe).toBe(true);
    expect(d.lock).toBe(join(p.raiz, ".expx", "expx-lock.json"));
  });

  it("funcional: detecta o versionador quando há .git e quando não há", () => {
    p = projetoTemporario();
    expect(detectarProjeto(p.raiz).versionado).toBe(false);
    execFileSync("git", ["init", "-q"], { cwd: p.raiz });
    expect(detectarProjeto(p.raiz).versionado).toBe(true);
  });

  it("funcional: acusa quando o .gitignore ignora o .expx", () => {
    p = projetoTemporario("fixtures/cli/quebrado-gitignore");
    expect(expxNoGitignore(p.raiz)).toBe(true);
    p.descartar();

    p = projetoTemporario();
    writeFileSync(join(p.raiz, ".gitignore"), "node_modules/\ndist/\n");
    expect(expxNoGitignore(p.raiz)).toBe(false);
  });
});
