import { describe, it, expect } from "vitest";
import { hero, pintar, secao, sucesso, temCor } from "./visual.js";
import { podeNavegar } from "./perguntar.js";
import { Readable, Writable } from "node:stream";

/** Um par de streams com TTY controlável, para testar a decisão sem terminal real. */
function streams(entrada: boolean, saida: boolean): [Readable & { isTTY?: boolean }, Writable & { isTTY?: boolean }] {
  const e = Object.assign(new Readable({ read() {} }), { isTTY: entrada });
  const s = Object.assign(new Writable({ write(_c, _e, cb) { cb(); } }), { isTTY: saida });
  return [e, s];
}

const ANSI = /\[[0-9;]*m/;

describe("cor no terminal", () => {
  it("integração: a cor liga com TTY e desliga em pipe, NO_COLOR e TERM=dumb", () => {
    expect(temCor({}, true)).toBe(true);
    expect(temCor({}, false)).toBe(false);
    expect(temCor({ NO_COLOR: "1" }, true)).toBe(false);
    expect(temCor({ TERM: "dumb" }, true)).toBe(false);
    expect(temCor({ FORCE_COLOR: "1" }, false)).toBe(true);
  });

  it("funcional: sem cor, o texto sai cru — nenhum codigo ANSI vaza para o pipe", () => {
    expect(pintar("sprintx", "azul", false)).toBe("sprintx");
    expect(ANSI.test(hero("0.4.0", false))).toBe(false);
    expect(ANSI.test(secao("titulo", false))).toBe(false);
    expect(ANSI.test(sucesso(["pronto"], false))).toBe(false);
  });

  it("funcional: com cor, o texto continua legível por baixo do ANSI", () => {
    // Cor é enfeite, nunca informação: tirar o ANSI não pode perder conteúdo.
    const cru = hero("0.4.0", true).replace(new RegExp(ANSI, "g"), "");
    expect(cru).toContain("dev");
    expect(cru).toContain("v0.4.0");
    expect(cru).toContain("o metodo Expx no seu projeto");
    expect(ANSI.test(hero("0.4.0", true))).toBe(true);
  });

  it("funcional: o hero mostra a versao recebida", () => {
    expect(hero("9.9.9", false)).toContain("v9.9.9");
  });
});

describe("decisao de navegar", () => {
  it("integração: navega so com os dois lados do terminal", () => {
    const [e1, s1] = streams(true, true);
    expect(podeNavegar(e1, s1, {})).toBe(true);

    // stdin redirecionado: ha tela, nao ha teclado.
    const [e2, s2] = streams(false, true);
    expect(podeNavegar(e2, s2, {})).toBe(false);

    const [e3, s3] = streams(true, false);
    expect(podeNavegar(e3, s3, {})).toBe(false);
  });

  it("funcional: TERM=dumb desliga a navegacao mesmo com TTY dos dois lados", () => {
    const [e, s] = streams(true, true);
    expect(podeNavegar(e, s, { TERM: "dumb" })).toBe(false);
  });

  it("funcional: a escotilha EXPX_SEM_NAVEGACAO forca o caminho por numero", () => {
    const [e, s] = streams(true, true);
    expect(podeNavegar(e, s, { EXPX_SEM_NAVEGACAO: "1" })).toBe(false);
  });
});
