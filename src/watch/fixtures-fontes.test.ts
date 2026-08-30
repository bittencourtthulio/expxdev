import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { montarProjeto } from "../parser/projeto/montar.js";

/**
 * T-01.01 — as fixtures das duas fontes primárias.
 *
 * Nenhuma fixture do repositório tinha `.expx/estado.json` nem `docs/eventos/`
 * (base/fixtures-e-testes.md, risco 2). Estas nascem aqui, e este teste é o que
 * garante que elas continuam válidas contra o contrato `expx-estado`.
 */

const RAIZ = "fixtures/watch";

/** As quinze chaves do contrato expx-estado v1, na ordem do documento. */
const CHAVES = [
  "expx_estado",
  "atualizado_em",
  "trabalho",
  "ferramenta",
  "titulo_curto",
  "fase",
  "task",
  "tasks_concluidas",
  "tasks_total",
  "raio",
  "orcamento_arquivos",
  "orcamento_linhas",
  "branch",
  "pr_estado",
  "bloqueios",
] as const;

function estado(fixture: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(RAIZ, fixture, ".expx/estado.json"), "utf8")) as Record<
    string,
    unknown
  >;
}

describe("fixtures das fontes primárias", () => {
  it("integração: os quatro estado.json existem com as quinze chaves, e três fixtures têm plano legível", () => {
    // R6: a chave está sempre lá, mesmo quando o valor é null.
    for (const f of ["com-estado", "legado-raio-alto", "estado-versao-futura"]) {
      const e = estado(f);
      for (const c of CHAVES) {
        expect(c in e, `${f}: falta a chave ${c}`).toBe(true);
      }
    }

    // estado-invalido é JSON quebrado de propósito: não dá para checar chave.
    const bruto = readFileSync(join(RAIZ, "estado-invalido/.expx/estado.json"), "utf8");
    expect(() => JSON.parse(bruto)).toThrow();

    // O rastro e o arquivo rotacionado.
    expect(existsSync(join(RAIZ, "com-estado/docs/eventos/exportacao-csv.jsonl"))).toBe(true);
    expect(existsSync(join(RAIZ, "com-estado/docs/eventos/exportacao-csv.1.jsonl"))).toBe(true);

    // As três com plano precisam devolver trabalho de verdade: pasta sem
    // ORQUESTRADOR.md é ignorada em silêncio pelo parser.
    for (const f of ["com-estado", "legado-raio-alto", "estado-invalido"]) {
      const p = montarProjeto(join(RAIZ, f));
      expect(p.trabalhos.length, `${f} deveria ter um trabalho`).toBe(1);
      expect(p.rejeicoes, `${f} não deveria ter rejeição`).toEqual([]);
    }
  });

  it("funcional: legado-raio-alto traz raio alto e orçamento 2/3", () => {
    const e = estado("legado-raio-alto");
    expect(e["raio"]).toBe("alto");
    expect(e["orcamento_arquivos"]).toBe("2/3");
    expect(e["ferramenta"]).toBe("runx");
  });

  it("funcional: o rotacionado tem ts mais antigos que o corrente", () => {
    const linhas = (arq: string): string[] =>
      readFileSync(join(RAIZ, "com-estado/docs/eventos", arq), "utf8")
        .split("\n")
        .filter((l) => l.trim() !== "");

    const ts = (l: string): string => (JSON.parse(l) as { ts: string }).ts;
    const ultimoRotacionado = ts(linhas("exportacao-csv.1.jsonl").at(-1) as string);
    const primeiroCorrente = ts(linhas("exportacao-csv.jsonl")[0] as string);

    expect(ultimoRotacionado < primeiroCorrente).toBe(true);
  });
});
