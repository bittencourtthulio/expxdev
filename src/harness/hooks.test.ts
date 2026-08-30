import { describe, it, expect, afterEach } from "vitest";
import { existsSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { criarRepoSkill } from "../teste/repo-fixture.js";
import { executarInit } from "../cli/init.js";

const criados: string[] = [];
afterEach(() => {
  for (const c of criados.splice(0)) rmSync(c, { recursive: true, force: true });
});

function projeto(): string {
  const d = mkdtempSync(join(tmpdir(), "expx-hooks-"));
  criados.push(d);
  return d;
}

/**
 * O hook do memox resolve o motor como `DIR_HOOK/../skills/memox/assets/memox.py`.
 * Se hook e skill não forem irmãos em `.claude/`, o hook sai `0` em silêncio e a
 * instalação quebrada fica indistinguível de "projeto sem artefatos" (D-15).
 */
describe("instalação dos hooks pelo init", () => {
  it("integração: depois do init, hook e motor existem como irmãos", async () => {
    const repo = criarRepoSkill({
      nome: "memox",
      tags: [],
      hooks: ["memox-injetar.sh", "memox-reindexar.sh"],
      assets: { "memox.py": "print('memox')\n" },
    });
    criados.push(repo);
    const raiz = projeto();

    const r = await executarInit({
      raiz,
      skills: ["memox"],
      harness: ["claude"],
      origens: { memox: repo },
    });
    expect(r.instaladas).toContain("memox");

    // a asserção é DEPOIS do retorno: o init apaga os clones temporários no
    // final, e uma cópia feita tarde demais leria pasta já removida (D-26)
    expect(existsSync(join(raiz, ".claude/hooks/memox-injetar.sh"))).toBe(true);
    expect(existsSync(join(raiz, ".claude/skills/memox/assets/memox.py"))).toBe(true);
  });

  it("funcional: o hook fica executável e skill sem hook não cria a pasta", async () => {
    const comHook = criarRepoSkill({
      nome: "memox",
      tags: [],
      hooks: ["memox-injetar.sh"],
      assets: { "memox.py": "print('memox')\n" },
    });
    criados.push(comHook);
    const raiz = projeto();
    await executarInit({ raiz, skills: ["memox"], harness: ["claude"], origens: { memox: comHook } });
    expect(statSync(join(raiz, ".claude/hooks/memox-injetar.sh")).mode & 0o100).toBe(0o100);

    const semHook = criarRepoSkill({ nome: "sprintx", tags: [] });
    criados.push(semHook);
    const outra = projeto();
    await executarInit({ raiz: outra, skills: ["sprintx"], harness: ["claude"], origens: { sprintx: semHook } });
    expect(existsSync(join(outra, ".claude/hooks"))).toBe(false);
  });
});
