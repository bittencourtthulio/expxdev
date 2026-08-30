import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/**
 * Os gatilhos das descrições de skill, contra relatos REAIS.
 *
 * Por que este teste existe: um pedido que era claramente uma ocorrência de
 * manutenção — "ao arrastar um card no board o card não acompanha o mouse, ele
 * fica apenas dentro da etapa" — não acionou a runx três vezes seguidas, em
 * sessões diferentes. A causa não era instalação: era a descrição.
 *
 * Ela listava CATEGORIAS TÉCNICAS ("bug", "cálculo divergente", "regra de
 * negócio"), que é o vocabulário de quem JÁ classificou o problema. Ninguém
 * relata assim. As pessoas descrevem o SINTOMA — "não acompanha", "fica
 * preso", "não segue o padrão", "está estranho" — e cabe à skill reconhecer
 * isso como defeito.
 *
 * O teste é sobre vocabulário, não sobre o modelo: ele garante que as âncoras
 * que fazem o casamento acontecer continuem na descrição, e que a fronteira
 * entre as três skills não se dissolva ao ampliá-la.
 */

const RAIZ_SKILLS = "/Users/thuliobittencourt/Documents/Projetos";

const PASTAS: Record<string, string> = {
  runx: "RunX/.claude/skills/runx/SKILL.md",
  prodx: "ProdX/.claude/skills/prodx/SKILL.md",
  sprintx: "SprintX/.claude/skills/sprintx/SKILL.md",
};

function descricaoDe(skill: string): string {
  const caminho = join(RAIZ_SKILLS, PASTAS[skill] ?? "");
  if (!existsSync(caminho)) return "";
  const bruto = readFileSync(caminho, "utf8");
  // a descrição pode estar entre aspas ou solta, e ocupa várias linhas
  const comAspas = /description:\s*"([\s\S]*?)"\s*\n(?=[a-z_-]+:|---)/.exec(bruto);
  if (comAspas?.[1] !== undefined) return comAspas[1];
  const solta = /description:\s*([\s\S]*?)\n(?=[a-z_-]+:|---)/.exec(bruto);
  return solta?.[1] ?? "";
}

/** A skill só está instalável se a descrição existir. Sem ela, nada casa. */
const temRepos = existsSync(join(RAIZ_SKILLS, PASTAS["runx"] ?? ""));

describe.skipIf(!temRepos)("gatilhos: o relato como as pessoas realmente escrevem", () => {
  /**
   * O caso que motivou tudo. Descreve só o sintoma observável: nenhuma
   * palavra de diagnóstico, nenhum "bug", nenhum "tela", nenhum "conserta".
   */
  const RELATO_DO_CARD =
    "ao arrastar um card no board o card nao acompanha o mouse ele fica " +
    "apenas dentro da etapa que ele esta nao segue o padrao de arrastar e soltar um card";

  it("funcional: a runx ancora o relato de sintoma sem diagnóstico", () => {
    const d = descricaoDe("runx").toLowerCase();
    // pelo menos uma âncora do vocabulário de sintoma tem que estar presente,
    // senão o relato do card não tem por onde casar
    // "parou de funcionar" já existia e NÃO basta: o relato do card descreve
    // algo que funciona pela metade, não algo que parou. As âncoras que
    // faltavam são as do defeito silencioso.
    const ancoras = [
      "não funciona como deveria",
      "não segue o padrão",
      "valor errado",
      "trava",
    ];
    const presentes = ancoras.filter((a) => d.includes(a));
    expect(presentes.length).toBeGreaterThanOrEqual(2);
  });

  it("funcional: o vocabulário de interface do relato tem âncora na runx", () => {
    const d = descricaoDe("runx").toLowerCase();
    // "arrastar", "clicar", "botão": o relato de UI é concreto, não categórico
    // "tela" já existia e NÃO basta: o relato fala de INTERAÇÃO (arrastar,
    // clicar), que é onde mora a maior parte do defeito de front-end.
    const ui = ["arrastar", "clicar", "salvar", "interface"];
    expect(ui.filter((t) => d.includes(t)).length).toBeGreaterThanOrEqual(2);
  });

  it("funcional: a runx segue declarando a fronteira com sprintx e prodx", () => {
    const d = descricaoDe("runx").toLowerCase();
    // ampliar não pode dissolver a fronteira: é ela que evita a runx capturar
    // o que é feature nova (sprintx) ou pedido a avaliar (prodx)
    expect(d).toContain("sprintx");
    expect(d).toContain("já existe");
  });

  it("funcional: o relato do card não casa com gatilho de feature nova", () => {
    // guarda contra ampliar a runx para dentro do território da sprintx:
    // o relato não pede para construir, adicionar nem integrar nada
    const construir = ["construir", "adicionar", "integrar", "criar do zero"];
    expect(construir.filter((t) => RELATO_DO_CARD.includes(t))).toEqual([]);
  });

  /**
   * A recomendação oficial é 200–300 caracteres. O limite duro de truncamento
   * é 1536, mas descrição longa dilui o gatilho: o modelo lê dezenas delas de
   * uma vez, e a que decide rápido é a curta e específica. A versão de 1020
   * caracteres não acionava; esta cabe no que a documentação recomenda.
   */
  it("funcional: a descrição da runx é objetiva — no máximo 300 caracteres", () => {
    const d = descricaoDe("runx");
    expect(d.length).toBeGreaterThan(0);
    expect(d.length).toBeLessThanOrEqual(300);
  });
});
