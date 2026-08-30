import { describe, it, expect, afterEach } from "vitest";
import { mkdirSync, rmSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { descobrirRaiz } from "./raiz.js";

/**
 * T-03.01 — achar a raiz do projeto.
 *
 * O painel recebe `--dir ./docs` e pronto. O watch precisa de DUAS pastas que
 * só fazem sentido juntas — `docs/` e `.expx/` — e `.expx/` nem é descendente
 * de `docs/`. Por isso subimos até o `.git` (decisão D-17).
 */

let dir: string | undefined;

afterEach(() => {
  if (dir !== undefined) rmSync(dir, { recursive: true, force: true });
  dir = undefined;
});

describe("descoberta da raiz", () => {
  it("integração: de uma subpasta funda, devolve a raiz do repositório", () => {
    // pasta temporária com .git de verdade: fixture com .git não pode ser
    // commitada como subdiretório git
    dir = mkdtempSync(join(tmpdir(), "expx-raiz-"));
    mkdirSync(join(dir, ".git"), { recursive: true });
    const funda = join(dir, "src", "modulo", "sub");
    mkdirSync(funda, { recursive: true });

    expect(descobrirRaiz(funda)).toBe(dir);
    expect(descobrirRaiz(join(dir, "src"))).toBe(dir);
    expect(descobrirRaiz(dir)).toBe(dir);
  });

  it("funcional: sem nenhum .git em nenhum ancestral, devolve o próprio diretório", () => {
    dir = mkdtempSync(join(tmpdir(), "expx-semgit-"));
    const sub = join(dir, "a", "b");
    mkdirSync(sub, { recursive: true });

    // o temporário não tem .git acima dele em nenhum sistema testado
    expect(descobrirRaiz(sub)).toBe(sub);
  });

  it("funcional: o .git mais próximo vence, não o mais distante", () => {
    dir = mkdtempSync(join(tmpdir(), "expx-aninhado-"));
    mkdirSync(join(dir, ".git"), { recursive: true });
    const interno = join(dir, "pacotes", "interno");
    mkdirSync(join(interno, ".git"), { recursive: true });
    const dentro = join(interno, "src");
    mkdirSync(dentro, { recursive: true });

    expect(descobrirRaiz(dentro)).toBe(interno);
  });
});
