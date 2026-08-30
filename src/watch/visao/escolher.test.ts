import { describe, it, expect } from "vitest";
import { montarProjeto } from "../../parser/projeto/montar.js";
import { lerEstadoExpx } from "../fontes/estado.js";
import { escolherTrabalho, abertos } from "./escolher.js";

/**
 * T-02.03 — qual é "o trabalho atual".
 *
 * O `estado.json` responde com o campo `trabalho`. Sem ele, nenhum campo do
 * plano marca um trabalho como o atual (lacuna L-01), e a decisão D-05 define
 * a derivação: o único `em_andamento`; havendo empate, o `atualizado_em` mais
 * recente; nenhum, a lista.
 */

const raiz = (n: string): string => `fixtures/watch/${n}`;

function escolherEm(fixture: string, pedido?: string): string | null {
  const projeto = montarProjeto(raiz(fixture));
  const estado = lerEstadoExpx(raiz(fixture));
  const t = escolherTrabalho(projeto.trabalhos, estado, pedido);
  return t?.trabalho_id ?? null;
}

describe("escolha do trabalho atual", () => {
  it("integração: com estado válido vem do campo trabalho; sem ele, do plano", () => {
    // com-estado: o estado.json aponta exportacao-csv
    expect(escolherEm("com-estado")).toBe("exportacao-csv");

    // estado-invalido: o estado.json não parseia, então cai para o plano —
    // e o único trabalho lá é em_andamento
    expect(escolherEm("estado-invalido")).toBe("exportacao-csv");

    // estado-versao-futura: versão 2 é tratada como inválida (D-12) e não há
    // plano nenhum nessa fixture, então não há trabalho a seguir
    expect(escolherEm("estado-versao-futura")).toBe(null);
  });

  it("funcional: com vários em_andamento e sem estado, vence o atualizado_em mais recente", () => {
    // varios-trabalhos não tem .expx/estado.json: é o caminho derivado puro
    const projeto = montarProjeto(raiz("varios-trabalhos"));
    const escolhido = escolherTrabalho(projeto.trabalhos, null);
    expect(escolhido?.trabalho_id).toBe("em-andamento");

    // e se houver empate de status, a data desempata
    const doisEmAndamento = projeto.trabalhos
      .filter((t) => t.trabalho_id !== "concluido")
      .map((t) => ({ ...t, status: "em_andamento" as const }));
    const vencedor = escolherTrabalho(doisEmAndamento, null);
    // em-andamento tem atualizado_em 2026-08-29, o mais recente dos três
    expect(vencedor?.trabalho_id).toBe("em-andamento");
  });

  it("funcional: id pedido explicitamente vence as duas fontes", () => {
    // `expx watch <trabalho_id>` não olha o estado.json nem a derivação
    expect(escolherEm("varios-trabalhos", "bloqueado")).toBe("bloqueado");
    expect(escolherEm("varios-trabalhos", "concluido")).toBe("concluido");
    // id que não existe: nada a seguir, e sem lançar
    expect(escolherEm("varios-trabalhos", "nao-existe")).toBe(null);
  });

  it("funcional: sem trabalho nenhum devolve null em vez de lançar", () => {
    expect(() => escolherEm("sem-trabalho")).not.toThrow();
    expect(escolherEm("sem-trabalho")).toBe(null);
  });

  it("funcional: projeto cujo único trabalho está concluído ainda mostra esse trabalho", () => {
    // Regressão: a primeira versão devolvia null aqui, porque `concluido` não
    // é "aberto" — e o watch abria com a tela em branco num projeto que acabou
    // de entregar. "Nenhum trabalho aberto" (D-19) é sobre a LISTA, não sobre
    // esconder o trabalho que existe.
    expect(escolherEm("concluido")).toBe("exportacao-csv");
  });

  it("funcional: abertos exclui concluido e mantém os outros três status (D-16)", () => {
    const projeto = montarProjeto(raiz("varios-trabalhos"));
    const ids = abertos(projeto.trabalhos)
      .map((t) => t.trabalho_id)
      .sort();
    expect(ids).toEqual(["bloqueado", "em-andamento", "nao-iniciado"]);
  });
});
