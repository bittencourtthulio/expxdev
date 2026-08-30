import { describe, it, expect } from "vitest";
import {
  CHAVES_EVENTO,
  chavesDesconhecidas,
  chavesFaltando,
  validarRastro,
} from "./evento.js";

/** Linha completa e válida; cada teste altera só o que precisa. */
function linha(extra: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    ts: "2026-08-29T14:32:10Z",
    expx_eventos: 1,
    trabalho_id: "OC-2026-0142",
    ferramenta: "runx",
    origem: "hook",
    evento: "task_concluida",
    fase: "e3",
    task: "T-01.02",
    agente: "principal",
    resultado: "ok",
    detalhe: "suite verde, 14 testes",
    arquivos: ["src/frete/calculo.ts"],
    ...extra,
  };
}

const j = (o: Record<string, unknown>) => JSON.stringify(o);

describe("as doze chaves", () => {
  it("funcional: linha completa não tem defeito", () => {
    const r = validarRastro(j(linha()));
    expect(r.defeitos).toEqual([]);
    expect(r.linhas).toBe(1);
  });

  it("funcional: chave omitida é apontada pelo nome, com o número da linha", () => {
    const sem = linha();
    delete sem["agente"];
    const r = validarRastro(j(sem));
    expect(r.defeitos).toHaveLength(1);
    expect(r.defeitos[0]?.linha).toBe(1);
    expect(r.defeitos[0]?.motivo).toContain("agente");
  });

  it("funcional: valor null satisfaz a R6 — é a ausência omitida que viola", () => {
    const r = validarRastro(j(linha({ fase: null, task: null })));
    expect(r.defeitos).toEqual([]);
  });
});

describe("chaves extras", () => {
  // A regressão que motivou este módulo: um validador de igualdade estrita
  // reprovava toda linha da mergex e da legadox, que usam extras declaradas.
  it("integração: a linha da mergex, com `hook`, é válida", () => {
    const r = validarRastro(
      j(linha({ ferramenta: "mergex", evento: "acao_bloqueada", resultado: "bloqueado", hook: "git-perigoso" })),
    );
    expect(r.defeitos).toEqual([]);
    expect(r.desconhecidas).toEqual([]);
  });

  it("integração: a linha da legadox, com `hook` e `faixa`, é válida", () => {
    const r = validarRastro(
      j(linha({ ferramenta: "legadox", evento: "regra_violada", resultado: "aviso", hook: "raio", faixa: "alta" })),
    );
    expect(r.defeitos).toEqual([]);
    expect(r.desconhecidas).toEqual([]);
  });

  it("funcional: chave não declarada é avisada, mas não reprova a linha", () => {
    const r = validarRastro(j(linha({ gadget: "?" })));
    expect(r.defeitos).toEqual([]);
    expect(r.desconhecidas).toEqual(["gadget"]);
  });
});

describe("ferramenta e agente", () => {
  it("integração: as sete skills do método emitem rastro válido", () => {
    for (const f of ["sprintx", "runx", "mergex", "legadox", "stackx", "memox", "prodx"]) {
      const r = validarRastro(j(linha({ ferramenta: f })));
      expect(r.defeitos, `ferramenta ${f}`).toEqual([]);
    }
  });

  it("funcional: `ferramenta` desconhecida é defeito", () => {
    const r = validarRastro(j(linha({ ferramenta: "inventada" })));
    expect(r.defeitos).toHaveLength(1);
    expect(r.defeitos[0]?.motivo).toContain("ferramenta");
  });

  it("funcional: os agentes que a mergex e a legadox gravam são válidos", () => {
    for (const a of ["revisor-diff", "analista-de-conflito", "avaliador-de-raio"]) {
      const r = validarRastro(j(linha({ agente: a })));
      expect(r.defeitos, `agente ${a}`).toEqual([]);
    }
  });
});

describe("formato do arquivo", () => {
  it("funcional: linha em branco é ignorada, não contada", () => {
    const r = validarRastro(`${j(linha())}\n\n${j(linha())}\n`);
    expect(r.linhas).toBe(2);
    expect(r.defeitos).toEqual([]);
  });

  it("funcional: JSON quebrado aponta a linha certa e não derruba as outras", () => {
    const r = validarRastro(`${j(linha())}\n{quebrado\n${j(linha())}`);
    expect(r.linhas).toBe(3);
    expect(r.defeitos).toHaveLength(1);
    expect(r.defeitos[0]?.linha).toBe(2);
  });

  it("funcional: `ts` fora do formato ISO-8601 UTC é defeito", () => {
    const r = validarRastro(j(linha({ ts: "2026-08-29 14:32:10" })));
    expect(r.defeitos).toHaveLength(1);
    expect(r.defeitos[0]?.motivo).toContain("ts");
  });
});

describe("as funcoes de chave", () => {
  it("unitário: chavesFaltando lista só o que falta", () => {
    const sem = linha();
    delete sem["detalhe"];
    delete sem["arquivos"];
    expect(chavesFaltando(sem).sort()).toEqual(["arquivos", "detalhe"]);
  });

  it("unitário: chavesDesconhecidas ignora as doze e as extras declaradas", () => {
    expect(chavesDesconhecidas(linha({ hook: "x", faixa: "alta" }))).toEqual([]);
  });

  it("unitário: o contrato tem exatamente doze chaves obrigatórias", () => {
    expect(CHAVES_EVENTO).toHaveLength(12);
  });
});
