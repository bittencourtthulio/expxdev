import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { VERSAO_SCHEMA_SUPORTADA } from "../index.js";

/**
 * Recusa skill que exija uma versão de `expx-schema` que este CLI não entende.
 *
 * Nenhuma das cinco skills declara essa versão hoje: o frontmatter delas tem só
 * `name` e `description`. Como o CLI nunca escreve skill, ele não pode
 * acrescentar a chave — então a AUSÊNCIA precisa ser válida e significar a
 * versão 1, a única publicada. Uma skill futura que precise de mais passa a
 * declarar `expx_schema:` e este CLI a bloqueia em vez de instalar algo que o
 * painel não sabe ler.
 */

export type Compatibilidade = {
  compativel: boolean;
  exigido: number;
  suportado: number;
  motivo?: string;
};

/** Lê `expx_schema` do frontmatter do SKILL.md. Ausente ou ilegível = 1. */
export function lerSchemaDaSkill(raizSkill: string): number {
  const caminho = join(raizSkill, "SKILL.md");
  if (!existsSync(caminho)) return 1;
  let bruto: string;
  try {
    bruto = readFileSync(caminho, "utf8");
  } catch {
    return 1;
  }
  const bloco = /^---\r?\n([\s\S]*?)\r?\n---/.exec(bruto);
  if (bloco === null) return 1;
  const linha = /^expx_schema:\s*(\d+)\s*$/m.exec(bloco[1] ?? "");
  if (linha === null) return 1;
  const n = Number(linha[1]);
  return Number.isInteger(n) && n > 0 ? n : 1;
}

export function avaliarCompatibilidade(
  raizSkill: string,
  suportado: number = VERSAO_SCHEMA_SUPORTADA,
): Compatibilidade {
  const exigido = lerSchemaDaSkill(raizSkill);
  if (exigido <= suportado) return { compativel: true, exigido, suportado };
  return {
    compativel: false,
    exigido,
    suportado,
    motivo: `a skill exige expx-schema ${String(exigido)} e este CLI suporta ate ${String(suportado)}: e preciso atualizar o CLI antes de instalar esta versao`,
  };
}
