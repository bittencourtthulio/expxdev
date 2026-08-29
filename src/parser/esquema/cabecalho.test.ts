import { describe, it, expect } from "vitest";
import matter from "gray-matter";
import { readFileSync } from "node:fs";
import { Cabecalho, KINDS_SEM_TRABALHO_ID, VERSAO_SUPORTADA } from "./cabecalho.js";

const OK = "fixtures/projeto-ok/docs";

function fm(p: string): unknown {
  matter.clearCache();
  return matter(readFileSync(p, "utf8")).data;
}

describe("cabecalho comum", () => {
  it("integração: o cabeçalho de cada fixture boa é aceito", () => {
    const arquivos = [
      `${OK}/exportacao-csv/ORQUESTRADOR.md`,
      `${OK}/exportacao-csv/00-DECISOES.md`,
      `${OK}/exportacao-csv/base/00-INDICE.md`,
      `${OK}/exportacao-csv/sprint-01/tasks.md`,
      `${OK}/manutencao/OC-2026-0142-frete/00-OCORRENCIA.md`,
      `${OK}/manutencao/OC-2026-0142-frete/QA.md`,
      `${OK}/relatorios/INDICE.md`,
      `${OK}/relatorios/2026-08-29-OC-2026-0142-frete/uso.md`,
    ];
    for (const a of arquivos) {
      const r = Cabecalho.safeParse(fm(a));
      expect(r.success, `${a}: ${r.success ? "" : JSON.stringify(r.error.issues)}`).toBe(true);
    }
  });

  it("funcional: relatorios_indice passa sem trabalho_id, os outros kinds não", () => {
    const semId = { expx_schema: 1, expx_tool: "runx", kind: "relatorios_indice" };
    expect(Cabecalho.safeParse(semId).success).toBe(true);

    const orquestradorSemId = { expx_schema: 1, expx_tool: "sprintx", kind: "orquestrador" };
    expect(Cabecalho.safeParse(orquestradorSemId).success).toBe(false);

    expect(KINDS_SEM_TRABALHO_ID).toContain("relatorios_indice");
    expect(VERSAO_SUPORTADA).toBe(1);
  });
});
