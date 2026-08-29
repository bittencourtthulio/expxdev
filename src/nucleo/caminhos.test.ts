import { describe, it, expect, afterEach } from "vitest";
import { rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { criarRepoSkill } from "../teste/repo-fixture.js";
import { verificarCaminhos } from "./caminhos.js";

const criados: string[] = [];
afterEach(() => {
  for (const c of criados.splice(0)) rmSync(c, { recursive: true, force: true });
});

describe("verificação de referência para fora da pasta da skill", () => {
  it("integração: a fixture quebrada acusa e uma skill sadia não acusa", () => {
    const fora = verificarCaminhos(
      "fixtures/cli/quebrado-skill-fora/.expx/marketplace/plugins/expx/skills/x",
    );
    expect(fora.length).toBeGreaterThan(0);

    const repo = criarRepoSkill({ nome: "sprintx", tags: [] });
    criados.push(repo);
    expect(verificarCaminhos(join(repo, ".claude/skills/sprintx"))).toHaveLength(0);
  });

  it("funcional: um SKILL.md que cita ../fora.md devolve esse arquivo e essa referência", () => {
    const repo = criarRepoSkill({ nome: "runx", tags: [], layout: "plano" });
    criados.push(repo);
    const skill = join(repo, "skill");
    writeFileSync(join(skill, "SKILL.md"), "---\nname: runx\ndescription: x\n---\n\nVeja `../fora.md`.\n");
    const achados = verificarCaminhos(skill);
    expect(achados).toHaveLength(1);
    expect(achados[0]?.arquivo).toContain("SKILL.md");
    expect(achados[0]?.referencia).toBe("../fora.md");
  });

  it("funcional: '../' dentro de bloco de código de exemplo também é acusado", () => {
    const repo = criarRepoSkill({ nome: "stackx", tags: [] });
    criados.push(repo);
    const skill = join(repo, ".claude/skills/stackx");
    writeFileSync(join(skill, "references", "01.md"), "leia ../../outro/lugar.md\n");
    expect(verificarCaminhos(skill).length).toBeGreaterThan(0);
  });
});
