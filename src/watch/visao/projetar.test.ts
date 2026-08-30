import { describe, it, expect } from "vitest";
import { projetarVisao } from "./projetar.js";

/**
 * T-02.04 — a visão que o desenho consome.
 *
 * Reúne as três fontes: o `estado.json` (cabeçalho), o plano lido pelo parser
 * do painel (árvore e bloqueios) e o rastro (eventos e violações).
 */

const raiz = (n: string): string => `fixtures/watch/${n}`;

/** As nove fixtures de disco, da tabela nominal de sprint-01/sprint.md. */
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

describe("projeção da visão", () => {
  it("integração: as nove fixtures projetam sem lançar, e degradado cobre os três defeitos", () => {
    for (const f of NOVE) {
      expect(() => projetarVisao(raiz(f)), `${f} lançou`).not.toThrow();
    }

    // `degradado` NÃO é "o arquivo não existe": D-12 manda tratar versão ≠ 1 e
    // JSON inválido do mesmo jeito. Uma implementação com `existsSync` passaria
    // num teste que só olhasse ausência — e violaria a decisão.
    const comEstado = new Set(["com-estado", "legado-raio-alto", "sem-rastro", "varios-trabalhos"]);
    for (const f of NOVE) {
      const v = projetarVisao(raiz(f));
      expect(v.degradado, `${f}: degradado errado`).toBe(!comEstado.has(f));
    }
  });

  it("funcional: legado-raio-alto traz raio alto e orçamento 2/3", () => {
    const v = projetarVisao(raiz("legado-raio-alto"));
    expect(v.degradado).toBe(false);
    expect(v.estado?.raio).toBe("alto");
    expect(v.estado?.orcamento_arquivos).toBe("2/3");
    expect(v.trabalho?.trabalho_id).toBe("OC-2026-0142");
    expect(v.trabalho?.expx_tool).toBe("runx");
  });

  it("funcional: no modo degradado o par concluídas/total vem da contagem do plano", () => {
    // estado-invalido tem plano com 3 tasks, 1 concluída, e nenhum estado legível
    const v = projetarVisao(raiz("estado-invalido"));
    expect(v.degradado).toBe(true);
    expect(v.estado).toBe(null);
    expect(v.concluidas).toBe(1);
    expect(v.total).toBe(3);

    // E com estado válido o par vem do ESTADO, não do plano. A fixture
    // legado-raio-alto diverge de propósito: o estado.json diz 3/5 e o plano
    // tem 2 tasks com 1 concluída. É o cenário da lacuna L-09 (estado e plano
    // discordando), e é o que torna a fonte observável.
    const l = projetarVisao(raiz("legado-raio-alto"));
    expect(l.degradado).toBe(false);
    expect(l.concluidas).toBe(3);
    expect(l.total).toBe(5);

    // o plano da mesma fixture diz outra coisa — e perde, por D-13
    const doPlano = l.trabalho?.sprints.flatMap((s) => s.tasks) ?? [];
    expect(doPlano.length).toBe(2);
    expect(doPlano.filter((t) => t.status === "concluida").length).toBe(1);
  });

  it("funcional: o par vem do estado.json mesmo quando diverge do plano", () => {
    // O estado.json de com-estado diz 1 de 3. Se trocarmos os inteiros do
    // estado, o par tem de acompanhar o estado — uma implementação que conte
    // o plano continuaria devolvendo o que o plano diz.
    const real = projetarVisao(raiz("com-estado"));
    expect(real.estado?.tasks_concluidas).toBe(1);
    expect(real.concluidas).toBe(1);

    // o plano de com-estado tem 3 tasks, 1 concluida: os números coincidem.
    // A prova de que a fonte é o estado está em `degradado` + a igualdade
    // estrita com os campos do arquivo, verificada acima em legado-raio-alto.
    const tasksDoPlano = real.trabalho?.sprints.flatMap((s) => s.tasks) ?? [];
    expect(tasksDoPlano.length).toBe(3);
  });

  it("funcional: bloqueio aberto sobe na visão e bloqueio resolvido não entra", () => {
    const v = projetarVisao(raiz("com-bloqueio"));
    expect(v.bloqueiosAbertos.length).toBe(1);
    expect(v.bloqueiosAbertos[0]?.task).toBe("T-01.02");

    // A garantia que importa: TODO item da lista tem `aberto: true`. Uma
    // implementação que não filtrasse traria também os resolvidos.
    expect(v.bloqueiosAbertos.every((b) => b.aberto)).toBe(true);
    expect(v.bloqueiosAbertos.every((b) => b.resolvido_em === null)).toBe(true);

    // A fixture tem DOIS bloqueios: B-01 aberto e B-02 resolvido. É o que
    // torna o filtro observável — sem o resolvido ao lado, uma implementação
    // que devolvesse a lista inteira passaria no teste.
    expect(v.trabalho?.bloqueios.length).toBe(2);
    expect(v.bloqueiosAbertos.map((b) => b.id)).toEqual(["B-01"]);

    // sem bloqueio, a lista é vazia — não null
    expect(projetarVisao(raiz("com-estado")).bloqueiosAbertos).toEqual([]);
  });

  it("funcional: rastro ausente projeta eventos vazios e violações zero", () => {
    const semRastro = projetarVisao(raiz("sem-rastro"));
    expect(semRastro.eventos).toEqual([]);
    expect(semRastro.violacoesAviso).toBe(0);

    // com-estado tem um evento regra_violada no rastro
    const com = projetarVisao(raiz("com-estado"));
    expect(com.eventos.length).toBeGreaterThan(0);
    expect(com.violacoesAviso).toBe(1);
  });

  it("funcional: sem trabalho aberto, trabalho é null e a lista de abertos é vazia", () => {
    const v = projetarVisao(raiz("sem-trabalho"));
    expect(v.trabalho).toBe(null);
    expect(v.abertos).toEqual([]);
    expect(v.concluidas).toBe(0);
    expect(v.total).toBe(0);
  });
});
