import { describe, it, expect } from "vitest";
import { lerRastro } from "./rastro.js";

/**
 * T-01.07 — o leitor do rastro.
 *
 * `validarRastro` (src/parser/esquema/evento.ts) valida mas NÃO devolve as
 * linhas parseadas: `ResultadoRastro` só tem `linhas: number`, `defeitos[]` e
 * `desconhecidas[]` (base/rastro-de-eventos.md, risco 1). Este é o leitor que
 * faltava — e reaproveita o schema `LinhaEvento` que já existe.
 */

const RAIZ = "fixtures/watch";

describe("leitor do rastro", () => {
  it("integração: o rotacionado vem depois do corrente na ordem inversa", () => {
    const linhas = lerRastro(RAIZ + "/com-estado", "exportacao-csv");

    // 5 linhas no corrente + 2 no rotacionado
    expect(linhas.length).toBe(7);

    // ordem inversa: a mais recente primeiro
    const ts = linhas.map((l) => l.ts);
    expect([...ts].sort().reverse()).toEqual(ts);

    // as duas últimas são as do rotacionado, que é o arquivo mais ANTIGO
    expect(ts.at(-1)).toBe("2026-08-28T09:00:00Z");
    expect(ts.at(-2)).toBe("2026-08-28T09:05:00Z");

    // e as validadas trazem o vocabulário do contrato
    expect(linhas[0]?.evento).toBe("task_iniciada");
    expect(linhas[0]?.agente).toBe("principal");
  });

  it("funcional: devolve as linhas em ordem inversa, a mais recente primeiro", () => {
    const linhas = lerRastro(RAIZ + "/com-estado", "exportacao-csv");
    expect(linhas[0]?.ts).toBe("2026-08-29T14:32:00Z");
    expect(linhas[0]?.task).toBe("T-01.02");
  });

  it("funcional: rastro ausente devolve lista vazia sem lançar", () => {
    expect(() => lerRastro(RAIZ + "/sem-rastro", "exportacao-csv")).not.toThrow();
    expect(lerRastro(RAIZ + "/sem-rastro", "exportacao-csv")).toEqual([]);
  });

  it("funcional: linha inválida é descartada e as válidas seguem", () => {
    // o rastro é append-only e escrito por quatro skills independentes:
    // uma linha malformada não pode derrubar a leitura das outras
    const linhas = lerRastro(RAIZ + "/com-estado", "exportacao-csv");
    expect(linhas.every((l) => typeof l.ts === "string")).toBe(true);
  });

  it("funcional: respeita o limite de linhas pedido", () => {
    expect(lerRastro(RAIZ + "/com-estado", "exportacao-csv", 3).length).toBe(3);
  });
});
