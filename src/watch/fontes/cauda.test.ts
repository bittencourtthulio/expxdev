import { describe, it, expect, afterEach } from "vitest";
import { writeFileSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { lerCauda, LIMITE_CAUDA } from "./cauda.js";

/**
 * T-01.06 — ler só o fim de um `.jsonl`.
 *
 * O contrato só rotaciona o rastro em 5 MB, e a especificação proíbe "chamada
 * externa cara" a cada evento. Reler 5 MB por linha nova seria exatamente isso
 * (decisão D-09). O risco desta leitura é cortar a primeira linha ao meio.
 */

let dir: string | undefined;

afterEach(() => {
  if (dir !== undefined) rmSync(dir, { recursive: true, force: true });
  dir = undefined;
});

function arquivoCom(linhas: string[]): string {
  dir = mkdtempSync(join(tmpdir(), "expx-cauda-"));
  const caminho = join(dir, "rastro.jsonl");
  writeFileSync(caminho, linhas.join("\n") + "\n");
  return caminho;
}

describe("leitura da cauda", () => {
  it("integração: em arquivo maior que o limite, a primeira linha devolvida é completa", () => {
    // cada linha tem ~1 KB; 200 linhas passam de 64 KB com folga
    const linhas = Array.from(
      { length: 200 },
      (_, i) => `{"n":${String(i)},"enchimento":"${"x".repeat(1000)}"}`,
    );
    const caminho = arquivoCom(linhas);

    const lidas = lerCauda(caminho);

    // cortou: não devolveu tudo
    expect(lidas.length).toBeLessThan(200);
    expect(lidas.length).toBeGreaterThan(0);

    // e nenhuma das devolvidas é fragmento — todas são JSON íntegro
    for (const l of lidas) {
      expect(() => JSON.parse(l), `linha fragmentada: ${l.slice(0, 40)}`).not.toThrow();
    }

    // a última linha do arquivo tem de estar entre as devolvidas
    expect(lidas.at(-1)).toBe(linhas.at(-1));
  });

  it("funcional: arquivo de três linhas menor que o limite devolve as três inteiras", () => {
    const linhas = ['{"a":1}', '{"b":2}', '{"c":3}'];
    const lidas = lerCauda(arquivoCom(linhas));
    expect(lidas).toEqual(linhas);
  });

  it("funcional: arquivo inexistente devolve lista vazia sem lançar", () => {
    expect(() => lerCauda("/nao/existe/rastro.jsonl")).not.toThrow();
    expect(lerCauda("/nao/existe/rastro.jsonl")).toEqual([]);
  });

  it("funcional: o limite é o teto de bytes lidos, não de linhas", () => {
    expect(LIMITE_CAUDA).toBe(64 * 1024);
  });
});
