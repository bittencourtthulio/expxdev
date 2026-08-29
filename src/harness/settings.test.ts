import { describe, it, expect, afterEach } from "vitest";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { mesclarSettings, lerPluginsHabilitados } from "./settings.js";

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
