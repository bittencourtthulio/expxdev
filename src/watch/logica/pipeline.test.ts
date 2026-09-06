import { describe, it, expect } from "vitest";
import { pipelineDe, posicaoNaTrilha, TRILHA } from "./pipeline.js";

/**
 * A trilha do framework é o que transforma um código de estágio solto numa
 * informação de acompanhamento — ver o cabeçalho de `pipeline.ts`.
 */

describe("pipelineDe", () => {
  it("funcional: situa os passos antes, no e depois do estagio corrente", () => {
    const p = pipelineDe("runx", "e3");

    expect(p.map((x) => x.situacao)).toEqual([
      "vencido",
      "vencido",
      "atual",
      "adiante",
      "adiante",
    ]);
    expect(p[2]?.nome).toBe("correcao");
  });

  it("integracao: cada ferramenta devolve a propria trilha inteira", () => {
    expect(pipelineDe("sprintx", "f1")).toHaveLength(TRILHA.sprintx.length);
    expect(pipelineDe("runx", "e1")).toHaveLength(TRILHA.runx.length);
    expect(pipelineDe("buildx", "b1")).toHaveLength(TRILHA.buildx.length);

    // A primeira posição é a atual, e nada ficou para trás.
    expect(pipelineDe("sprintx", "f1")[0]?.situacao).toBe("atual");
    expect(pipelineDe("sprintx", "f1").some((x) => x.situacao === "vencido")).toBe(false);
  });

  it("funcional: o ultimo estagio deixa tudo para tras e nada adiante", () => {
    const p = pipelineDe("sprintx", "f6");
    expect(p.at(-1)?.situacao).toBe("atual");
    expect(p.some((x) => x.situacao === "adiante")).toBe(false);
  });

  it("funcional: estagio desconhecido nao inventa progresso", () => {
    // Sem saber onde o trabalho está, marcar o primeiro passo como vencido
    // mentiria — a trilha inteira fica adiante.
    const p = pipelineDe("runx", "z9");
    expect(p.every((x) => x.situacao === "adiante")).toBe(true);
  });

  it("funcional: estagio de OUTRA ferramenta nao casa por engano", () => {
    // `f6` não existe na trilha da runx: casar por proximidade daria um passo
    // errado com cara de certo.
    expect(pipelineDe("runx", "f6").every((x) => x.situacao === "adiante")).toBe(true);
  });
});

describe("posicaoNaTrilha", () => {
  it("funcional: conta a posicao a partir de 1", () => {
    expect(posicaoNaTrilha("runx", "e3")).toEqual({ passo: 3, total: 5 });
    expect(posicaoNaTrilha("sprintx", "f6")).toEqual({ passo: 6, total: 6 });
  });

  it("funcional: estagio fora da trilha nao tem posicao", () => {
    expect(posicaoNaTrilha("buildx", "e1")).toBeNull();
  });
});
