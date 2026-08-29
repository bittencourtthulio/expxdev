import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { lerArquivoDeEstado } from "./arquivo.js";

function todosOsMd(raiz: string): string[] {
  const saida: string[] = [];
  for (const nome of readdirSync(raiz)) {
    const caminho = join(raiz, nome);
    if (statSync(caminho).isDirectory()) saida.push(...todosOsMd(caminho));
    else if (nome.endsWith(".md")) saida.push(caminho);
  }
  return saida;
}

describe("leitor de arquivo de estado", () => {
  it("integração: todo arquivo das duas fixtures devolve aceito ou rejeitado, nunca lança", () => {
    const arquivos = [...todosOsMd("fixtures/projeto-ok"), ...todosOsMd("fixtures/projeto-ruim")];
    expect(arquivos.length).toBeGreaterThan(15);

    for (const caminho of arquivos) {
      let r: ReturnType<typeof lerArquivoDeEstado> | undefined;
      expect(() => {
        r = lerArquivoDeEstado(caminho);
      }, `${caminho} lançou`).not.toThrow();
      expect(["aceito", "rejeitado"]).toContain(r?.tipo);
    }
  });

  it("funcional: um ORQUESTRADOR válido volta aceito com kind orquestrador", () => {
    const r = lerArquivoDeEstado("fixtures/projeto-ok/docs/exportacao-csv/ORQUESTRADOR.md");
    expect(r.tipo).toBe("aceito");
    if (r.tipo !== "aceito") return;
    expect(r.kind).toBe("orquestrador");
    expect(r.dados["trabalho_id"]).toBe("exportacao-csv");
  });

  it("funcional: arquivo inexistente vira rejeição, não exceção", () => {
    const r = lerArquivoDeEstado("fixtures/nao/existe.md");
    expect(r.tipo).toBe("rejeitado");
  });

  it("funcional: reler o mesmo arquivo inválido dá o mesmo resultado (sem cache)", () => {
    const caminho = "fixtures/projeto-ruim/docs/yaml-invalido/ORQUESTRADOR.md";
    const a = lerArquivoDeEstado(caminho);
    const b = lerArquivoDeEstado(caminho);
    const c = lerArquivoDeEstado(caminho);
    expect(a.tipo).toBe("rejeitado");
    expect(b.tipo).toBe("rejeitado");
    expect(c.tipo).toBe("rejeitado");
  });
});
