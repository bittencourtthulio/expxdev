import { describe, it, expect } from "vitest";
import { montarProjeto } from "../projeto/montar.js";
import { verificarConformidade, TipoViolacao } from "./regras.js";

const HOJE = new Date("2026-08-29T12:00:00Z");

function violacoes(raiz: string) {
  return verificarConformidade(montarProjeto(raiz), { hoje: HOJE, diasBloqueio: 7 });
}

describe("violacoes de teste da task", () => {
  it("integração: projeto-ok não tem nenhuma violação de teste", () => {
    const v = violacoes("fixtures/projeto-ok").filter(
      (x) => x.tipo === TipoViolacao.TesteAusente || x.tipo === TipoViolacao.RegressaoAusente,
    );
    expect(v).toEqual([]);
  });

  it("funcional: teste_integracao só com espaços dispara a violação", () => {
    const v = violacoes("fixtures/projeto-ruim").filter((x) => x.tipo === TipoViolacao.TesteAusente);
    const ids = v.map((x) => x.alvo);
    expect(ids).toContain("T-01.01"); // chave ausente
    expect(ids).toContain("T-01.02"); // string vazia / só espaços
  });

  it("funcional: regressão só é cobrada de runx com tipo bug, nunca de sprintx", () => {
    const ok = violacoes("fixtures/projeto-ok").filter((x) => x.tipo === TipoViolacao.RegressaoAusente);
    expect(ok).toEqual([]); // o trabalho sprintx NÃO pode ser acusado

    const ruim = violacoes("fixtures/projeto-ruim").filter((x) => x.tipo === TipoViolacao.RegressaoAusente);
    expect(ruim).toHaveLength(1);
    expect(ruim[0]?.trabalho_id).toBe("OC-2026-9999");
  });
});

describe("violacoes de coerencia da task", () => {
  it("integração: projeto-ruim tem as duas violações previstas", () => {
    const v = violacoes("fixtures/projeto-ruim");
    expect(v.some((x) => x.tipo === TipoViolacao.ConcluidaSemVerde)).toBe(true);
    expect(v.some((x) => x.tipo === TipoViolacao.ParalelaComDependencia)).toBe(true);
  });

  it("funcional: task concluída com suíte vermelha dispara com o id da task", () => {
    const v = violacoes("fixtures/projeto-ruim").filter((x) => x.tipo === TipoViolacao.ConcluidaSemVerde);
    expect(v[0]?.alvo).toBe("T-01.01");
    expect(v[0]?.linha).toBeGreaterThan(0);
  });

  it("funcional: paralelizável com depende_de vazio não gera violação", () => {
    const ok = violacoes("fixtures/projeto-ok").filter((x) => x.tipo === TipoViolacao.ParalelaComDependencia);
    expect(ok).toEqual([]);
  });
});

describe("violacoes de estrutura e prazo", () => {
  it("integração: só a fixture ruim tem fase sem critério de saída", () => {
    expect(violacoes("fixtures/projeto-ok").filter((x) => x.tipo === TipoViolacao.SemCriterioSaida)).toEqual([]);
    expect(violacoes("fixtures/projeto-ruim").some((x) => x.tipo === TipoViolacao.SemCriterioSaida)).toBe(true);
  });

  it("funcional: bloqueio aberto há mais dias que o limite dispara", () => {
    const v = violacoes("fixtures/projeto-ruim").filter((x) => x.tipo === TipoViolacao.BloqueioAntigo);
    expect(v).toHaveLength(1); // aberto em 2026-08-10, hoje 2026-08-29 => 19 dias
    expect(v[0]?.detalhe).toContain("19");
  });

  it("funcional: a mesma fixture dá o mesmo resultado sempre (hoje é parâmetro)", () => {
    const a = verificarConformidade(montarProjeto("fixtures/projeto-ruim"), { hoje: HOJE, diasBloqueio: 7 });
    const b = verificarConformidade(montarProjeto("fixtures/projeto-ruim"), { hoje: HOJE, diasBloqueio: 7 });
    expect(a.length).toBe(b.length);
    // com limite maior que a idade, a violação some
    const c = verificarConformidade(montarProjeto("fixtures/projeto-ruim"), { hoje: HOJE, diasBloqueio: 999 });
    expect(c.filter((x) => x.tipo === TipoViolacao.BloqueioAntigo)).toEqual([]);
  });
});

describe("violacoes de referencia cruzada", () => {
  it("integração: projeto-ok não tem nenhuma violação de referência", () => {
    const v = violacoes("fixtures/projeto-ok").filter(
      (x) =>
        x.tipo === TipoViolacao.DependenciaInexistente ||
        x.tipo === TipoViolacao.CicloDependencia ||
        x.tipo === TipoViolacao.EstagioIncoerente,
    );
    expect(v).toEqual([]);
  });

  it("funcional: depende_de para id inexistente nomeia o id ausente", () => {
    const v = violacoes("fixtures/projeto-ruim").filter((x) => x.tipo === TipoViolacao.DependenciaInexistente);
    expect(v).toHaveLength(1);
    expect(v[0]?.detalhe).toContain("T-09.99");
  });

  it("funcional: estágio incoerente com a ferramenta dispara", () => {
    const v = violacoes("fixtures/projeto-ruim").filter((x) => x.tipo === TipoViolacao.EstagioIncoerente);
    expect(v).toHaveLength(1);
    expect(v[0]?.trabalho_id).toBe("OC-2026-9999"); // runx com estagio f6
  });

  it("funcional: ciclo de dependência é detectado sem estourar a pilha", () => {
    // ciclo montado em memória: A depende de B, B depende de A
    const p = montarProjeto("fixtures/projeto-ok");
    const s = p.trabalhos[0]?.sprints[0];
    if (!s) throw new Error("fixture sem sprint");
    const base = s.tasks[0];
    if (!base) throw new Error("fixture sem task");
    s.tasks = [
      { ...base, id: "T-99.01", depende_de: ["T-99.02"], fase: base.fase },
      { ...base, id: "T-99.02", depende_de: ["T-99.01"], fase: base.fase },
    ];
    const v = verificarConformidade(p, { hoje: HOJE, diasBloqueio: 7 });
    expect(v.some((x) => x.tipo === TipoViolacao.CicloDependencia)).toBe(true);
  });
});

describe("nenhuma violacao falsa no projeto correto", () => {
  it("integração: projeto-ok não produz violação alguma", () => {
    expect(violacoes("fixtures/projeto-ok")).toEqual([]);
  });
});
