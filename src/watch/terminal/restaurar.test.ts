import { describe, it, expect } from "vitest";
import { criarRestaurador, CAMINHOS_DE_SAIDA } from "./restaurar.js";

/**
 * T-03.04 — devolver o terminal ao estado anterior.
 *
 * "Sai com a tecla de interrupção, restaurando o terminal ao estado anterior.
 * Nunca deixa o terminal quebrado." O precedente do painel cobre só SIGINT e
 * SIGTERM (`src/cli/principal.ts`); aqui são quatro caminhos, porque uma
 * exceção não capturada também deixaria o cursor escondido (decisão D-21).
 */

describe("restauração do terminal", () => {
  it("integração: cada um dos quatro caminhos de saída executa a restauração", () => {
    for (const caminho of CAMINHOS_DE_SAIDA) {
      const escrito: string[] = [];
      let saiuCom: number | undefined;
      const r = criarRestaurador({
        escrever: (t) => escrito.push(t),
        sair: (c) => {
          saiuCom = c;
        },
      });

      r.registrar();
      r.disparar(caminho);

      expect(escrito.join(""), `${caminho} não restaurou`).toContain("\u001b[?25h");
      // SIGINT e SIGTERM encerram; os outros dois só restauram
      if (caminho === "SIGINT" || caminho === "SIGTERM") {
        expect(saiuCom, `${caminho} deveria encerrar`).toBeTypeOf("number");
      }
      r.desregistrar();
    }
  });

  it("funcional: restauração já executada não roda de novo", () => {
    const escrito: string[] = [];
    const r = criarRestaurador({
      escrever: (t) => escrito.push(t),
      sair: () => undefined,
    });

    r.registrar();
    r.disparar("SIGINT");
    const depoisDoPrimeiro = escrito.length;

    r.disparar("SIGTERM");
    r.disparar("exit");
    expect(escrito.length, "restaurou mais de uma vez").toBe(depoisDoPrimeiro);
    r.desregistrar();
  });

  it("funcional: mostrar o cursor é o mínimo que a restauração faz", () => {
    const escrito: string[] = [];
    const r = criarRestaurador({
      escrever: (t) => escrito.push(t),
      sair: () => undefined,
    });

    r.registrar();
    r.esconderCursor();
    expect(escrito.join("")).toContain("\u001b[?25l");

    r.disparar("exit");
    expect(escrito.join("")).toContain("\u001b[?25h");
    r.desregistrar();
  });

  it("funcional: registrar e desregistrar não deixa ouvinte para trás", () => {
    const antes = process.listenerCount("SIGINT");
    const r = criarRestaurador({ escrever: () => undefined, sair: () => undefined });

    r.registrar();
    expect(process.listenerCount("SIGINT")).toBe(antes + 1);

    r.desregistrar();
    expect(process.listenerCount("SIGINT")).toBe(antes);
  });
});
