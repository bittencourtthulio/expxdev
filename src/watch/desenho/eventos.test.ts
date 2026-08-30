import { describe, it, expect } from "vitest";
import { projetarVisao } from "../visao/projetar.js";
import { desenharEventos } from "./eventos.js";
import { criarPintor } from "./cor.js";
import { largura } from "./largura.js";

/**
 * T-02.08 — os eventos recentes.
 *
 * "com agente, quando houver: é o que mostra quem fez o quê". No contrato o
 * `agente` NUNCA é null — `principal` é o valor quando não há subagente, e
 * "foi o principal" é informação, não ausência.
 */

const raiz = (n: string): string => `fixtures/watch/${n}`;
const sem = criarPintor(false);

describe("eventos recentes", () => {
  it("integração: sem-rastro devolve lista vazia; com-estado devolve uma linha por evento", () => {
    const semRastro = projetarVisao(raiz("sem-rastro"));
    expect(semRastro.eventos).toEqual([]);
    expect(desenharEventos(semRastro, 80, sem)).toEqual([]);

    const v = projetarVisao(raiz("com-estado"));
    const linhas = desenharEventos(v, 80, sem);
    // um cabeçalho de seção + uma linha por evento
    expect(linhas.length).toBe(v.eventos.length + 1);
    for (const l of linhas) expect(largura(l)).toBeLessThanOrEqual(80);
  });

  it("funcional: a mais recente vem no topo, e cada linha traz o agente", () => {
    const v = projetarVisao(raiz("com-estado"));
    const linhas = desenharEventos(v, 80, sem);
    const doEvento = linhas.slice(1);

    // o rastro da fixture termina em task_iniciada de T-01.02
    expect(doEvento[0]).toContain("task_iniciada");
    expect(doEvento[0]).toContain("T-01.02");

    // agente em toda linha: no contrato ele nunca é null
    for (const l of doEvento) expect(l).toContain("principal");

    // e o vocabulário que a especificação cita nominalmente aparece
    const texto = doEvento.join("\n");
    expect(texto).toContain("suite_executada");
    expect(texto).toContain("arquivo_alterado");
    expect(texto).toContain("regra_violada");
  });

  it("funcional: respeita o limite de linhas e corta em 60 colunas", () => {
    const v = projetarVisao(raiz("com-estado"), { linhasRastro: 3 });
    const linhas = desenharEventos(v, 60, sem);
    expect(linhas.length).toBe(4); // cabeçalho + 3
    for (const l of linhas) expect(largura(l)).toBeLessThanOrEqual(60);
  });

  it("funcional: sem trabalho não há seção de eventos", () => {
    expect(desenharEventos(projetarVisao(raiz("sem-trabalho")), 80, sem)).toEqual([]);
  });
});
