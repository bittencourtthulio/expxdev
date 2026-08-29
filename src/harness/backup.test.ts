import { describe, it, expect, afterEach } from "vitest";
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { fazerBackup, hojeISO } from "./backup.js";
import { mesclarSettings, caminhoDoSettings } from "./settings.js";

let p: ProjetoTemporario | undefined;
afterEach(() => {
  p?.descartar();
  p = undefined;
});

describe("backup e recusa de JSON inválido", () => {
  it("integração: settings inválido não é alterado e o merge devolve erro", () => {
    p = projetoTemporario("fixtures/cli/settings-invalido");
    const caminho = caminhoDoSettings(p.raiz);
    const antes = readFileSync(caminho, "utf8");

    const r = mesclarSettings(p.raiz, "/qualquer/caminho");
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.erro).toContain("JSON valido");

    expect(readFileSync(caminho, "utf8")).toBe(antes);
    expect(readdirSync(join(p.raiz, ".claude")).filter((a) => a.includes("backup"))).toHaveLength(0);
  });

  it("funcional: settings válido gera cópia com a data no nome antes da escrita", () => {
    p = projetoTemporario("fixtures/cli/settings-valido");
    const caminho = caminhoDoSettings(p.raiz);
    const original = readFileSync(caminho, "utf8");

    const r = mesclarSettings(p.raiz, "/qualquer/caminho");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.backup).toBeDefined();
    expect(r.backup).toContain(hojeISO());
    expect(readFileSync(r.backup ?? "", "utf8")).toBe(original);
  });

  it("funcional: dois backups no mesmo dia não se sobrescrevem", () => {
    p = projetoTemporario();
    const arquivo = join(p.raiz, "config.json");
    writeFileSync(arquivo, "primeiro");
    const b1 = fazerBackup(arquivo);
    writeFileSync(arquivo, "segundo");
    const b2 = fazerBackup(arquivo);

    expect(b1).not.toBe(b2);
    expect(readFileSync(b1, "utf8")).toBe("primeiro");
    expect(readFileSync(b2, "utf8")).toBe("segundo");
    expect(existsSync(b1)).toBe(true);
  });
});
