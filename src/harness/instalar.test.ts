import { describe, it, expect } from "vitest";
import { comandosDeInstalacao, instrucaoManual } from "./instalar.js";

describe("instalação do plugin no Claude Code", () => {
  it("integração: devolve os dois comandos, na ordem, com o caminho do marketplace", () => {
    const c = comandosDeInstalacao("/proj/.expx/marketplace");
    expect(c).toHaveLength(2);
    expect(c[0]?.args).toEqual(["plugin", "marketplace", "add", "/proj/.expx/marketplace"]);
    expect(c[1]?.args).toEqual(["plugin", "install", "expx@expx-local"]);
  });

  it("funcional: a instrução manual cita os dois comandos para quem não tem o binário", () => {
    const t = instrucaoManual("/proj/.expx/marketplace");
    expect(t).toContain("claude plugin marketplace add /proj/.expx/marketplace");
    expect(t).toContain("claude plugin install expx@expx-local");
  });
});
