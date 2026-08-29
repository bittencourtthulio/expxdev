import { describe, it, expect } from "vitest";
import matter from "gray-matter";
import { readFileSync } from "node:fs";
import { esquemaDoKind, Arquivos } from "./kinds.js";

const OK = "fixtures/projeto-ok/docs";

function fm(p: string): unknown {
  matter.clearCache();
  return matter(readFileSync(p, "utf8")).data;
}

describe("esquemas dos kinds", () => {
  it("integração: cada arquivo da fixture boa valida contra o esquema do seu kind", () => {
    const arquivos: Array<[string, string]> = [
      [`${OK}/exportacao-csv/ORQUESTRADOR.md`, "orquestrador"],
      [`${OK}/exportacao-csv/00-BLOQUEIOS.md`, "bloqueios"],
      [`${OK}/exportacao-csv/00-DECISOES.md`, "decisoes"],
      [`${OK}/exportacao-csv/base/00-INDICE.md`, "base_indice"],
      [`${OK}/exportacao-csv/sprint-01/sprint.md`, "sprint"],
      [`${OK}/exportacao-csv/sprint-01/fases.md`, "fases"],
      [`${OK}/exportacao-csv/sprint-01/tasks.md`, "tasks"],
      [`${OK}/manutencao/OC-2026-0142-frete/ORQUESTRADOR.md`, "orquestrador"],
      [`${OK}/manutencao/OC-2026-0142-frete/00-OCORRENCIA.md`, "ocorrencia"],
      [`${OK}/manutencao/OC-2026-0142-frete/01-CAUSA-RAIZ.md`, "causa_raiz"],
      [`${OK}/manutencao/OC-2026-0142-frete/QA.md`, "qa"],
      [`${OK}/manutencao/OC-2026-0142-frete/sprint-01/tasks.md`, "tasks"],
      [`${OK}/relatorios/INDICE.md`, "relatorios_indice"],
      [`${OK}/relatorios/2026-08-29-OC-2026-0142-frete/tecnico.md`, "relatorio_tecnico"],
      [`${OK}/relatorios/2026-08-29-OC-2026-0142-frete/uso.md`, "relatorio_uso"],
    ];
    for (const [caminho, kind] of arquivos) {
      const esquema = esquemaDoKind(kind as never);
      const r = esquema.safeParse(fm(caminho));
      expect(r.success, `${caminho}: ${r.success ? "" : JSON.stringify(r.error.issues.slice(0, 3))}`).toBe(true);
    }
  });

  it("funcional: o campo arquivos aceita as duas formas e normaliza para cria/altera", () => {
    // forma das skills (mapa) — o que existe de fato no disco
    const mapa = Arquivos.parse({ cria: ["a.ts"], altera: ["b.ts"] });
    expect(mapa).toEqual({ cria: ["a.ts"], altera: ["b.ts"] });

    // forma do contrato (lista plana) — normalizada para o mapa
    const lista = Arquivos.parse(["a.ts", "b.ts"]);
    expect(lista).toEqual({ cria: ["a.ts", "b.ts"], altera: [] });

    // ausência das chaves internas vira lista vazia
    expect(Arquivos.parse({ cria: ["x.ts"] })).toEqual({ cria: ["x.ts"], altera: [] });
  });
});
