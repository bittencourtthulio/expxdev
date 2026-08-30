import { describe, it, expect } from "vitest";
import { lerEstadoExpx } from "./estado.js";

/**
 * T-01.05 — a leitura tolerante.
 *
 * A regra 1 do contrato diz que o `estado.json` é "derivado e descartável;
 * apagá-lo não pode quebrar nada". Este leitor é a implementação dessa frase:
 * qualquer defeito vira `null`, nunca exceção.
 */

const raiz = (nome: string): string => `fixtures/watch/${nome}`;

describe("leitura do estado.json", () => {
  it("integração: com-estado devolve o estado; inválido e versão futura devolvem null", () => {
    const bom = lerEstadoExpx(raiz("com-estado"));
    expect(bom).not.toBe(null);
    expect(bom?.trabalho).toBe("exportacao-csv");
    expect(bom?.tasks_concluidas).toBe(1);
    expect(bom?.tasks_total).toBe(3);

    // JSON quebrado: cai para null, e quem chama vai para o plano (D-12).
    expect(lerEstadoExpx(raiz("estado-invalido"))).toBe(null);

    // expx_estado: 2 — versão futura é tratada como inválida (D-12), mesma
    // política que o expx-schema aplica em `schema-futuro`.
    expect(lerEstadoExpx(raiz("estado-versao-futura"))).toBe(null);
  });

  it("funcional: caminho inexistente devolve null em vez de lançar", () => {
    expect(() => lerEstadoExpx(raiz("sem-trabalho"))).not.toThrow();
    expect(lerEstadoExpx(raiz("sem-trabalho"))).toBe(null);
    expect(lerEstadoExpx("/caminho/que/nao/existe/em/lugar/nenhum")).toBe(null);
  });

  it("funcional: legado traz raio e orçamento; fora do legado eles são null", () => {
    const legado = lerEstadoExpx(raiz("legado-raio-alto"));
    expect(legado?.raio).toBe("alto");
    expect(legado?.orcamento_arquivos).toBe("2/3");
    expect(legado?.orcamento_linhas).toBe("31/40");
    expect(legado?.pr_estado).toBe("aberto");

    const normal = lerEstadoExpx(raiz("com-estado"));
    expect(normal?.raio).toBe(null);
    expect(normal?.orcamento_arquivos).toBe(null);
  });
});
