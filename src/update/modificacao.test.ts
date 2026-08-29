import { describe, it, expect, afterEach } from "vitest";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { criarRepoSkill } from "../teste/repo-fixture.js";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { executarInit } from "../cli/init.js";
import { verificarModificacaoLocal, OPCOES_DE_DECISAO } from "./modificacao.js";

let p: ProjetoTemporario | undefined;
const repos: string[] = [];
afterEach(() => {
  p?.descartar();
  p = undefined;
  for (const r of repos.splice(0)) rmSync(r, { recursive: true, force: true });
});

async function instalado(): Promise<{ raiz: string; skill: string }> {
  const repo = criarRepoSkill({ nome: "sprintx", tags: ["v1.0.0"] });
  repos.push(repo);
  p = projetoTemporario("fixtures/cli/projeto-limpo");
  await executarInit({ raiz: p.raiz, skills: ["sprintx"], harness: ["claude"], origens: { sprintx: repo } });
  return { raiz: p.raiz, skill: join(p.raiz, ".expx/marketplace/plugins/expx/skills/sprintx") };
}

describe("bloqueio por modificação local", () => {
  it("integração: arquivo alterado é detectado e o disco não é tocado", async () => {
    const { raiz, skill } = await instalado();
    const alvo = join(skill, "SKILL.md");
    writeFileSync(alvo, "MODIFICADO A MAO\n");
    const antes = readFileSync(alvo, "utf8");

    const r = verificarModificacaoLocal(raiz, "sprintx");
    expect(r.temModificacao).toBe(true);
    expect(readFileSync(alvo, "utf8")).toBe(antes);
  });

  it("funcional: a saída lista o caminho alterado e oferece as três opções", async () => {
    const { raiz, skill } = await instalado();
    writeFileSync(join(skill, "references", "01.md"), "trecho meu\n");

    const r = verificarModificacaoLocal(raiz, "sprintx");
    expect(r.alterados).toEqual([join("references", "01.md")]);
    expect(OPCOES_DE_DECISAO).toHaveLength(3);
    expect(OPCOES_DE_DECISAO.map((o) => o.id)).toEqual(["manter", "substituir", "salvar-ao-lado"]);
  });

  it("funcional: instalação intacta não acusa modificação", async () => {
    const { raiz } = await instalado();
    expect(verificarModificacaoLocal(raiz, "sprintx").temModificacao).toBe(false);
  });

  it("funcional: skill fora do lock devolve erro nomeando a skill", async () => {
    const { raiz } = await instalado();
    const r = verificarModificacaoLocal(raiz, "runx");
    expect(r.erro).toContain("runx");
  });
});
