import { describe, it, expect } from "vitest";
import { montarPluginJson, montarMarketplaceJson, PluginJson, MarketplaceJson, ORIGEM_DO_PLUGIN } from "./manifestos.js";

describe("manifestos do plugin local", () => {
  it("integração: os dois manifestos validam contra o esquema", () => {
    const p = PluginJson.safeParse(montarPluginJson("0.1.0"));
    const m = MarketplaceJson.safeParse(montarMarketplaceJson());
    expect(p.success).toBe(true);
    expect(m.success).toBe(true);
  });

  it("funcional: o plugin se chama expx e o marketplace aponta para dentro de si", () => {
    const p = montarPluginJson("0.1.0");
    expect(p.name).toBe("expx");
    expect(p.version).toBe("0.1.0");

    const m = montarMarketplaceJson();
    expect(m.plugins).toHaveLength(1);
    expect(m.plugins[0]?.name).toBe("expx");
    expect(m.plugins[0]?.source).toBe(ORIGEM_DO_PLUGIN);
  });

  it("funcional: o source do marketplace nunca sobe de diretório", () => {
    const m = montarMarketplaceJson();
    const src = m.plugins[0]?.source ?? "";
    expect(src.includes("..")).toBe(false);
    expect(src.startsWith("./")).toBe(true);
  });
});
