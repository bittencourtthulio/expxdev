import { describe, it, expect } from "vitest";
import { interpretar, PADROES } from "./argumentos.js";

describe("contrato de linha de comando", () => {
  it("integração: uma linha completa devolve os três valores", () => {
    const r = interpretar(["--porta", "5050", "--dir", "./documentacao", "--no-open"]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.opcoes.porta).toBe(5050);
    expect(r.opcoes.dir).toBe("./documentacao");
    expect(r.opcoes.abrir).toBe(false);
  });

  it("funcional: sem flags, porta 4000 e dir ./docs", () => {
    const r = interpretar([]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.opcoes.porta).toBe(PADROES.porta);
    expect(r.opcoes.porta).toBe(4000);
    expect(r.opcoes.dir).toBe("./docs");
    expect(r.opcoes.abrir).toBe(true);
  });

  it("funcional: aceita --porta=N e valida faixa", () => {
    const igual = interpretar(["--porta=8080"]);
    expect(igual.ok && igual.opcoes.porta).toBe(8080);

    const invalida = interpretar(["--porta", "não-é-número"]);
    expect(invalida.ok).toBe(false);

    const fora = interpretar(["--porta", "99999"]);
    expect(fora.ok).toBe(false);
  });

  it("funcional: --dias-bloqueio muda o limite e --ajuda pede ajuda", () => {
    const r = interpretar(["--dias-bloqueio", "14"]);
    expect(r.ok && r.opcoes.diasBloqueio).toBe(14);

    const ajuda = interpretar(["--ajuda"]);
    expect(ajuda.ok && ajuda.opcoes.ajuda).toBe(true);

    const desconhecida = interpretar(["--flag-que-nao-existe"]);
    expect(desconhecida.ok).toBe(false);
  });
});
