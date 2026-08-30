import { describe, it, expect } from "vitest";
import { barra, barraIndeterminada, decorrido, papelDaBarra, percentual } from "./barra.js";
import { largura } from "./largura.js";

/**
 * As barras: o vocabulário visual do painel.
 *
 * Duas regras aqui não são estéticas, são de honestidade — uma barra que
 * mente é pior que nenhuma barra, porque a pessoa decide olhar ou não olhar
 * a execução com base nela.
 */

describe("barra de progresso", () => {
  it("integração: a barra ocupa exatamente a largura pedida, em qualquer proporção", () => {
    for (const total of [0, 1, 3, 7, 10, 100]) {
      for (let feitas = 0; feitas <= total; feitas++) {
        expect(largura(barra(feitas, total, 16)), `${String(feitas)}/${String(total)}`).toBe(16);
      }
    }
  });

  it("funcional: só fica cheia quando tudo terminou", () => {
    // Arredondar 9/10 para cheio faz a pessoa achar que acabou e parar de
    // olhar — justamente quando falta a última task.
    expect(barra(9, 10, 10)).toContain("░");
    expect(barra(10, 10, 10)).toBe("█".repeat(10));
    expect(barra(99, 100, 20)).toContain("░");
  });

  it("funcional: qualquer progresso acende alguma coisa", () => {
    // 1 de 100 em 10 colunas arredondaria para zero: a barra ficaria vazia e
    // indistinguível de "nem começou".
    expect(barra(1, 100, 10)).not.toBe("░".repeat(10));
    expect(barra(0, 100, 10)).toBe("░".repeat(10));
  });

  it("funcional: total zero não divide por zero nem estoura", () => {
    expect(barra(0, 0, 8)).toBe("░".repeat(8));
    expect(percentual(0, 0)).toBe("0%");
  });

  it("funcional: a barra de atividade anda com o relógio", () => {
    const a = barraIndeterminada(12, new Date(1000));
    const b = barraIndeterminada(12, new Date(1000 + 400 * 3));
    expect(largura(a)).toBe(12);
    expect(a).not.toBe(b); // é o movimento que diz "isto está vivo"
  });

  it("funcional: o papel da barra segue o significado, não a cor", () => {
    expect(papelDaBarra(2, 2)).toBe("sucesso");
    expect(papelDaBarra(1, 2)).toBe("atencao");
    expect(papelDaBarra(0, 2)).toBe("apagado");
  });
});

describe("tempo decorrido", () => {
  it("funcional: a escala muda com a ordem de grandeza", () => {
    expect(decorrido(12_000)).toBe("12s");
    expect(decorrido(138_000)).toBe("2m18s");
    expect(decorrido(3_840_000)).toBe("1h04");
    expect(decorrido(3 * 86_400_000)).toBe("3d");
  });

  it("funcional: tempo negativo não vira texto sem sentido", () => {
    // Relógio do rastro adiantado em relação ao da máquina acontece, e
    // "-3s" numa tela de acompanhamento só assusta.
    expect(decorrido(-5000)).toBe("0s");
  });
});
