import { describe, it, expect, afterEach } from "vitest";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { projetoTemporario, type ProjetoTemporario } from "../teste/projeto-temporario.js";
import { perguntadorDeRoteiro, interpretarEscolhaMultipla, interpretarSimNao } from "./perguntar.js";
import { executarWizard } from "./wizard.js";

let p: ProjetoTemporario | undefined;
afterEach(() => {
  p?.descartar();
  p = undefined;
});

const VAZIAS = { skills: [], harness: [], painel: false, sim: false, simular: false };

describe("leitura das respostas", () => {
  it("integração: interpreta as formas que a pessoa realmente digita", () => {
    expect(interpretarEscolhaMultipla("1,5", 6)).toEqual([0, 4]);
    expect(interpretarEscolhaMultipla("1 5", 6)).toEqual([0, 4]);
    expect(interpretarEscolhaMultipla("", 6)).toEqual([]);
    expect(interpretarSimNao("", true)).toBe(true);
    expect(interpretarSimNao("n", true)).toBe(false);
  });

  it("funcional: número fora da faixa é recusado, não truncado em silêncio", () => {
    expect(interpretarEscolhaMultipla("9", 6)).toBeUndefined();
    expect(interpretarEscolhaMultipla("0", 6)).toBeUndefined();
    expect(interpretarEscolhaMultipla("abc", 6)).toBeUndefined();
  });

  it("funcional: número repetido conta uma vez só", () => {
    expect(interpretarEscolhaMultipla("1,1,2", 6)).toEqual([0, 1]);
  });
});

describe("wizard do init", () => {
  it("integração: as quatro perguntas levam a uma seleção completa", async () => {
    p = projetoTemporario();
    // skills 1,5 (sprintx, mergex) → harness vazio (claude) → painel não → confirma
    const q = perguntadorDeRoteiro(["1,5", "", "n", ""]);

    const r = await executarWizard(q, VAZIAS, p.raiz);

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.opcoes.skills).toEqual(["sprintx", "mergex"]);
    expect(r.opcoes.harness).toEqual(["claude"]);
    expect(r.opcoes.painel).toBe(false);
    // O wizard já é a confirmação: o init a jusante não pergunta de novo.
    expect(r.opcoes.sim).toBe(true);
  });

  it("funcional: a lista mostra o papel de cada skill e marca as camadas", async () => {
    p = projetoTemporario();
    const q = perguntadorDeRoteiro(["1", "", "n", ""]);

    await executarWizard(q, VAZIAS, p.raiz);

    const tela = q.escrito();
    expect(tela).toContain("sprintx");
    expect(tela).toContain("planeja e executa features novas");
    expect(tela).toContain("(camada)");
  });

  it("funcional: camada sozinha avisa e pede confirmação, sem impedir", async () => {
    p = projetoTemporario();
    // legadox (3) sozinho → confirma o aviso → harness → painel → confirma
    const q = perguntadorDeRoteiro(["3", "s", "", "n", ""]);

    const r = await executarWizard(q, VAZIAS, p.raiz);

    expect(q.escrito()).toContain("camada");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.opcoes.skills).toEqual(["legadox"]);
  });

  it("funcional: recusar o aviso da camada devolve à escolha em vez de instalar", async () => {
    p = projetoTemporario();
    // legadox sozinho → recusa → escolhe sprintx → harness → painel → confirma
    const q = perguntadorDeRoteiro(["3", "n", "1", "", "n", ""]);

    const r = await executarWizard(q, VAZIAS, p.raiz);

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.opcoes.skills).toEqual(["sprintx"]);
  });

  it("funcional: escolha vazia repergunta em vez de aceitar seleção vazia", async () => {
    p = projetoTemporario();
    const q = perguntadorDeRoteiro(["", "1", "", "n", ""]);

    const r = await executarWizard(q, VAZIAS, p.raiz);

    expect(q.escrito()).toContain("ao menos uma");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.opcoes.skills).toEqual(["sprintx"]);
  });

  it("funcional: os dois harnesses podem ser escolhidos juntos", async () => {
    p = projetoTemporario();
    const q = perguntadorDeRoteiro(["1", "1,2", "n", ""]);

    const r = await executarWizard(q, VAZIAS, p.raiz);

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.opcoes.harness).toEqual(["claude", "opencode"]);
  });

  it("funcional: o que veio por flag não é perguntado de novo", async () => {
    p = projetoTemporario();
    // Só painel e confirmação restam: skills e harness já vieram por flag.
    const q = perguntadorDeRoteiro(["n", ""]);

    const r = await executarWizard(
      q,
      { ...VAZIAS, skills: ["runx"], harness: ["opencode"] },
      p.raiz,
    );

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.opcoes.skills).toEqual(["runx"]);
    expect(r.opcoes.harness).toEqual(["opencode"]);
    expect(q.escrito()).not.toContain("Quais skills");
  });

  it("funcional: projeto com .expx pede confirmação antes de reconfigurar", async () => {
    p = projetoTemporario();
    mkdirSync(join(p.raiz, ".expx"), { recursive: true });
    const q = perguntadorDeRoteiro(["n"]);

    const r = await executarWizard(q, VAZIAS, p.raiz);

    expect(q.escrito()).toContain("ja tem um .expx");
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.erro).toContain("nada foi alterado");
  });

  it("funcional: recusar a confirmação final não instala nada", async () => {
    p = projetoTemporario();
    const q = perguntadorDeRoteiro(["1", "", "n", "n"]);

    const r = await executarWizard(q, VAZIAS, p.raiz);

    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.erro).toContain("cancelado");
  });

  it("funcional: entrada inválida insistente desiste em vez de repetir para sempre", async () => {
    p = projetoTemporario();
    const q = perguntadorDeRoteiro(["99", "99", "99", "99", "99"]);

    const r = await executarWizard(q, VAZIAS, p.raiz);

    expect(r.ok).toBe(false);
  });
});

