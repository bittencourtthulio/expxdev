import { describe, it, expect } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { montarProjeto } from "../parser/projeto/montar.js";

/**
 * T-01.02 — as fixtures de borda: trabalho concluído, nenhum trabalho aberto,
 * rastro ausente, e vários trabalhos com os quatro status.
 *
 * `sem-trabalho` e `varios-trabalhos` são o que torna testável a decisão D-05
 * (qual é o trabalho atual) e a D-16 (o que `--todos` lista).
 */

const RAIZ = "fixtures/watch";

describe("fixtures de borda", () => {
  it("integração: concluido, sem-trabalho, sem-rastro e varios-trabalhos estão no formato esperado", () => {
    const concluido = montarProjeto(join(RAIZ, "concluido"));
    expect(concluido.trabalhos.length).toBe(1);
    expect(concluido.trabalhos[0]?.status).toBe("concluido");

    // "nenhum trabalho" é diferente de "trabalho que falhou ao ler": as duas
    // listas precisam estar vazias, senão o watch mostraria erro onde não há.
    const sem = montarProjeto(join(RAIZ, "sem-trabalho"));
    expect(sem.trabalhos).toEqual([]);
    expect(sem.rejeicoes).toEqual([]);

    // sem-rastro tem plano legível, e é a ausência de docs/eventos que ela testa.
    const semRastro = montarProjeto(join(RAIZ, "sem-rastro"));
    expect(semRastro.trabalhos.length).toBe(1);
    expect(existsSync(join(RAIZ, "sem-rastro/docs/eventos"))).toBe(false);

    const varios = montarProjeto(join(RAIZ, "varios-trabalhos"));
    expect(varios.trabalhos.length).toBe(4);
    expect(varios.trabalhos.map((t) => t.status).sort()).toEqual([
      "bloqueado",
      "concluido",
      "em_andamento",
      "nao_iniciado",
    ]);
  });

  it("funcional: concluido tem três tasks, todas concluida, e progresso 1", () => {
    const p = montarProjeto(join(RAIZ, "concluido"));
    const tasks = p.trabalhos[0]?.sprints.flatMap((s) => s.tasks) ?? [];
    expect(tasks.length).toBe(3);
    expect(tasks.every((t) => t.status === "concluida")).toBe(true);
    // progressoDe devolve 0 sem tasks: sem estas três, "progresso 1" não discriminaria.
    expect(p.trabalhos[0]?.progresso).toBe(1);
  });
});
