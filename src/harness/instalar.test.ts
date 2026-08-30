import { describe, it, expect } from "vitest";
import { comandosDeInstalacao, instrucaoManual } from "./instalar.js";

describe("instalação do plugin no Claude Code", () => {
  it("integração: devolve os comandos, na ordem, com o caminho do marketplace", () => {
    const c = comandosDeInstalacao("/proj/.expx/marketplace");
    expect(c[0]?.args).toEqual(["plugin", "marketplace", "add", "/proj/.expx/marketplace"]);
    const args = c.map((x) => x.args.join(" "));
    expect(args).toContain("plugin install expx@expx-local");
  });

  /**
   * O Claude Code NÃO carrega o plugin da pasta do projeto: ele copia para
   * `~/.claude/plugins/cache/<marketplace>/<plugin>/<versao>/` e roda de lá.
   *
   * Medido: depois de um `expx init` que montou a 0.5.1, o cache continuava na
   * 0.1.1 — com um conjunto de skills antigo, sem a runx e sem hooks. O
   * `plugin install` num plugin JÁ instalado não recopia, e o
   * `marketplace update` sozinho também não. A sessão seguia carregando a
   * versão velha, e o sintoma era a skill nunca ser acionada.
   *
   * Por isso a sequência desinstala antes de instalar: é o que força a cópia.
   */
  it("funcional: desinstala antes de instalar, para o cache do Claude Code ser recopiado", () => {
    const args = comandosDeInstalacao("/proj/.expx/marketplace").map((x) => x.args.join(" "));
    const uninstall = args.findIndex((a) => a.startsWith("plugin uninstall"));
    const install = args.findIndex((a) => a === "plugin install expx@expx-local");
    expect(uninstall).toBeGreaterThanOrEqual(0);
    expect(uninstall).toBeLessThan(install);
  });

  it("funcional: atualiza o marketplace antes de reinstalar", () => {
    const args = comandosDeInstalacao("/proj/.expx/marketplace").map((x) => x.args.join(" "));
    const update = args.findIndex((a) => a.startsWith("plugin marketplace update"));
    const install = args.findIndex((a) => a === "plugin install expx@expx-local");
    expect(update).toBeGreaterThanOrEqual(0);
    expect(update).toBeLessThan(install);
  });

  it("funcional: a instrução manual cita os dois comandos para quem não tem o binário", () => {
    const t = instrucaoManual("/proj/.expx/marketplace");
    expect(t).toContain("claude plugin marketplace add /proj/.expx/marketplace");
    expect(t).toContain("claude plugin install expx@expx-local");
  });
});
