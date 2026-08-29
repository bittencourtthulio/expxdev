import { describe, it, expect, afterEach } from "vitest";
import { rmSync } from "node:fs";
import { criarRepoSkill } from "../teste/repo-fixture.js";
import { maiorTagSemver, resolverAlvo } from "./versao.js";

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
});
