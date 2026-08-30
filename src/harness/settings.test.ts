import { describe, it, expect, afterEach } from "vitest";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { mesclarSettings, lerPluginsHabilitados, caminhoDoSettings } from "./settings.js";

let p: ProjetoTemporario | undefined;
afterEach(() => {
  p?.descartar();
  p = undefined;
});

function settings(raiz: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(raiz, ".claude", "settings.json"), "utf8")) as Record<
    string,
    unknown
  >;
}

describe("merge do settings.json", () => {
  it("integração: as chaves alheias ao expx sobrevivem ao merge", () => {
    p = projetoTemporario("fixtures/cli/settings-valido");
    const antes = settings(p.raiz);
    const r = mesclarSettings(p.raiz, "/caminho/do/marketplace");
    expect(r.ok).toBe(true);

    const depois = settings(p.raiz);
    expect(depois["permissions"]).toEqual(antes["permissions"]);
    expect(depois["env"]).toEqual(antes["env"]);
    expect(depois["extraKnownMarketplaces"]).toBeDefined();
  });

  it("funcional: enabledPlugins vindo como array é lido e reescrito como objeto sem perder entrada", () => {
    p = projetoTemporario("fixtures/cli/settings-valido");
    mesclarSettings(p.raiz, "/caminho/do/marketplace");
    const d = settings(p.raiz);
    const habilitados = d["enabledPlugins"] as Record<string, boolean>;

    expect(Array.isArray(habilitados)).toBe(false);
    expect(habilitados["outro-plugin@outro-marketplace"]).toBe(true);
    expect(habilitados["expx@expx-local"]).toBe(true);
  });

  it("funcional: settings ausente é criado do zero com só as chaves do expx", () => {
    p = projetoTemporario("fixtures/cli/settings-ausente");
    const r = mesclarSettings(p.raiz, "/caminho/do/marketplace");
    expect(r.ok).toBe(true);
    const d = settings(p.raiz);
    expect(Object.keys(d).sort()).toEqual(["enabledPlugins", "extraKnownMarketplaces"]);
  });

  it("funcional: lerPluginsHabilitados aceita as duas formas, array e objeto", () => {
    expect(lerPluginsHabilitados(["a@m"])).toEqual({ "a@m": true });
    expect(lerPluginsHabilitados({ "a@m": true, "b@m": false })).toEqual({ "a@m": true, "b@m": false });
    expect(lerPluginsHabilitados(undefined)).toEqual({});
  });

  it("funcional: rodar o merge duas vezes não duplica nem altera o resultado", () => {
    p = projetoTemporario("fixtures/cli/settings-valido");
    mesclarSettings(p.raiz, "/caminho/do/marketplace");
    const primeira = settings(p.raiz);
    mesclarSettings(p.raiz, "/caminho/do/marketplace");
    expect(settings(p.raiz)).toEqual(primeira);
  });
});

describe("registro dos hooks no settings", () => {
  /**
   * `mesclarSettings` não conhece a lista de skills instaladas — inferir ali
   * acoplaria o harness ao catálogo. Por isso os hooks chegam por parâmetro
   * (decisão D-22). Sem hooks, o arquivo mantém exatamente a forma de sempre
   * (D-23): um projeto sem memox não ganha chave nova.
   */
  const HOOKS = [
    { skill: "memox", relativo: ".claude/hooks/memox-injetar.sh" },
    { skill: "memox", relativo: ".claude/hooks/memox-reindexar.sh" },
  ];

  it("integração: registra os dois eventos preservando o que já existia", () => {
    p = projetoTemporario("fixtures/cli/settings-valido");
    const r = mesclarSettings(p.raiz, "/caminho/do/marketplace", HOOKS);
    expect(r.ok).toBe(true);

    const d = settings(p.raiz) as Record<string, any>;
    expect(d["hooks"]["UserPromptSubmit"]).toHaveLength(1);
    expect(d["hooks"]["Stop"]).toHaveLength(1);
    // nada do que já estava no arquivo se perde
    expect(d["extraKnownMarketplaces"]).toBeDefined();
    expect(d["enabledPlugins"]).toBeDefined();
  });

  it("funcional: sem hooks o arquivo mantém só as duas chaves de sempre", () => {
    p = projetoTemporario("fixtures/cli/settings-ausente");
    mesclarSettings(p.raiz, "/caminho/do/marketplace", []);
    const d = settings(p.raiz);
    expect(Object.keys(d).sort()).toEqual(["enabledPlugins", "extraKnownMarketplaces"]);
  });

  it("funcional: rodar duas vezes com os mesmos hooks não duplica a entrada", () => {
    p = projetoTemporario("fixtures/cli/settings-ausente");
    mesclarSettings(p.raiz, "/caminho/do/marketplace", HOOKS);
    const primeira = JSON.stringify(settings(p.raiz));

    mesclarSettings(p.raiz, "/caminho/do/marketplace", HOOKS);
    const d = settings(p.raiz) as Record<string, any>;
    // hook duplicado faria o memox rodar duas vezes por prompt (D-16)
    expect(d["hooks"]["UserPromptSubmit"]).toHaveLength(1);
    expect(d["hooks"]["Stop"]).toHaveLength(1);
    expect(JSON.stringify(d)).toBe(primeira);
  });
});

/**
 * O lembrete de skill precisa chegar ao `settings.json` como UserPromptSubmit.
 *
 * É o único evento que roda ANTES da primeira ação do modelo — e o problema
 * que ele resolve é exatamente a etapa de escolher o processo não acontecer.
 */
describe("hook de lembrete das skills", () => {
  it("funcional: expx-lembrete é registrado em UserPromptSubmit", () => {
    const p = projetoTemporario();
    try {
      const r = mesclarSettings(p.raiz, "/tmp/mkt", [
        { skill: "runx", relativo: ".claude/hooks/expx-lembrete.sh" },
      ]);
      expect(r.ok).toBe(true);
      const s = JSON.parse(readFileSync(caminhoDoSettings(p.raiz), "utf8")) as {
        hooks: Record<string, Array<{ hooks: Array<{ command: string }> }>>;
      };
      const cmds = (s.hooks["UserPromptSubmit"] ?? []).flatMap((g) =>
        g.hooks.map((h) => h.command),
      );
      expect(cmds.some((c) => c.includes("expx-lembrete.sh"))).toBe(true);
    } finally {
      p.descartar();
    }
  });
});
