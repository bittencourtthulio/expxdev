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
} from "./enums.js";

describe("enums do contrato", () => {
  it("integração: todo valor da tabela do contrato é aceito", () => {
    const tabela: Array<[{ safeParse: (v: unknown) => { success: boolean } }, string[]]> = [
      [ExpxTool, ["sprintx", "runx"]],
      [TipoTrabalho, ["feature", "ocorrencia"]],
      [TipoOcorrencia, ["bug", "melhoria-ui", "melhoria-ux", "novo-relatorio", "regra-de-calculo", "campo-novo", "outro"]],
      [Estagio, ["f1", "f2", "f3", "f4", "f5", "f6", "e1", "e2", "e3", "e4", "e5"]],
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
  });
});