describe("wizard navegavel (checkbox)", () => {
  it("integração: marcar na lista produz a mesma selecao que os numeros", async () => {
    p = projetoTemporario();
    // Marca sprintx+mergex no menu de skills, claude no de harness.
    const q = perguntadorDeRoteiro(["n", ""], [["sprintx", "mergex"], ["claude"]]);

    const r = await executarWizard(q, VAZIAS, p.raiz);

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.opcoes.skills).toEqual(["sprintx", "mergex"]);
    expect(r.opcoes.harness).toEqual(["claude"]);
  });

  it("funcional: o menu mostra papel e camada, como a lista numerada", async () => {
    p = projetoTemporario();
    const q = perguntadorDeRoteiro(["n", ""], [["sprintx"], ["claude"]]);

    await executarWizard(q, VAZIAS, p.raiz);

    const tela = q.escrito();
    expect(tela).toContain("Quais skills instalar");
    expect(tela).toContain("planeja e executa features novas");
    expect(tela).toContain("(camada)");
  });

  it("funcional: nada marcado repergunta em vez de instalar vazio", async () => {
    p = projetoTemporario();
    const q = perguntadorDeRoteiro(["n", ""], [[], ["sprintx"], ["claude"]]);

    const r = await executarWizard(q, VAZIAS, p.raiz);

    expect(q.escrito()).toContain("ao menos uma");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.opcoes.skills).toEqual(["sprintx"]);
  });

  it("funcional: camada marcada sozinha avisa tambem no menu", async () => {
    p = projetoTemporario();
    // legadox sozinho → confirma o aviso → harness → painel nao → confirma
    const q = perguntadorDeRoteiro(["s", "n", ""], [["legadox"], ["claude"]]);

    const r = await executarWizard(q, VAZIAS, p.raiz);

    expect(q.escrito()).toContain("camada");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.opcoes.skills).toEqual(["legadox"]);
  });

  it("funcional: os dois harnesses juntos pelo menu", async () => {
    p = projetoTemporario();
    const q = perguntadorDeRoteiro(["n", ""], [["runx"], ["claude", "opencode"]]);

    const r = await executarWizard(q, VAZIAS, p.raiz);

    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.opcoes.harness).toEqual(["claude", "opencode"]);
  });
});
