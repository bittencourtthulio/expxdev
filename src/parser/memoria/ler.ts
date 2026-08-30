import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Lê o índice que o memox grava. O painel NUNCA invoca o motor (decisão D-01):
 * o motor é Python, roda fora daqui, e o painel é somente leitura.
 *
 * A leitura falha ABERTA — devolve `null` em vez de lançar — e cada motivo é
 * um caso real, não defesa hipotética:
 *
 *   arquivo ausente     o índice é local e o próprio motor acrescenta
 *                       `.expx/memoria/` ao `.gitignore`. Quem clonou o
 *                       repositório não tem índice, e isso é o normal.
 *   JSON inválido       o motor reescreve o arquivo inteiro a cada
 *                       reconstrução; ler no instante da gravação devolve
 *                       JSON truncado — o mesmo risco que o observador já
 *                       documenta para `tasks.md`.
 *   versão desconhecida um índice gravado por versão futura pode ter outro
 *                       formato, e adivinhar seria pior que não mostrar.
 *
 * A doutrina do painel inteiro é degradar mostrando, nunca quebrar (D-05).
 */

/** A versão do formato que este leitor entende. */
export const VERSAO_SUPORTADA = 1;

/** O índice cru, como está no disco. A projeção enxuta é feita em `projetar.ts`. */
export type IndiceCru = {
  versao: number;
  gerado_em?: string;
  totais?: Record<string, number>;
  por_arquivo?: Record<string, unknown[]>;
  por_modulo?: Record<string, unknown[]>;
  sinais?: { arquivo?: Record<string, unknown>; modulo?: Record<string, unknown> };
  regressoes?: unknown[];
  coincidencias_arquivo?: unknown[];
  artefatos_contaminados?: Record<string, string[]>;
};

export function caminhoDoIndice(raiz: string): string {
  return join(raiz, ".expx", "memoria", "indice.json");
}

export function lerIndice(raiz: string): IndiceCru | null {
  const caminho = caminhoDoIndice(raiz);
  if (!existsSync(caminho)) return null;

  let cru: unknown;
  try {
    cru = JSON.parse(readFileSync(caminho, "utf8"));
  } catch {
    // JSON truncado pela gravação em curso: na próxima releitura vem inteiro
    return null;
  }

  if (typeof cru !== "object" || cru === null || Array.isArray(cru)) return null;
  const indice = cru as IndiceCru;
  if (indice.versao !== VERSAO_SUPORTADA) return null;
  return indice;
}
