import { describe, it, expect, afterEach } from "vitest";
import { mkdtempSync, writeFileSync, rmSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { observar, type Observador } from "./observador.js";

let obs: Observador | null = null;
let dir: string | null = null;

afterEach(async () => {
  await obs?.parar();
  obs = null;
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = null;
});

function projetoTemporario(): string {
  const d = mkdtempSync(join(tmpdir(), "expx-obs-"));
  cpSync("fixtures/projeto-ok", d, { recursive: true });
  return d;
}

describe("observador de arquivos", () => {
  it("integração: alterar um arquivo dispara exatamente uma releitura", async () => {
    dir = projetoTemporario();
    let disparos = 0;
    obs = await observar(dir, () => disparos++, 80);

    const alvo = join(dir, "docs/exportacao-csv/ORQUESTRADOR.md");
    writeFileSync(alvo, `${String(Date.now())}\n`, { flag: "a" });

    await new Promise((r) => setTimeout(r, 500));
    expect(disparos).toBe(1);
  });

  it("funcional: três alterações seguidas viram um único disparo", async () => {
    dir = projetoTemporario();
    let disparos = 0;
    obs = await observar(dir, () => disparos++, 150);

    const alvo = join(dir, "docs/exportacao-csv/sprint-01/tasks.md");
    for (let i = 0; i < 3; i++) {
      writeFileSync(alvo, `# ${String(i)}\n`, { flag: "a" });
      await new Promise((r) => setTimeout(r, 20));
    }

    await new Promise((r) => setTimeout(r, 600));
    expect(disparos).toBe(1);
  });
});
