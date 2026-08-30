import { describe, it, expect } from "vitest";
import {
  ExpxTool,
  TipoTrabalho,
  TipoOcorrencia,
  Estagio,
  StatusTrabalho,
  StatusTask,
  StatusDecisao,
  Suite,
  Veredito,
  Severidade,
  ModoCausaRaiz,
  Evidencia,
  ESTAGIOS_SPRINTX,
  ESTAGIOS_RUNX,
  ESTAGIOS_BUILDX,
  estagioCoerenteCom,
} from "./enums.js";

describe("enums do contrato", () => {
  it("integração: todo valor da tabela do contrato é aceito", () => {
    const tabela: Array<[{ safeParse: (v: unknown) => { success: boolean } }, string[]]> = [
      [ExpxTool, ["sprintx", "runx", "buildx"]],
      [TipoTrabalho, ["feature", "ocorrencia"]],
      [TipoOcorrencia, ["bug", "melhoria-ui", "melhoria-ux", "novo-relatorio", "regra-de-calculo", "campo-novo", "outro"]],
      [Estagio, ["f1", "f2", "f3", "f4", "f5", "f6", "e1", "e2", "e3", "e4", "e5", "b1", "b2", "b3", "b4", "b5", "b6"]],
      [StatusTrabalho, ["nao_iniciado", "em_andamento", "bloqueado", "concluido"]],
      [StatusTask, ["pendente", "em_andamento", "concluida", "bloqueada"]],
      [StatusDecisao, ["fechada", "pendente"]],
      [Suite, ["verde", "vermelha", "nao_executada"]],
      [Veredito, ["aprovado", "reprovado"]],
      [Severidade, ["alta", "media", "baixa"]],
      [ModoCausaRaiz, ["causa_raiz", "analise_impacto"]],
      [Evidencia, ["teste_falho", "log", "codigo"]],
    ];
    for (const [esquema, valores] of tabela) {
      for (const v of valores) {
        expect(esquema.safeParse(v).success, `${v} deveria ser aceito`).toBe(true);
      }
    }
  });

  it("funcional: status de task e de trabalho são enums distintos e não se aceitam", () => {
    // o par concluida/concluido difere em uma letra e vale para objetos diferentes
    expect(StatusTask.safeParse("concluida").success).toBe(true);
    expect(StatusTask.safeParse("concluido").success).toBe(false);
    expect(StatusTrabalho.safeParse("concluido").success).toBe(true);
    expect(StatusTrabalho.safeParse("concluida").success).toBe(false);
    // acento nunca é aceito em enum (regra 3)
    expect(StatusTask.safeParse("concluída").success).toBe(false);
    expect(Estagio.safeParse("F3").success).toBe(false);
    // os dois conjuntos de estágio ficam separados para a checagem de coerência
    expect(ESTAGIOS_SPRINTX).toContain("f6");
    expect(ESTAGIOS_SPRINTX).not.toContain("e1");
    expect(ESTAGIOS_RUNX).toContain("e5");
    expect(ESTAGIOS_RUNX).not.toContain("f1");
    expect(ESTAGIOS_BUILDX).toContain("b6");
    expect(ESTAGIOS_BUILDX).not.toContain("f1");
  });

  it("funcional: cada ferramenta só aceita os próprios estágios", () => {
    // a buildx grava o estado do PROJETO (b1..b6); sprintx e runx, o de um
    // TRABALHO. Um ternário de duas pontas mandaria a buildx para os estágios da
    // runx em silêncio, e acusaria estágio incoerente num arquivo correto.
    expect(estagioCoerenteCom("sprintx", "f3")).toBe(true);
    expect(estagioCoerenteCom("runx", "e2")).toBe(true);
    expect(estagioCoerenteCom("buildx", "b4")).toBe(true);

    expect(estagioCoerenteCom("buildx", "f3")).toBe(false);
    expect(estagioCoerenteCom("buildx", "e2")).toBe(false);
    expect(estagioCoerenteCom("sprintx", "b1")).toBe(false);
    expect(estagioCoerenteCom("runx", "b1")).toBe(false);
  });
});
