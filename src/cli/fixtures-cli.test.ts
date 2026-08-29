import { describe, it, expect } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = "fixtures/cli";

/** T-01.01 — projeto limpo e projeto com .expx já existente. */
describe("fixtures de projeto", () => {
  it("integração: projeto-limpo não tem .expx e projeto-com-expx tem", () => {
    expect(existsSync(join(RAIZ, "projeto-limpo"))).toBe(true);
    expect(existsSync(join(RAIZ, "projeto-limpo", ".expx"))).toBe(false);
    expect(existsSync(join(RAIZ, "projeto-com-expx", ".expx"))).toBe(true);
  });

  it("funcional: o lock de projeto-com-expx é JSON válido com a chave skills", () => {
    const bruto = readFileSync(join(RAIZ, "projeto-com-expx/.expx/expx-lock.json"), "utf8");
    const lock = JSON.parse(bruto) as Record<string, unknown>;
    expect(lock["skills"]).toBeDefined();
  });
});

/** T-01.02 — os três estados de settings.json. */
describe("fixtures de settings.json", () => {
  it("integração: ausente, válido e inválido são três estados distintos", () => {
    expect(existsSync(join(RAIZ, "settings-ausente/.claude/settings.json"))).toBe(false);
    expect(existsSync(join(RAIZ, "settings-valido/.claude/settings.json"))).toBe(true);
    expect(() =>
      JSON.parse(readFileSync(join(RAIZ, "settings-invalido/.claude/settings.json"), "utf8")),
    ).toThrow();
  });

  it("funcional: settings-valido tem chave alheia ao expx que o merge precisa preservar", () => {
    const d = JSON.parse(
      readFileSync(join(RAIZ, "settings-valido/.claude/settings.json"), "utf8"),
    ) as Record<string, unknown>;
    const alheias = Object.keys(d).filter(
      (k) => k !== "extraKnownMarketplaces" && k !== "enabledPlugins",
    );
    expect(alheias.length).toBeGreaterThan(0);
  });
});

/** T-01.03 — os cenários que o doctor precisa diagnosticar. */
describe("fixtures de projeto quebrado", () => {
  it("integração: cada fixture contém exatamente o defeito que nomeia", () => {
    const skill = readFileSync(
      join(RAIZ, "quebrado-skill-fora/.expx/marketplace/plugins/expx/skills/x/SKILL.md"),
      "utf8",
    );
    expect(skill).toContain("../");
    const lock = JSON.parse(
      readFileSync(join(RAIZ, "quebrado-lock-futuro/.expx/expx-lock.json"), "utf8"),
    ) as { cli_version: string };
    expect(lock.cli_version).toBe("99.0.0");
    expect(readFileSync(join(RAIZ, "quebrado-gitignore/.gitignore"), "utf8")).toContain(".expx");
  });

  it("funcional: o SKILL.md de quebrado-skill-fora cita ../ para fora da pasta da skill", () => {
    const skill = readFileSync(
      join(RAIZ, "quebrado-skill-fora/.expx/marketplace/plugins/expx/skills/x/SKILL.md"),
      "utf8",
    );
    expect(/\.\.\/[\w-]+/.test(skill)).toBe(true);
  });
});
