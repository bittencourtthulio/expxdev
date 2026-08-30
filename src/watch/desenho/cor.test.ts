import { describe, it, expect } from "vitest";
import { corAtiva, criarPintor, PAPEIS } from "./cor.js";

/**
 * T-02.02 — cor só quando a saída é terminal.
 *
 * A regra da especificação é sobre `stdout.isTTY` SOZINHO. Reusar o
 * `ehInterativo()` do CLI (que exige stdin E stdout) seria errado: em
 * `expx watch | less` o stdin continua TTY e a cor sujaria o arquivo — que é
 * exatamente o que a especificação proíbe (base/bibliotecas-de-terminal.md,
 * risco 2).
 */

const ESC = "\u001b";

describe("cor", () => {
  it("integração: com cor desligada, pintar devolve o texto idêntico à entrada nos seis papéis", () => {
    const pintar = criarPintor(false);
    for (const papel of PAPEIS) {
      expect(pintar("texto", papel), `papel ${papel} vazou cor`).toBe("texto");
      expect(pintar("texto", papel).includes(ESC)).toBe(false);
    }
  });

  it("funcional: NO_COLOR definido desliga a cor mesmo com stdout TTY", () => {
    expect(corAtiva({ tty: true, noColor: false })).toBe(true);
    expect(corAtiva({ tty: true, noColor: true })).toBe(false);
    // saída redirecionada: sem cor, com ou sem NO_COLOR
    expect(corAtiva({ tty: false, noColor: false })).toBe(false);
    expect(corAtiva({ tty: false, noColor: true })).toBe(false);
  });

  it("funcional: com cor ligada, o texto vem delimitado por escape e reset", () => {
    const pintar = criarPintor(true);
    const pintado = pintar("ok", "sucesso");
    expect(pintado.startsWith(ESC)).toBe(true);
    expect(pintado.endsWith(`${ESC}[0m`)).toBe(true);
    expect(pintado).toContain("ok");
    // o texto original continua recuperável ao remover os escapes
    expect(pintado.replace(/\u001b\[[0-9;]*m/g, "")).toBe("ok");
  });
});
