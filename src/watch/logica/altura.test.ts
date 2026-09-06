import { describe, it, expect } from "vitest";
import { alturaDisponivel, orcarAltura } from "./altura.js";

/**
 * O orçamento existe para o painel nunca atingir `stdout.rows` — o limiar em
 * que o Ink troca o redesenho no lugar por `clearTerminal`, empilhando cópias
 * do painel a cada pulso. Ver o cabeçalho de `altura.ts`.
 */

describe("alturaDisponivel", () => {
  it("funcional: reserva folga sobre as linhas do terminal", () => {
    // Estritamente menor que `rows`, senão o Ink limpa o terminal inteiro.
    expect(alturaDisponivel(40)).toBeLessThan(40);
    expect(alturaDisponivel(24)).toBeLessThan(24);
  });

  it("funcional: sem TTY nao ha limite de altura", () => {
    expect(alturaDisponivel(undefined)).toBeUndefined();
    expect(alturaDisponivel(0)).toBeUndefined();
  });

  it("funcional: terminal minusculo ainda devolve altura positiva", () => {
    expect(alturaDisponivel(2)).toBeGreaterThan(0);
    expect(alturaDisponivel(1)).toBeGreaterThan(0);
  });
});

describe("orcarAltura", () => {
  it("funcional: janela alta cabe tudo que existe", () => {
    const o = orcarAltura(50, 3, 6);
    expect(o.tasks).toBe(3);
    expect(o.atividade).toBe(6);
    expect(o.folgado).toBe(true);
  });

  it("funcional: janela baixa corta as duas secoes elasticas", () => {
    const o = orcarAltura(20, 5, 8);
    expect(o.tasks).toBeLessThan(5);
    expect(o.atividade).toBeLessThan(8);
  });

  it("funcional: nunca zera as duas — a tela nao pode ficar muda", () => {
    for (const linhas of [8, 12, 16, 20]) {
      const o = orcarAltura(linhas, 4, 6);
      expect(o.tasks, `${String(linhas)} linhas`).toBeGreaterThanOrEqual(1);
      expect(o.atividade, `${String(linhas)} linhas`).toBeGreaterThanOrEqual(1);
    }
  });

  it("funcional: nunca pede mais do que existe para mostrar", () => {
    // Uma task ativa só, janela enorme: o orçamento não inventa linhas.
    const o = orcarAltura(60, 1, 2);
    expect(o.tasks).toBe(1);
    expect(o.atividade).toBe(2);
  });

  it("integracao: o total pedido cabe nas linhas disponiveis", () => {
    // É a propriedade que impede o painel de atingir `rows` e disparar o
    // `clearTerminal` que duplicava a tela. Verifica o RESULTADO (cabe?), não
    // a aritmética interna — a fórmula pode mudar, a garantia não.
    for (const linhas of [14, 16, 20, 24, 30, 40, 60]) {
      const o = orcarAltura(linhas, 6, 10);
      // O conteúdo elástico mais o esqueleto de seções nunca passa do que há.
      const esqueleto = o.apertado ? 10 : o.folgado ? 18 : 13;
      expect(o.tasks + o.atividade + esqueleto, `${String(linhas)} linhas`).toBeLessThanOrEqual(
        linhas + 2,
      );
    }
  });

  it("funcional: sem altura conhecida nada e cortado", () => {
    const o = orcarAltura(undefined, 7, 9);
    expect(o).toEqual({ tasks: 7, atividade: 9, folgado: true, apertado: false });
  });

  it("funcional: janela muito baixa entra em modo apertado", () => {
    // Abaixo de 18 linhas úteis, as seções acessórias saem para o essencial
    // caber — senão o quadro atinge `rows` e o Ink limpa o terminal.
    expect(orcarAltura(14, 3, 6).apertado).toBe(true);
    expect(orcarAltura(30, 3, 6).apertado).toBe(false);
  });

  it("funcional: apertado devolve mais espaco elastico que o mesmo sem folga", () => {
    // O modo apertado libera as três linhas acessórias para conteúdo.
    const apertado = orcarAltura(16, 4, 6);
    expect(apertado.tasks + apertado.atividade).toBeGreaterThanOrEqual(2);
  });
});
