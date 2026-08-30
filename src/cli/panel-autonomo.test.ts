import { describe, it, expect, afterEach } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { iniciarPainel } from "../servidor/painel.js";
import { garantirPasta, escolherPorta } from "./autonomo.js";

let p: ProjetoTemporario | undefined;
afterEach(() => {
  p?.descartar();
  p = undefined;
});

describe("panel sobe sozinho depois do init", () => {
  it("cria a pasta observada quando ela ainda nao existe", () => {
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    const docs = join(p.raiz, "docs");
    expect(existsSync(docs)).toBe(false);

    const r = garantirPasta(docs);

    expect(r.criada).toBe(true);
    expect(existsSync(docs)).toBe(true);
  });

  it("nao mexe na pasta quando ela ja existe", () => {
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    const docs = join(p.raiz, "docs");
    garantirPasta(docs);

    const r = garantirPasta(docs);

    expect(r.criada).toBe(false);
  });

  it("escolhe a porta pedida quando ela esta livre", async () => {
    const porta = await escolherPorta(0);
    expect(porta).toBe(0);
  });

  it("pula para a proxima porta livre quando a pedida esta ocupada", async () => {
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    const ocupado = await iniciarPainel({ raiz: p.raiz, porta: 0 });
    try {
      const emUso = ocupado.porta();

      const escolhida = await escolherPorta(emUso);

      expect(escolhida).not.toBe(emUso);
      expect(escolhida).toBeGreaterThan(emUso);
    } finally {
      await ocupado.parar();
    }
  });
});
