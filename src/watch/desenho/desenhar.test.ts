import { describe, it, expect } from "vitest";
import { projetarVisao } from "../visao/projetar.js";
import { desenhar } from "./desenhar.js";
import { largura } from "./largura.js";

/**
 * T-02.09 — o rodapé e a composição das cinco seções.
 *
 * As fixtures 9 e 10 da especificação (terminal de 60 colunas, saída
 * redirecionada) são MODOS DE TESTE, não diretórios: são os parâmetros
 * `colunas` e `cor` que esta função recebe.
 */

const raiz = (n: string): string => `fixtures/watch/${n}`;

const NOVE = [
  "com-estado",
  "legado-raio-alto",
  "estado-invalido",
  "estado-versao-futura",
  "com-bloqueio",
  "concluido",
  "sem-trabalho",
  "sem-rastro",
  "varios-trabalhos",
];

const AGORA = new Date("2026-08-30T12:00:00Z");

describe("composição do painel", () => {
  it("integração: as nove fixtures desenham em 80 e em 60 sem exceder a largura", () => {
    for (const f of NOVE) {
      for (const colunas of [80, 60]) {
        const v = projetarVisao(raiz(f), {}, AGORA);
        const linhas = desenhar(v, { colunas, cor: false, agora: AGORA });
        expect(linhas.length, `${f}: nenhuma linha`).toBeGreaterThan(0);
        for (const l of linhas) {
          expect(largura(l), `${f}@${String(colunas)}: "${l}"`).toBeLessThanOrEqual(colunas);
        }
      }
    }
  });

  it("integração: com bloqueio aberto, a seção de bloqueios vem antes da árvore", () => {
    const v = projetarVisao(raiz("com-bloqueio"), {}, AGORA);
    const linhas = desenhar(v, { colunas: 80, cor: false, agora: AGORA });

    const iBloqueio = linhas.findIndex((l) => l.includes("B-01"));
    const iArvore = linhas.findIndex((l) => l.includes("sprint-01"));
    expect(iBloqueio).toBeGreaterThanOrEqual(0);
    expect(iArvore).toBeGreaterThanOrEqual(0);
    expect(iBloqueio).toBeLessThan(iArvore);
  });

  it("funcional: o rodapé conta só as violações posteriores à subida do watch", () => {
    // O rastro de com-estado tem UM regra_violada, em 2026-08-29T14:25:00Z.
    // Subindo depois disso, ele não conta; subindo antes, conta. É a metade da
    // D-07 que um contador do arquivo inteiro erraria.
    const depois = projetarVisao(raiz("com-estado"), {
      subiuEm: new Date("2026-08-29T14:30:00Z"),
    });
    expect(depois.violacoesAviso).toBe(0);

    const antes = projetarVisao(raiz("com-estado"), {
      subiuEm: new Date("2026-08-29T00:00:00Z"),
    });
    expect(antes.violacoesAviso).toBe(1);

    const texto = desenhar(antes, { colunas: 80, cor: false, agora: AGORA }).join("\n");
    expect(texto).toContain("1 violacao");
  });

  it("funcional: o rodapé mostra o tempo desde o último evento", () => {
    const v = projetarVisao(raiz("com-estado"), {}, AGORA);
    // último evento: 2026-08-29T14:32:00Z; agora: 2026-08-30T12:00:00Z
    const texto = desenhar(v, { colunas: 80, cor: false, agora: AGORA }).join("\n");
    expect(texto).toMatch(/ultimo evento h[aá] /);

    // sem rastro, não há o que contar
    const semRastro = projetarVisao(raiz("sem-rastro"), {}, AGORA);
    const t2 = desenhar(semRastro, { colunas: 80, cor: false, agora: AGORA }).join("\n");
    expect(t2).not.toContain("ultimo evento");
  });

  it("funcional: com cor desligada nenhuma linha contém escape ANSI", () => {
    const ESC = "\u001b";
    for (const f of NOVE) {
      const v = projetarVisao(raiz(f), {}, AGORA);
      for (const l of desenhar(v, { colunas: 80, cor: false, agora: AGORA })) {
        expect(l.includes(ESC), `${f}: escape vazou -> ${JSON.stringify(l)}`).toBe(false);
      }
    }
  });

  it("funcional: com cor ligada o escape aparece, e a largura visível não muda", () => {
    const v = projetarVisao(raiz("com-bloqueio"), {}, AGORA);
    const comCor = desenhar(v, { colunas: 80, cor: true, agora: AGORA });
    const semCor = desenhar(v, { colunas: 80, cor: false, agora: AGORA });

    expect(comCor.join("").includes("\u001b")).toBe(true);
    expect(comCor.length).toBe(semCor.length);

    // remover os escapes tem de devolver exatamente o texto sem cor: é a
    // prova de que a cor não come nem acrescenta coluna
    const limpo = comCor.map((l) => l.replace(/\u001b\[[0-9;]*m/g, ""));
    expect(limpo).toEqual(semCor);
  });
});
