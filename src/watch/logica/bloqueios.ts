/**
 * Lógica pura da seção de bloqueios — compartilhada pelos dois motores.
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
