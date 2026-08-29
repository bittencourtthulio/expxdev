import { describe, it, expect, afterEach } from "vitest";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { escreverLock, lerLock, versaoDoCli, VERSAO_LOCK, type Lock } from "./lock.js";

let p: ProjetoTemporario | undefined;
afterEach(() => {
  p?.descartar();
  p = undefined;
});

const EXEMPLO: Lock = {
  lock_version: VERSAO_LOCK,
  cli_version: versaoDoCli(),
  harness: ["claude", "opencode"],
  skills: {
    sprintx: {
      repositorio: "https://github.com/bittencourtthulio/sprintx",
      referencia: "v1.2.0",
      travado: true,
      commit: "4e3570c9bb19b8e336a5ca9c22ea17e7394dc6e8",
      resolvido_em: "2026-08-29",
      arquivos: { "SKILL.md": "abc123" },
    },
  },
};

describe("lock", () => {
  it("integração: grava e lê de volta preservando todos os campos", () => {
    p = projetoTemporario();
    escreverLock(p.raiz, EXEMPLO);
    const r = lerLock(p.raiz);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.lock).toEqual(EXEMPLO);
    expect(r.incompativel).toBe(false);
  });

  it("funcional: lock com cli_version maior que a atual é sinalizado como incompatível", () => {
    p = projetoTemporario("fixtures/cli/quebrado-lock-futuro");
    const r = lerLock(p.raiz);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.incompativel).toBe(true);
  });

  it("funcional: lock ausente e lock inválido devolvem falha, sem lançar", () => {
    p = projetoTemporario();
    expect(lerLock(p.raiz).ok).toBe(false);
    writeFileSync(join(p.raiz, "expx-lock-invalido.json"), "{ nao json");
    escreverLock(p.raiz, EXEMPLO);
    writeFileSync(join(p.raiz, ".expx", "expx-lock.json"), "{ quebrado");
    expect(lerLock(p.raiz).ok).toBe(false);
  });
});
