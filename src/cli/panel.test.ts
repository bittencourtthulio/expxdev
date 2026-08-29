import { describe, it, expect, afterEach } from "vitest";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { executarExpx } from "./expx.js";
import { iniciarPainel } from "../servidor/painel.js";

let p: ProjetoTemporario | undefined;
afterEach(() => {
  p?.descartar();
  p = undefined;
});

describe("subcomando panel", () => {
  it("integração: o painel sobe e responde num projeto sem .expx", async () => {
    p = projetoTemporario("fixtures/cli/projeto-limpo");
    const docs = join(p.raiz, "docs");
    mkdirSync(docs, { recursive: true });
    writeFileSync(join(docs, "leiame.md"), "# projeto sem expx\n");

    const painel = await iniciarPainel({ raiz: docs, porta: 0 });
    try {
      const r = await fetch(`${painel.url()}/api/saude`);
      expect(r.status).toBe(200);
      const corpo = (await r.json()) as { ok: boolean };
      expect(corpo.ok).toBe(true);
    } finally {
      await painel.parar();
    }
  });

  it("funcional: expx --ajuda lista os seis subcomandos e devolve 0", async () => {
    const linhas: string[] = [];
    const codigo = await executarExpx(["--ajuda"], { escrever: (s) => linhas.push(s) });
    expect(codigo).toBe(0);
    const texto = linhas.join("");
    for (const s of ["init", "panel", "add", "remove", "update", "doctor"]) {
      expect(texto, `falta ${s}`).toContain(`expx ${s}`);
    }
  });

  it("funcional: subcomando desconhecido devolve 1 e nomeia o token", async () => {
    const erros: string[] = [];
    const codigo = await executarExpx(["quack"], { escreverErro: (s) => erros.push(s) });
    expect(codigo).toBe(1);
    expect(erros.join("")).toContain("quack");
  });
});
