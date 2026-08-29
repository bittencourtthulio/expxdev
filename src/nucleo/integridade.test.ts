import { describe, it, expect, afterEach } from "vitest";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { hashearPasta, compararComHashes } from "./integridade.js";

let p: ProjetoTemporario | undefined;
afterEach(() => {
  p?.descartar();
  p = undefined;
});

function pastaComTresArquivos(raiz: string): string {
  const skill = join(raiz, "skills", "sprintx");
  mkdirSync(join(skill, "references"), { recursive: true });
  writeFileSync(join(skill, "SKILL.md"), "---\nname: sprintx\n---\n");
  writeFileSync(join(skill, "references", "a.md"), "conteudo a\n");
  writeFileSync(join(skill, "references", "b.md"), "conteudo b\n");
  return skill;
}

describe("detecção de modificação local", () => {
  it("integração: pasta intacta não acusa nada; um arquivo alterado acusa só ele", () => {
    p = projetoTemporario();
    const skill = pastaComTresArquivos(p.raiz);
    const hashes = hashearPasta(skill);
    expect(Object.keys(hashes)).toHaveLength(3);
    expect(compararComHashes(skill, hashes).alterados).toHaveLength(0);

    writeFileSync(join(skill, "references", "b.md"), "conteudo b MODIFICADO\n");
    const d = compararComHashes(skill, hashes);
    expect(d.alterados).toEqual([join("references", "b.md")]);
    expect(d.limpo).toBe(false);
  });

  it("funcional: arquivo removido e arquivo novo são reportados separadamente", () => {
    p = projetoTemporario();
    const skill = pastaComTresArquivos(p.raiz);
    const hashes = hashearPasta(skill);

    rmSync(join(skill, "references", "a.md"));
    writeFileSync(join(skill, "references", "c.md"), "novo\n");
    const d = compararComHashes(skill, hashes);

    expect(d.removidos).toEqual([join("references", "a.md")]);
    expect(d.novos).toEqual([join("references", "c.md")]);
    expect(d.alterados).toHaveLength(0);
    expect(d.limpo).toBe(false);
  });

  it("funcional: o mesmo conteúdo produz o mesmo hash em duas execuções", () => {
    p = projetoTemporario();
    const skill = pastaComTresArquivos(p.raiz);
    expect(hashearPasta(skill)).toEqual(hashearPasta(skill));
  });
});
