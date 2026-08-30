import { describe, it, expect } from "vitest";
import { descobrirTrabalhos } from "./trabalhos.js";

describe("identificacao de trabalhos", () => {
  it("integração: projeto-ok devolve exatamente dois trabalhos, um de cada ferramenta", () => {
    const r = descobrirTrabalhos("fixtures/projeto-ok");
    expect(r.trabalhos).toHaveLength(2);
    const ferramentas = r.trabalhos.map((t) => t.expx_tool).sort();
    expect(ferramentas).toEqual(["runx", "sprintx"]);
    expect(r.rejeicoes).toHaveLength(0);
  });

  it("funcional: a pasta sem ORQUESTRADOR não vira trabalho nem gera rejeição", () => {
    const r = descobrirTrabalhos("fixtures/projeto-ruim");
    const pastas = r.trabalhos.map((t) => t.pasta);
    expect(pastas.some((p) => p.includes("pasta-sem-orquestrador"))).toBe(false);
    // e não aparece na lista de rejeições: é ignorada em silêncio (D-12)
    expect(r.rejeicoes.some((x) => x.arquivo.includes("pasta-sem-orquestrador"))).toBe(false);
  });

  it("funcional: os ORQUESTRADOR quebrados viram rejeição com motivo", () => {
    const r = descobrirTrabalhos("fixtures/projeto-ruim");
    // yaml-invalido, kind-desconhecido, schema-futuro, sem-frontmatter
    expect(r.rejeicoes.length).toBeGreaterThanOrEqual(4);
    const motivos = new Set(r.rejeicoes.map((x) => x.motivo));
    expect(motivos.size).toBeGreaterThanOrEqual(4);
    // enum-errado e violacoes são legíveis: viram trabalho, não rejeição
    const ids = r.trabalhos.map((t) => t.trabalho_id);
    expect(ids).toContain("OC-2026-9999");
  });
});

/**
 * Uma ocorrência recém-aberta (E1) ainda não tem `ORQUESTRADOR.md` — ele só
 * nasce no E2. Antes disso o trabalho existia no disco e era invisível ao
 * painel e ao watch, que mostravam "nenhum trabalho aberto" enquanto a
 * investigação rodava. É justamente a janela em que a pessoa mais olha a tela.
 */
describe("trabalho antes do plano (E1 e E2)", () => {
  it("funcional: ocorrência sem ORQUESTRADOR vira trabalho, com o que o 00-OCORRENCIA sabe", () => {
    const r = descobrirTrabalhos("fixtures/projeto-e1");
    expect(r.trabalhos).toHaveLength(1);
    const t = r.trabalhos[0]!;
    expect(t.trabalho_id).toBe("OC-2026-0500");
    expect(t.titulo).toBe("Erro no calculo do frete acima de 50kg");
    expect(t.expx_tool).toBe("runx");
    expect(t.tipo_ocorrencia).toBe("bug");
    // sem plano ainda: estágio e1, em andamento, sem sprints declaradas
    expect(t.estagio).toBe("e1");
    expect(t.status).toBe("em_andamento");
    expect(t.sprints).toEqual([]);
  });

  it("funcional: quando o ORQUESTRADOR existe, ele manda — a ocorrência não duplica", () => {
    const r = descobrirTrabalhos("fixtures/projeto-ok");
    const ids = r.trabalhos.map((t) => t.trabalho_id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
