import { describe, it, expect } from "vitest";
import { projetarVisao } from "../visao/projetar.js";
import { desenharArvore } from "./arvore.js";
import { criarPintor } from "./cor.js";
import { largura } from "./largura.js";

/**
 * T-02.07 — a árvore: sprints, fases e tasks.
 *
 * Todos os campos que a árvore precisa já vêm do parser do painel:
 * `status`, `depende_de`, `paralelizavel` por task, e `paralela_com` por fase
 * (base/schema-v1-e-kinds.md).
 */

const raiz = (n: string): string => `fixtures/watch/${n}`;
const sem = criarPintor(false);

describe("árvore do trabalho", () => {
  it("integração: uma linha por sprint, por fase e por task", () => {
    const v = projetarVisao(raiz("com-estado"));
    const linhas = desenharArvore(v, 80, sem);

    // a fixture tem 1 sprint, 2 fases, 3 tasks.
    // Casamos o INÍCIO da linha da fase: "F-01.1" também aparece dentro do
    // `paralela_com` da linha de F-01.2, e isso é correto — a busca é que
    // precisa ser precisa.
    expect(linhas.filter((l) => l.includes("sprint-01")).length).toBe(1);
    expect(linhas.filter((l) => /^\s+\[.\] F-01\.1 /.test(l)).length).toBe(1);
    expect(linhas.filter((l) => /^\s+\[.\] F-01\.2 /.test(l)).length).toBe(1);
    // Mesmo cuidado nas tasks: "T-01.01" aparece também no `depende_de` de
    // T-01.02. A linha PRÓPRIA da task é a que começa com o marcador.
    for (const t of ["T-01.01", "T-01.02", "T-01.03"]) {
      const propria = new RegExp(`^\\s+\\[.\\] ${t.replace(".", "\\.")} `);
      expect(linhas.filter((l) => propria.test(l)).length, `${t} deveria ter uma linha`).toBe(1);
    }

    for (const l of linhas) expect(largura(l)).toBeLessThanOrEqual(80);
  });

  it("funcional: sprint concluido e task concluida recebem o marcador do seu nível", () => {
    // os dois vocabulários não são intercambiáveis: `concluido` é de
    // sprint/fase, `concluida` é de task (base/schema-v1-e-kinds.md, risco 4)
    const v = projetarVisao(raiz("concluido"));
    const linhas = desenharArvore(v, 80, sem);

    const daSprint = linhas.find((l) => l.includes("sprint-01"));
    const daTask = linhas.find((l) => l.includes("T-01.01"));
    expect(daSprint).toBeDefined();
    expect(daTask).toBeDefined();
    // ambos marcados como feitos, cada um pelo seu enum
    expect(daSprint).toContain("[x]");
    expect(daTask).toContain("[x]");
  });

  it("funcional: a task em andamento é a única destacada", () => {
    const v = projetarVisao(raiz("com-estado"));
    const linhas = desenharArvore(v, 80, sem);

    const destacadas = linhas.filter((l) => l.includes("<"));
    expect(destacadas.length).toBe(1);
    expect(destacadas[0]).toContain("T-01.02");
  });

  it("funcional: dependência e paralelismo aparecem de forma compacta", () => {
    const v = projetarVisao(raiz("com-estado"));
    const texto = desenharArvore(v, 80, sem).join("\n");

    // T-01.02 depende de T-01.01
    expect(texto).toMatch(/T-01\.02.*←.*T-01\.01/);
    // T-01.01 é paralelizável
    expect(texto).toMatch(/T-01\.01.*\|\|/);
  });

  it("funcional: task bloqueada é marcada", () => {
    const v = projetarVisao(raiz("com-bloqueio"));
    const linha = desenharArvore(v, 80, sem).find((l) => l.includes("T-01.02"));
    expect(linha).toContain("[!]");
  });

  it("funcional: em 60 colunas nenhuma linha excede e nenhuma some", () => {
    const v = projetarVisao(raiz("com-estado"));
    const largo = desenharArvore(v, 80, sem);
    const estreito = desenharArvore(v, 60, sem);
    expect(estreito.length).toBe(largo.length);
    for (const l of estreito) expect(largura(l)).toBeLessThanOrEqual(60);
  });

  it("funcional: sem trabalho devolve lista vazia", () => {
    expect(desenharArvore(projetarVisao(raiz("sem-trabalho")), 80, sem)).toEqual([]);
  });
});
