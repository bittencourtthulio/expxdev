import { describe, it, expect } from "vitest";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/**
 * T-01.01 — o andaime só serve se o strict estiver realmente ligado.
 * Um build que não compila nada também sai com código 0, então o teste
 * de integração compila um erro de tipo deliberado e exige a falha.
 */
describe("andaime do pacote", () => {
  it("integração: o tsconfig do projeto rejeita um erro de tipo", () => {
    const dir = mkdtempSync(join(tmpdir(), "expx-strict-"));
    try {
      const base = JSON.parse(readFileSync("tsconfig.json", "utf8")) as {
        compilerOptions: Record<string, unknown>;
      };
      writeFileSync(
        join(dir, "tsconfig.json"),
        JSON.stringify({
          compilerOptions: { ...base.compilerOptions, outDir: "dist", rootDir: "." },
          include: ["*.ts"],
        }),
      );
      writeFileSync(join(dir, "erro.ts"), "export const n: number = 'texto';\n");

      let falhou = false;
      let saida = "";
      try {
        execFileSync("npx", ["tsc", "-p", join(dir, "tsconfig.json"), "--noEmit"], {
          encoding: "utf8",
          stdio: "pipe",
        });
      } catch (e) {
        falhou = true;
        saida = String((e as { stdout?: string }).stdout ?? "");
      }

      expect(falhou).toBe(true);
      expect(saida).toContain("erro.ts");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("funcional: strict e noUncheckedIndexedAccess estão ligados no tsconfig", () => {
    const tsconfig = JSON.parse(readFileSync("tsconfig.json", "utf8")) as {
      compilerOptions: { strict?: boolean; noUncheckedIndexedAccess?: boolean };
    };
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.noUncheckedIndexedAccess).toBe(true);
  });
});

/**
 * T-01.02 — a suíte precisa estar de fato configurada: rodar, achar os testes
 * nos diretórios do projeto e reportar o resultado.
 *
 * O teste invoca o vitest sobre um arquivo temporário próprio, nunca sobre a
 * suíte do projeto — isso evitaria recursão infinita.
 */
describe("configuracao do vitest", () => {
  it("integração: o vitest executa um arquivo de teste e reporta o resultado", () => {
    const dir = mkdtempSync(join(tmpdir(), "expx-vitest-"));
    try {
      writeFileSync(
        join(dir, "temp.test.ts"),
        "import { it, expect } from 'vitest';\nit('soma', () => { expect(1 + 1).toBe(2); });\n",
      );
      const saida = execFileSync(
        "npx",
        ["vitest", "run", "--root", dir, "--reporter=default", "temp.test.ts"],
        { encoding: "utf8", stdio: "pipe" },
      );
      expect(saida).toMatch(/1 passed|passed \(1\)/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("funcional: o include do vitest cobre src e ui", () => {
    const cfg = readFileSync("vitest.config.ts", "utf8");
    expect(cfg).toContain("src/**/*.test.ts");
    expect(cfg).toContain("ui/src/**/*.test.{ts,tsx}");
  });
});
