import { describe, it, expect } from "vitest";
import { interpretarOpcoes, ajudaWatch } from "./opcoes.js";

/**
 * T-03.05 — as três formas de invocação:
 *   expx watch                 segue o trabalho atual
 *   expx watch <trabalho_id>   segue um trabalho específico
 *   expx watch --todos         lista os trabalhos abertos, sem árvore
 */

describe("opções do watch", () => {
  it("integração: as três formas da especificação são interpretadas", () => {
    const sem = interpretarOpcoes([]);
    expect(sem.ok).toBe(true);
    if (sem.ok) {
      expect(sem.opcoes.trabalho).toBe(undefined);
      expect(sem.opcoes.todos).toBe(false);
      expect(sem.opcoes.ajuda).toBe(false);
    }

    const comId = interpretarOpcoes(["exportacao-csv"]);
    expect(comId.ok).toBe(true);
    if (comId.ok) expect(comId.opcoes.trabalho).toBe("exportacao-csv");

    const todos = interpretarOpcoes(["--todos"]);
    expect(todos.ok).toBe(true);
    if (todos.ok) expect(todos.opcoes.todos).toBe(true);
  });

  it("funcional: opção desconhecida devolve erro nomeando a opção", () => {
    const r = interpretarOpcoes(["--nao-existe"]);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.erro).toContain("--nao-existe");
      expect(r.erro).toContain("desconhecida");
    }
  });

  it("funcional: --ajuda em qualquer posição pede a ajuda", () => {
    for (const argv of [["--ajuda"], ["-h"], ["--help"], ["trabalho", "--ajuda"]]) {
      const r = interpretarOpcoes(argv);
      expect(r.ok, JSON.stringify(argv)).toBe(true);
      if (r.ok) expect(r.opcoes.ajuda).toBe(true);
    }
    expect(ajudaWatch()).toContain("expx watch");
    expect(ajudaWatch()).toContain("--todos");
  });

  it("funcional: dois trabalhos posicionais é erro, não o último vencendo em silêncio", () => {
    const r = interpretarOpcoes(["um", "dois"]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erro).toContain("um trabalho");
  });

  it("funcional: --todos com trabalho nomeado é contradição declarada", () => {
    const r = interpretarOpcoes(["exportacao-csv", "--todos"]);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erro).toContain("--todos");
  });
});
