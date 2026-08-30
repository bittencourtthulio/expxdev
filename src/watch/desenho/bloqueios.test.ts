import { describe, it, expect } from "vitest";
import { projetarVisao } from "../visao/projetar.js";
import { desenharBloqueios } from "./bloqueios.js";
import { criarPintor } from "./cor.js";
import { largura } from "./largura.js";

/**
 * T-02.06 — a seção de bloqueios.
 *
 * "É a informação que mais precisa de olho humano e a que mais passa
 * despercebida quando a execução é autônoma." A ordem entre seções (bloqueio
 * acima da árvore) é verificada em T-02.09, que é quem compõe.
 */

const raiz = (n: string): string => `fixtures/watch/${n}`;
const sem = criarPintor(false);

describe("seção de bloqueios", () => {
  it("integração: com bloqueio aberto devolve uma linha por bloqueio, com a task afetada", () => {
    const v = projetarVisao(raiz("com-bloqueio"));
    const linhas = desenharBloqueios(v, 80, sem, new Date("2026-08-30T12:00:00Z"));

    // um cabeçalho de seção + uma linha por bloqueio aberto
    const doBloqueio = linhas.filter((l) => l.includes("T-01.02"));
    expect(doBloqueio.length).toBe(1);
    expect(doBloqueio[0]).toContain("B-01");

    // o resolvido (B-02) não aparece
    expect(linhas.join("\n")).not.toContain("B-02");

    for (const l of linhas) expect(largura(l)).toBeLessThanOrEqual(80);
  });

  it("funcional: bloqueio aberto hoje diz 'hoje', não 'há 0 dias'", () => {
    const v = projetarVisao(raiz("com-bloqueio"));

    // o bloqueio foi aberto em 2026-08-29
    const mesmoDia = desenharBloqueios(v, 80, sem, new Date("2026-08-29T23:00:00Z"));
    expect(mesmoDia.join("\n")).toContain("hoje");
    expect(mesmoDia.join("\n")).not.toContain("0 dias");

    const doisDias = desenharBloqueios(v, 80, sem, new Date("2026-08-31T01:00:00Z"));
    expect(doisDias.join("\n")).toContain("2 dias");

    const umDia = desenharBloqueios(v, 80, sem, new Date("2026-08-30T01:00:00Z"));
    expect(umDia.join("\n")).toContain("1 dia");
    expect(umDia.join("\n")).not.toContain("1 dias");
  });

  it("funcional: sem bloqueio aberto devolve lista vazia", () => {
    const v = projetarVisao(raiz("com-estado"));
    expect(v.bloqueiosAbertos).toEqual([]);
    expect(desenharBloqueios(v, 80, sem, new Date())).toEqual([]);
  });

  it("funcional: em 60 colunas a descrição é cortada, não quebrada", () => {
    const v = projetarVisao(raiz("com-bloqueio"));
    const linhas = desenharBloqueios(v, 60, sem, new Date("2026-08-30T12:00:00Z"));
    for (const l of linhas) expect(largura(l)).toBeLessThanOrEqual(60);
    // mesma quantidade de linhas que em 80: cortar não cria linha nova
    expect(linhas.length).toBe(desenharBloqueios(v, 80, sem, new Date("2026-08-30T12:00:00Z")).length);
  });
});
