import { describe, it, expect, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { lerSchemaDaSkill, avaliarCompatibilidade } from "./compatibilidade.js";
import { VERSAO_SCHEMA_SUPORTADA } from "../index.js";

let p: ProjetoTemporario | undefined;
afterEach(() => {
  p?.descartar();
  p = undefined;
});

function skillCom(frontmatter: string, raiz: string): string {
  const pasta = join(raiz, "skills", "x");
  mkdirSync(pasta, { recursive: true });
  writeFileSync(join(pasta, "SKILL.md"), `---\n${frontmatter}\n---\n\n# x\n`);
  return pasta;
}

describe("compatibilidade de expx_schema", () => {
  it("integração: skill que declara schema 2 é bloqueada e schema 1 passa", () => {
    p = projetoTemporario();
    const futura = skillCom("name: x\ndescription: d\nexpx_schema: 2", join(p.raiz, "a"));
    const atual = skillCom("name: x\ndescription: d\nexpx_schema: 1", join(p.raiz, "b"));

    expect(avaliarCompatibilidade(futura).compativel).toBe(false);
    expect(avaliarCompatibilidade(atual).compativel).toBe(true);
  });

  it("funcional: com schema 2 e CLI que suporta 1, a mensagem manda atualizar o CLI", () => {
    p = projetoTemporario();
    const futura = skillCom("name: x\ndescription: d\nexpx_schema: 2", p.raiz);
    const r = avaliarCompatibilidade(futura);
    expect(r.compativel).toBe(false);
    expect(r.exigido).toBe(2);
    expect(r.suportado).toBe(VERSAO_SCHEMA_SUPORTADA);
    expect(r.motivo).toContain("atualizar o CLI");
  });

  it("funcional: ausência da chave significa schema 1, não erro", () => {
    p = projetoTemporario();
    const sem = skillCom("name: x\ndescription: d", p.raiz);
    expect(lerSchemaDaSkill(sem)).toBe(1);
    expect(avaliarCompatibilidade(sem).compativel).toBe(true);
  });

  it("funcional: SKILL.md ausente devolve schema 1 e não lança", () => {
    p = projetoTemporario();
    expect(lerSchemaDaSkill(join(p.raiz, "nao-existe"))).toBe(1);
  });
});
