import { describe, it, expect } from "vitest";
import { projetarVisao } from "../visao/projetar.js";
import { blocoTrabalho } from "./painel.js";

/**
 * Marca de divergência no desenho padrão do watch (OC-2026-002 / achado ALTA do QA).
 *
 * `--todos` (`lista.ts`) e a UI web já marcavam a divergência; o desenho
 * padrão (`blocoTrabalho`, a tela que aparece ao rodar `expx watch` sem
 * flags) ficara de fora — o QA apontou isso como achado ALTA porque contraria
 * a definição de pronto ("o watch de terminal exibe o alerta").
 */
const raiz = (n: string): string => `fixtures/watch/${n}`;

describe("marca de divergencia no bloco de trabalho", () => {
  it("funcional: trabalho divergente mostra DIVERGENTE no titulo", () => {
    const v = projetarVisao(raiz("com-divergencia"));
    const t = v.frota.find((f) => f.trabalho.trabalho_id === "divergente");
    expect(t).toBeDefined();
    expect(t?.trabalho.divergente).toBe(true);

    const linhas = blocoTrabalho(t!, 80, (s) => s, new Date("2026-08-29T12:00:00Z"));
    expect(linhas[0]).toContain("DIVERGENTE");
  });

  it("funcional: trabalho consistente nao mostra DIVERGENTE", () => {
    const v = projetarVisao(raiz("varios-trabalhos"));
    const t = v.frota.find((f) => f.trabalho.trabalho_id === "em-andamento");
    expect(t).toBeDefined();
    expect(t?.trabalho.divergente).toBe(false);

    const linhas = blocoTrabalho(t!, 80, (s) => s, new Date("2026-08-29T12:00:00Z"));
    expect(linhas[0]).not.toContain("DIVERGENTE");
  });
});
