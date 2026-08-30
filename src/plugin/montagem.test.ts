import { describe, it, expect, afterEach } from "vitest";
import { existsSync, rmSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { criarRepoSkill } from "../teste/repo-fixture.js";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { detectarLayout } from "../nucleo/layout.js";
import { montarPlugin, type SkillMontavel } from "./montagem.js";

let p: ProjetoTemporario | undefined;
const repos: string[] = [];
afterEach(() => {
  p?.descartar();
  p = undefined;
  for (const r of repos.splice(0)) rmSync(r, { recursive: true, force: true });
});

function montavel(nome: string, layout: "embutido" | "plano" = "embutido"): SkillMontavel {
  const repo = criarRepoSkill({ nome, tags: [], layout });
  repos.push(repo);
  const l = detectarLayout(repo, nome);
  if (!l.ok) throw new Error(l.erro);
  return { nome, raizSkill: l.raizSkill, comandos: l.comandos };
}

describe("nucleo compartilhado", () => {
  // A Camada 2 do núcleo só existe se ela CHEGA ao projeto. Sem este teste, a
  // pasta pode sair da montagem sem ninguém perceber, e cada skill volta a
  // manter a própria cópia do rastro — que é o problema que ele resolve.
  it("integração: o núcleo viaja junto com o plugin montado", () => {
    p = projetoTemporario();
    const destino = join(p.raiz, "plugin");
    montarPlugin(destino, [montavel("sprintx")], "1.0.0");

    const rastro = join(destino, "nucleo", "hooks", "expx-rastro.sh");
    expect(existsSync(rastro)).toBe(true);

    const fonte = readFileSync(rastro, "utf8");
    // A ferramenta é parâmetro, nunca literal: é o que impedia compartilhar.
    expect(fonte).toContain("EXPX_FERRAMENTA");
    expect(fonte).toContain("expx_rastro_grava");
    expect(fonte).toContain("expx_modo");
  });
});

describe("montagem do plugin", () => {
  it("integração: monta com duas de três skills e a terceira não aparece", () => {
    p = projetoTemporario();
    const destino = join(p.raiz, "plugin");
    montarPlugin(destino, [montavel("sprintx"), montavel("runx", "plano")], "0.1.0");

    expect(existsSync(join(destino, "skills/sprintx/SKILL.md"))).toBe(true);
    expect(existsSync(join(destino, "skills/runx/SKILL.md"))).toBe(true);
    expect(existsSync(join(destino, "skills/mergex"))).toBe(false);
  });

  it("funcional: dado sprintx selecionado, a skill e o comando dele existem no plugin", () => {
    p = projetoTemporario();
    const destino = join(p.raiz, "plugin");
    montarPlugin(destino, [montavel("sprintx")], "0.1.0");

    expect(existsSync(join(destino, "skills/sprintx/SKILL.md"))).toBe(true);
    expect(existsSync(join(destino, "commands/sprintx.md"))).toBe(true);
    expect(existsSync(join(destino, ".claude-plugin/plugin.json"))).toBe(true);

    const pj = JSON.parse(readFileSync(join(destino, ".claude-plugin/plugin.json"), "utf8")) as {
      name: string;
    };
    expect(pj.name).toBe("expx");
  });

  it("funcional: a subárvore references/ da skill é copiada junto", () => {
    p = projetoTemporario();
    const destino = join(p.raiz, "plugin");
    montarPlugin(destino, [montavel("sprintx")], "0.1.0");
    expect(existsSync(join(destino, "skills/sprintx/references/01.md"))).toBe(true);
  });
});
