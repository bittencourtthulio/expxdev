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

  it("integração: os seis kinds da buildx são aceitos, com projeto_id no lugar de trabalho_id", () => {
    // Kind desconhecido é REJEITADO pelo parser, não lido com o defeito à vista.
    // Sem estes seis registrados, todo artefato de projeto da buildx seria
    // descartado em silêncio pelo painel.
    const base = { expx_schema: 1, expx_tool: "buildx", projeto_id: "gestao-de-contratos" };
    const casos: Array<[string, Record<string, unknown>]> = [
      ["projeto", {
        ...base, kind: "projeto", titulo: "Sistema de gestao de contratos",
        modo: "autonomo", criado_em: "2026-08-30", atualizado_em: "2026-08-30",
        etapa: "b3", total_features: 9, features_entregues: 3,
        features_bloqueadas: 0, ciclos_recursao: 0,
      }],
      ["premissas", { ...base, kind: "premissas", atualizado_em: "2026-08-30", total: 23 }],
      ["mapa", {
        ...base, kind: "mapa", atualizado_em: "2026-08-30", total_features: 9,
        pendentes: 5, em_andamento: 1, entregues: 3, bloqueadas: 0,
      }],
      ["recursao", {
        ...base, kind: "recursao", atualizado_em: "2026-08-30", ciclo_atual: 2,
        teto_ciclos: 3, pendencias_abertas: 2, pendencias_resolvidas: 5,
      }],
      ["validacao", {
        ...base, kind: "validacao", data: "2026-08-30",
        veredito: "aprovado_com_pendencia", itens_conferidos: 34,
        itens_atendidos: 32, itens_pendentes: 2,
      }],
      ["relatorio", {
        ...base, kind: "relatorio", data: "2026-08-30", modo: "autonomo",
        features_entregues: 11, prs_abertos: 11, pendencias_declaradas: 2,
        premissas_registradas: 23, ciclos_recursao: 2,
      }],
    ];

    for (const [kind, dados] of casos) {
      const r = esquemaDoKind(kind as never).safeParse(dados);
      expect(r.success, `${kind}: ${r.success ? "" : JSON.stringify(r.error.issues.slice(0, 3))}`).toBe(true);
    }
  });

  it("funcional: o veredito da buildx tem três valores, e o veredito geral não os aceita", () => {
    // aprovado_com_pendencia é a distinção que o relatório final existe para
    // mostrar: entrega íntegra e entrega com pendência declarada não são a
    // mesma coisa. O enum geral de dois valores apagaria isso.
    const validacao = {
      expx_schema: 1, expx_tool: "buildx", kind: "validacao",
      projeto_id: "p", data: "2026-08-30", itens_conferidos: 1,
      itens_atendidos: 1, itens_pendentes: 0,
    };
    for (const v of ["aprovado", "aprovado_com_pendencia", "reprovado"]) {
      expect(esquemaDoKind("validacao").safeParse({ ...validacao, veredito: v }).success).toBe(true);
    }
    expect(esquemaDoKind("validacao").safeParse({ ...validacao, veredito: "talvez" }).success).toBe(false);
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
