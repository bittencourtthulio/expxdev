import type { Estado, Trabalho, EntradaHistorico } from "./tipos.js";

/**
 * Filtro de data global.
 *
 * Um só período vale para todas as telas: o time raciocina em "o que aconteceu
 * neste mês", não em "este mês no histórico e outro mês nos relatórios". Cada
 * tela decide QUAL data comparar (fechamento, atualização, abertura), mas o
 * intervalo é o mesmo.
 */

export type Preset = "tudo" | "7d" | "30d" | "90d" | "mes" | "ano" | "custom";

export type Periodo = {
  preset: Preset;
  /** ISO AAAA-MM-DD, inclusivo. null = sem limite. */
  de: string | null;
  ate: string | null;
};

export const PERIODO_PADRAO: Periodo = { preset: "tudo", de: null, ate: null };

export const ROTULO_PRESET: Record<Preset, string> = {
  tudo: "Tudo",
  "7d": "7 dias",
  "30d": "30 dias",
  "90d": "90 dias",
  mes: "Este mês",
  ano: "Este ano",
  custom: "Personalizado",
};

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function menosDias(base: Date, n: number): Date {
  const d = new Date(base);
  d.setUTCDate(d.getUTCDate() - n);
  return d;
}

/** Resolve um preset num intervalo concreto, para a data de referência dada. */
export function resolver(preset: Preset, hoje: Date, custom?: { de: string | null; ate: string | null }): Periodo {
  switch (preset) {
    case "tudo":
      return { preset, de: null, ate: null };
    case "7d":
      return { preset, de: iso(menosDias(hoje, 6)), ate: iso(hoje) };
    case "30d":
      return { preset, de: iso(menosDias(hoje, 29)), ate: iso(hoje) };
    case "90d":
      return { preset, de: iso(menosDias(hoje, 89)), ate: iso(hoje) };
    case "mes":
      return { preset, de: iso(new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), 1))), ate: iso(hoje) };
    case "ano":
      return { preset, de: iso(new Date(Date.UTC(hoje.getUTCFullYear(), 0, 1))), ate: iso(hoje) };
    case "custom":
      return { preset, de: custom?.de ?? null, ate: custom?.ate ?? null };
  }
}

/** A data (ISO) cai dentro do período? Data ausente nunca é filtrada para fora. */
export function dentro(data: string | null | undefined, p: Periodo): boolean {
  if (p.de === null && p.ate === null) return true;
  if (data === null || data === undefined || data === "") return true;
  const d = data.slice(0, 10);
  if (p.de !== null && d < p.de) return false;
  if (p.ate !== null && d > p.ate) return false;
  return true;
}

export function periodoAtivo(p: Periodo): boolean {
  return p.de !== null || p.ate !== null;
}

export function descrever(p: Periodo): string {
  if (!periodoAtivo(p)) return "todo o período";
  if (p.de !== null && p.ate !== null) return `${p.de} a ${p.ate}`;
  if (p.de !== null) return `desde ${p.de}`;
  return `até ${String(p.ate)}`;
}

/**
 * Um trabalho entra no período se qualquer marco dele cai dentro. Usar só
 * `atualizado_em` esconderia trabalho concluído há tempos que ainda importa
 * ao recorte; usar só `criado_em` esconderia o que foi mexido agora.
 */
export function trabalhoNoPeriodo(t: Trabalho, p: Periodo): boolean {
  if (!periodoAtivo(p)) return true;
  return dentro(t.criado_em, p) || dentro(t.atualizado_em, p) || dentro(t.concluido_em, p);
}

export function historicoNoPeriodo(e: EntradaHistorico, p: Periodo): boolean {
  return dentro(e.fechado_em, p);
}

/** Recorta o estado inteiro pelo período — as telas recebem já filtrado. */
export function recortar(estado: Estado, p: Periodo): Estado {
  if (!periodoAtivo(p)) return estado;
  const trabalhos = estado.trabalhos.filter((t) => trabalhoNoPeriodo(t, p));
  const ids = new Set(trabalhos.map((t) => t.trabalho_id));
  return {
    ...estado,
    trabalhos,
    historico: estado.historico.filter((h) => historicoNoPeriodo(h, p)),
    bloqueios: estado.bloqueios.filter((b) => ids.has(b.trabalho_id)),
    violacoes: estado.violacoes.filter((v) => ids.has(v.trabalho_id)),
  };
}
