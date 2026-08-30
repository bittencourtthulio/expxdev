import { describe, it, expect, afterEach } from "vitest";
import { rmSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { criarRepoSkill } from "../teste/repo-fixture.js";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { executarInit } from "../cli/init.js";
import { diagnosticar } from "./verificadores.js";

let p: ProjetoTemporario | undefined;
const repos: string[] = [];
afterEach(() => {
  p?.descartar();
  p = undefined;
  for (const r of repos.splice(0)) rmSync(r, { recursive: true, force: true });
});

async function projetoSadio(): Promise<ProjetoTemporario> {
  const repo = criarRepoSkill({ nome: "sprintx", tags: ["v1.0.0"] });
  repos.push(repo);
  const t = projetoTemporario("fixtures/cli/projeto-limpo");
  await executarInit({ raiz: t.raiz, skills: ["sprintx"], harness: ["claude"], origens: { sprintx: repo } });
  return t;
}

describe("doctor", () => {
  it("integração: cada fixture quebrada produz o achado que a nomeia", async () => {
    p = projetoTemporario("fixtures/cli/quebrado-lock-futuro");
    let r = diagnosticar(p.raiz);
    expect(r.achados.some((a) => a.id === "lock-futuro")).toBe(true);
    p.descartar();

    p = projetoTemporario("fixtures/cli/quebrado-gitignore");
    r = diagnosticar(p.raiz);
    expect(r.achados.some((a) => a.id === "gitignore-ignora-expx")).toBe(true);
    p.descartar();

    p = projetoTemporario("fixtures/cli/projeto-limpo");
    r = diagnosticar(p.raiz);
    expect(r.achados.some((a) => a.id === "sem-expx")).toBe(true);
  });

  it("funcional: a fixture quebrado-gitignore diz que o .expx está sendo ignorado", () => {
    p = projetoTemporario("fixtures/cli/quebrado-gitignore");
    const a = diagnosticar(p.raiz).achados.find((x) => x.id === "gitignore-ignora-expx");
    expect(a?.problema).toContain(".expx");
    expect(a?.correcao).not.toBe("");
  });

  it("funcional: projeto sadio produz zero achados", async () => {
    p = await projetoSadio();
    const r = diagnosticar(p.raiz);
    expect(r.achados, JSON.stringify(r.achados)).toHaveLength(0);
    expect(r.saudavel).toBe(true);
  });

  it("funcional: skill do lock ausente em disco é acusada nomeando a skill", async () => {
    p = await projetoSadio();
    rmSync(join(p.raiz, ".expx/marketplace/plugins/expx/skills/sprintx"), { recursive: true, force: true });
    const a = diagnosticar(p.raiz).achados.find((x) => x.id === "skill-ausente");
    expect(a?.problema).toContain("sprintx");
  });

  it("funcional: modificação local é acusada como divergência, não como erro fatal", async () => {
    p = await projetoSadio();
    writeFileSync(join(p.raiz, ".expx/marketplace/plugins/expx/skills/sprintx/SKILL.md"), "mexido\n");
    const a = diagnosticar(p.raiz).achados.find((x) => x.id === "modificacao-local");
    expect(a).toBeDefined();
    expect(a?.severidade).toBe("aviso");
  });

  it("funcional: skill que referencia caminho fora da pasta é acusada", async () => {
    p = await projetoSadio();
    const skill = join(p.raiz, ".expx/marketplace/plugins/expx/skills/sprintx");
    mkdirSync(skill, { recursive: true });
    writeFileSync(join(skill, "references", "01.md"), "veja ../../fora.md\n");
    const a = diagnosticar(p.raiz).achados.find((x) => x.id === "caminho-fora");
    expect(a).toBeDefined();
  });
});

describe("diagnóstico da instalação do memox", () => {
  /**
   * O hook do memox sai `0` em SILÊNCIO em qualquer erro — é falha aberta por
   * projeto. O efeito colateral é que uma instalação quebrada fica idêntica a
   * um projeto sem artefatos, e ninguém percebe. O doctor é o único lugar onde
   * isso vira visível (decisão D-17).
   *
   * O critério é a ausência do id `memox-sem-motor`, não "nenhum achado": o
   * diagnóstico emite outros achados que não têm relação com o memox.
   */
  it("integração: hook sem o motor irmão vira achado de erro", () => {
    p = projetoTemporario("fixtures/cli/projeto-com-expx");
    mkdirSync(join(p.raiz, ".claude/hooks"), { recursive: true });
    writeFileSync(join(p.raiz, ".claude/hooks/memox-injetar.sh"), "#!/usr/bin/env bash\nexit 0\n");

    const d = diagnosticar(p.raiz);
    const achado = d.achados.find((a) => a.id === "memox-sem-motor");
    expect(achado).toBeDefined();
    expect(achado?.severidade).toBe("erro");
    expect(achado?.correcao.length).toBeGreaterThan(0);
  });

  it("funcional: com o motor no lugar, o achado some", () => {
    p = projetoTemporario("fixtures/cli/projeto-com-expx");
    mkdirSync(join(p.raiz, ".claude/hooks"), { recursive: true });
    writeFileSync(join(p.raiz, ".claude/hooks/memox-injetar.sh"), "#!/usr/bin/env bash\nexit 0\n");
    expect(diagnosticar(p.raiz).achados.some((a) => a.id === "memox-sem-motor")).toBe(true);

    // o caminho é exatamente o que o hook resolve: DIR_HOOK/../skills/...
    mkdirSync(join(p.raiz, ".claude/skills/memox/assets"), { recursive: true });
    writeFileSync(join(p.raiz, ".claude/skills/memox/assets/memox.py"), "print('memox')\n");
    expect(diagnosticar(p.raiz).achados.some((a) => a.id === "memox-sem-motor")).toBe(false);
  });
});
