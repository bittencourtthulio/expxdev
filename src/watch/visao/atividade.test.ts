import { describe, it, expect } from "vitest";
import type { LinhaEvento } from "../../parser/esquema/evento.js";
import { agrupar, limparDetalhe, progressoDaTask } from "./atividade.js";

/**
 * O rastro cru virando informação.
 *
 * O caso real que motivou este módulo: uma execução autônoma gravou doze
 * `suite_executada` seguidas, todas com o mesmo comando de shell no `detalhe`.
 * As dez linhas visíveis da tela eram as dez últimas dessas doze — a task que
 * tinha concluído, a regra violada e o arquivo alterado ficavam fora da tela,
 * empurrados por ruído.
 */

const CMD =
  "suite nao_determinado: cd /Users/alguem/Projetos/App && npx vitest run src/a.test.ts";

function evento(p: Partial<LinhaEvento> & { ts: string }): LinhaEvento {
  return {
    expx_eventos: 1,
    trabalho_id: "OC-1",
    ferramenta: "runx",
    origem: "hook",
    evento: "suite_executada",
    fase: "F-01.1",
    task: "T-01.01",
    agente: "principal",
    resultado: "ok",
    detalhe: "",
    arquivos: [],
    ...p,
  } as LinhaEvento;
}

describe("limpar detalhe", () => {
  it("integração: o comando de shell sai, o rótulo fica", () => {
    // A linha inteira era o comando, cortado antes de dizer qualquer coisa.
    expect(limparDetalhe(CMD)).toBe("suite nao_determinado");
  });

  it("funcional: detalhe em prosa passa intacto", () => {
    // O que NÃO é comando é justamente a informação: não pode ser podado.
    expect(limparDetalhe("suite verde, 14 testes")).toBe("suite verde, 14 testes");
    expect(limparDetalhe("escopo-da-task: arquivo fora do escopo")).toBe(
      "escopo-da-task: arquivo fora do escopo",
    );
  });

  it("funcional: variável de ambiente na frente também é comando", () => {
    expect(limparDetalhe("mutacao: MUT5=/private/tmp/x npx vitest run")).toBe("mutacao");
  });
});

describe("agrupar atividade", () => {
  it("integração: doze suítes iguais viram uma linha com contador", () => {
    const eventos = Array.from({ length: 12 }, (_, i) =>
      evento({ ts: `2026-08-30T15:${String(50 - i).padStart(2, "0")}:00Z`, detalhe: CMD }),
    );

    const grupos = agrupar(eventos);
    expect(grupos).toHaveLength(1);
    expect(grupos[0]?.vezes).toBe(12);
    // e sobra tela para o que de fato aconteceu
    expect(grupos[0]?.ts).toBe("2026-08-30T15:50:00Z");
  });

  it("funcional: a suíte de OUTRA task continua sendo outra linha", () => {
    // Agrupar por evento apenas esconderia o paralelismo, que é justamente o
    // que a tela precisa mostrar.
    const grupos = agrupar([
      evento({ ts: "2026-08-30T15:50:00Z", task: "T-01.01" }),
      evento({ ts: "2026-08-30T15:49:00Z", task: "T-01.02" }),
    ]);
    expect(grupos).toHaveLength(2);
  });

  it("funcional: o sinal segue o evento MAIS RECENTE, não o pior do grupo", () => {
    // A suíte apanhou sete vezes e ficou verde na última: a tela precisa
    // mostrar verde, com a contagem do que apanhou — e não vermelho para
    // sempre por causa de uma tentativa antiga.
    const grupos = agrupar([
      evento({ ts: "2026-08-30T15:50:00Z", resultado: "verde" }),
      evento({ ts: "2026-08-30T15:49:00Z", resultado: "nao_determinado" }),
      evento({ ts: "2026-08-30T15:48:00Z", resultado: "nao_determinado" }),
    ]);

    expect(grupos[0]?.houveFalha).toBe(false);
    expect(grupos[0]?.falhas).toBe(2);
    expect(grupos[0]?.vezes).toBe(3);
  });
});

describe("progresso estimado da task", () => {
  it("integração: os marcos do ciclo TDD avançam a estimativa", () => {
    const eventos = [
      evento({ ts: "2026-08-30T15:40:00Z", evento: "suite_executada", resultado: "verde" }),
      evento({ ts: "2026-08-30T15:30:00Z", evento: "arquivo_alterado" }),
      evento({ ts: "2026-08-30T15:10:00Z", evento: "suite_executada", resultado: "vermelha" }),
      evento({ ts: "2026-08-30T15:00:00Z", evento: "task_iniciada" }),
    ];

    const p = progressoDaTask(eventos, "T-01.01");
    expect(p.iniciadaEm?.toISOString()).toBe("2026-08-30T15:00:00.000Z");
    expect(p.fracao).toBeGreaterThan(0.5);
    expect(p.suiteVerde).toBe(true);
  });

  it("funcional: a estimativa satura abaixo de 100 enquanto a task não fecha", () => {
    // Quem fecha uma task é o `task_concluida`, que muda o status de verdade.
    // A leitura do rastro nunca pode afirmar conclusão por conta própria.
    const eventos = [
      evento({ ts: "2026-08-30T15:40:00Z", evento: "suite_executada", resultado: "verde" }),
      evento({ ts: "2026-08-30T15:30:00Z", evento: "arquivo_alterado" }),
      evento({ ts: "2026-08-30T15:00:00Z", evento: "task_iniciada" }),
    ];
    expect(progressoDaTask(eventos, "T-01.01").fracao).toBeLessThan(1);
  });

  it("funcional: task concluída é 100, sem estimativa nenhuma", () => {
    const eventos = [
      evento({ ts: "2026-08-30T15:45:00Z", evento: "task_concluida" }),
      evento({ ts: "2026-08-30T15:00:00Z", evento: "task_iniciada" }),
    ];
    expect(progressoDaTask(eventos, "T-01.01").fracao).toBe(1);
  });

  it("funcional: task sem rastro nenhum não inventa progresso", () => {
    const p = progressoDaTask([], "T-09.99");
    expect(p.fracao).toBe(0);
    expect(p.sinais).toBe(0);
    expect(p.iniciadaEm).toBeNull();
  });
});
