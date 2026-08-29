import { describe, it, expect } from "vitest";
import { execFile } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const BIN = "dist/cli/principal.js";

function rodar(args: string[], ms = 6000): Promise<{ saida: string; codigo: number | null }> {
  return new Promise((ok) => {
    const p = execFile("node", [BIN, ...args], { encoding: "utf8" }, (_e, stdout, stderr) => {
      ok({ saida: String(stdout) + String(stderr), codigo: p.exitCode });
    });
    setTimeout(() => p.kill(), ms);
  });
}

describe("binario do painel", () => {
  it("integração: sobe o servidor sobre a fixture e anuncia a URL de loopback", async () => {
    expect(existsSync(BIN), "rode npm run build antes").toBe(true);
    const r = await rodar(["--dir", "fixtures/projeto-ok", "--porta", "0", "--no-open"], 4000);
    expect(r.saida).toContain("127.0.0.1");
    expect(r.saida).toMatch(/2 trabalho/i);
  });

  it("funcional: com --no-open nenhuma tentativa de abrir navegador acontece", async () => {
    const r = await rodar(["--dir", "fixtures/projeto-ok", "--porta", "0", "--no-open"], 4000);
    expect(r.saida).not.toMatch(/abrindo o navegador/i);
  });

  it("funcional: --ajuda imprime a ajuda e sai", async () => {
    const r = await rodar(["--ajuda"], 4000);
    expect(r.saida).toContain("--porta");
    expect(r.saida).toContain("--no-open");
  });

  it("integração: o binário roda quando invocado por symlink, como o npm instala", async () => {
    // Regressão: o npm cria node_modules/.bin/<nome> como symlink, então
    // process.argv[1] é o link e import.meta.url é o arquivo real. Comparar os
    // dois sem realpath faz o CLI encerrar em silêncio, com código 0 e sem
    // nenhuma saída — que foi o que aconteceu na primeira tentativa de publicar.
    const dir = mkdtempSync(join(tmpdir(), "expx-bin-"));
    try {
      const link = join(dir, "expx-painel");
      symlinkSync(resolve(BIN), link);
      const saida = await new Promise<string>((ok) => {
        execFile("node", [link, "--ajuda"], { encoding: "utf8" }, (_e, out, err) => ok(String(out) + String(err)));
      });
      expect(saida).toContain("--porta");
      expect(saida).toContain("--no-open");
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it("funcional: opção inválida sai com erro claro", async () => {
    const r = await rodar(["--nao-existe"], 4000);
    expect(r.saida).toContain("opcao desconhecida");
  });
});
