import type { Visao } from "../visao/projetar.js";
import type { Pintor } from "./cor.js";
import { cortar } from "./largura.js";

/**
 * A seção de bloqueios — a que sobe para o topo.
 *
 * O "há quanto tempo" é em DIAS porque `aberto_em` é `DataIso` (`AAAA-MM-DD`),
 * sem hora (`src/parser/esquema/kinds.ts`). O rastro tem `ts` com hora no
 * evento `task_bloqueada` e refinaria isso, ao custo de cruzar duas fontes —
 * decisão D-14 escolheu não pagar.
 */

const MS_POR_DIA = 86_400_000;

/** Dias inteiros entre a data de abertura e hoje, ambos em UTC. */
function diasDesde(aberto: string, agora: Date): number {
  const a = Date.parse(`${aberto}T00:00:00Z`);
  if (Number.isNaN(a)) return 0;
  const b = Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth(), agora.getUTCDate());
  return Math.max(0, Math.floor((b - a) / MS_POR_DIA));
}

/** "hoje", "1 dia", "N dias" — nunca "0 dias", que não é português. */
export function tempoAberto(aberto: string, agora: Date): string {
  const d = diasDesde(aberto, agora);
  if (d === 0) return "hoje";
  return d === 1 ? "1 dia" : `${String(d)} dias`;
}

export function desenharBloqueios(
  v: Visao,
  colunas: number,
  pintar: Pintor,
  agora: Date,
): string[] {
  if (v.bloqueiosAbertos.length === 0) return [];

  const n = v.bloqueiosAbertos.length;
  const titulo = n === 1 ? "1 bloqueio aberto" : `${String(n)} bloqueios abertos`;
  const linhas = [pintar(cortar(titulo, colunas), "erro")];

  for (const b of v.bloqueiosAbertos) {
    const alvo = b.task ?? "sem task";
    const quando = tempoAberto(b.aberto_em, agora);
    // corta primeiro, pinta depois: escape ANSI não ocupa coluna
    const texto = cortar(`  ${b.id} · ${alvo} · ${quando} · ${b.descricao}`, colunas);
    linhas.push(pintar(texto, "erro"));
  }

  return linhas;
}
