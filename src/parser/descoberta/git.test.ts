import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { rmSync } from "node:fs";
import { descobrirTrabalhos } from "./trabalhos.js";
import { descobrirEmBranches, branchAtiva } from "./git.js";
import { criarRepoMultiBranch } from "../../teste/repo-multi-branch.js";

/**
 * Descoberta multi-branch (OC-2026-002 / T-01.04, T-01.05).
 *
 * A varredura de filesystem (`varredura.ts`) só enxerga o checkout ativo. No
 * ExpxCMS cada feature vive na sua própria branch (padrão `mergex`), nunca
 * mesclada — o painel precisa ler `ORQUESTRADOR.md` de qualquer branch local
 * via `git show`, sem checkout, para não deixar essas features invisíveis.
 */

// Um único repositório para os 3 testes que o compartilham (achado MÉDIA do
// QA: cada `criarRepoMultiBranch()` roda ~10 processos `git` síncronos; 3
// chamadas por arquivo estouravam o timeout padrão sob concorrência).
let raiz: string;

beforeAll(() => {
  raiz = criarRepoMultiBranch();
}, 30000); // ~10 processos git síncronos; sob concorrência passa do hookTimeout padrão de 10s

afterAll(() => {
  rmSync(raiz, { recursive: true, force: true });
});

describe("descoberta multi-branch via git", () => {
  it("regressao: com checkout em main, feature-x (so em feature/x) e encontrada", () => {
    const { trabalhos } = descobrirTrabalhos(raiz);
    // Antes de T-01.05 este teste falha: a varredura de filesystem não vê
    // nada fora do checkout ativo (main), que não tem docs/feature-x.
    expect(trabalhos.map((t) => t.trabalho_id)).toContain("feature-x");
  });

  it("integracao: o trabalho encontrado via git carrega a branch de origem", () => {
    const { trabalhos } = descobrirTrabalhos(raiz);
    const featureX = trabalhos.find((t) => t.trabalho_id === "feature-x");
    expect(featureX).toBeDefined();
    expect(featureX?.branch).toBe("feature/x");
  });

  it("funcional: branches encadeadas com o mesmo ORQUESTRADOR.md produzem um unico trabalho", () => {
    const { trabalhos } = descobrirTrabalhos(raiz);
    const featuresY = trabalhos.filter((t) => t.trabalho_id === "feature-y");
    // feature/y e feature/y-continuacao tem o mesmo docs/feature-y/ORQUESTRADOR.md
    // byte a byte — nao pode aparecer duas vezes na lista.
    expect(featuresY).toHaveLength(1);
  });

  it("regressao: uma subpasta dentro de um repositorio git maior nunca le as branches desse repositorio", () => {
    // fixtures/ vive DENTRO do checkout do proprio Expx: se a checagem de
    // "raiz == topo do repo" falhar, isto lê as branches reais do
    // desenvolvedor rodando a suíte — um vazamento sério, não só um bug.
    expect(branchAtiva("fixtures/projeto-ok")).toBeNull();
    const { aceitos, rejeicoes } = descobrirEmBranches("fixtures/projeto-ok", null);
    expect(aceitos).toHaveLength(0);
    expect(rejeicoes).toHaveLength(0);
  });
});
