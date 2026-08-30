import { z } from "zod";
import { Ferramenta } from "./enums.js";

/**
 * Contrato `expx-eventos` v1 — a linha do rastro.
 *
 * Fonte única da regra das doze chaves. Ela já esteve escrita à mão em dois
 * lugares (`runx/hooks/testes/testar.sh` e `stackx/hooks/stackx/_rastro.py`),
 * e as duas listas divergiram do que as skills realmente gravam.
 */

/** As doze chaves obrigatórias, na ordem do contrato. */
export const CHAVES_EVENTO = [
  "ts",
  "expx_eventos",
  "trabalho_id",
  "ferramenta",
  "origem",
  "evento",
  "fase",
  "task",
  "agente",
  "resultado",
  "detalhe",
  "arquivos",
] as const;

/**
 * Chaves extras que o contrato declara, por skill. Extras existem porque a
 * alternativa — espremer a informação em `detalhe` — perde o dado para sempre.
 */
export const EXTRAS_EVENTO = ["hook", "faixa"] as const;

export const Origem = z.enum(["hook", "skill", "agente"]);

export const EventoNome = z.enum([
  "fase_iniciada",
  "fase_concluida",
  "task_iniciada",
  "task_concluida",
  "task_bloqueada",
  "suite_executada",
  "arquivo_alterado",
  "regra_violada",
  "acao_bloqueada",
  "agente_iniciado",
  "agente_concluido",
  "veredito_emitido",
  "commit_criado",
  "pr_aberto",
]);

export const Agente = z.enum([
  "principal",
  "auditor-plano",
  "revisor-testes",
  "qa",
  "investigador",
  "cartografo",
  "revisor-diff",
  "analista-de-conflito",
  "avaliador-de-raio",
]);

/** Timestamp do rastro: ISO-8601 em UTC, com `Z` (R4). */
export const TimestampUtc = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/, "ts deve ser AAAA-MM-DDTHH:MM:SSZ");

export const LinhaEvento = z
  .object({
    ts: TimestampUtc,
    expx_eventos: z.literal(1),
    trabalho_id: z.string().min(1),
    ferramenta: Ferramenta,
    origem: Origem,
    evento: EventoNome,
    fase: z.string().nullable(),
    task: z.string().nullable(),
    agente: Agente,
    resultado: z.string().min(1),
    detalhe: z.string(),
    arquivos: z.array(z.string()),
    hook: z.string().nullable().optional(),
    faixa: z.string().nullable().optional(),
  })
  // Extras declaradas passam; o que não é declarado é reportado por
  // `chavesDesconhecidas`, não rejeitado — o rastro nunca trava trabalho.
  .passthrough();

export type LinhaEvento = z.infer<typeof LinhaEvento>;

export type DefeitoEvento = {
  linha: number;
  motivo: string;
};

/**
 * As doze chaves estão CONTIDAS na linha?
 *
 * Contenção, nunca igualdade de conjunto: um validador estrito reprova as
 * skills que usam extras legítimas — foi assim que a verificação da runx
 * passou a reprovar toda linha da mergex e da legadox.
 */
export function chavesFaltando(obj: Record<string, unknown>): string[] {
  return CHAVES_EVENTO.filter((c) => !(c in obj));
}

/** Chaves presentes que o contrato não declara — aviso, não erro. */
export function chavesDesconhecidas(obj: Record<string, unknown>): string[] {
  const conhecidas = new Set<string>([...CHAVES_EVENTO, ...EXTRAS_EVENTO]);
  return Object.keys(obj).filter((k) => !conhecidas.has(k));
}

export type ResultadoRastro = {
  linhas: number;
  defeitos: DefeitoEvento[];
  desconhecidas: string[];
};

/** Valida um arquivo `.jsonl` inteiro. Linha em branco é ignorada. */
export function validarRastro(conteudo: string): ResultadoRastro {
  const defeitos: DefeitoEvento[] = [];
  const desconhecidas = new Set<string>();
  let linhas = 0;

  conteudo.split("\n").forEach((bruta, i) => {
    if (!bruta.trim()) return;
    linhas += 1;
    const n = i + 1;

    let obj: unknown;
    try {
      obj = JSON.parse(bruta);
    } catch {
      defeitos.push({ linha: n, motivo: "JSON invalido" });
      return;
    }
    if (typeof obj !== "object" || obj === null || Array.isArray(obj)) {
      defeitos.push({ linha: n, motivo: "a linha nao e um objeto JSON" });
      return;
    }

    const mapa = obj as Record<string, unknown>;
    const faltando = chavesFaltando(mapa);
    if (faltando.length > 0) {
      defeitos.push({
        linha: n,
        motivo: `chave omitida: ${faltando.join(", ")} (use null; R6)`,
      });
    }
    for (const k of chavesDesconhecidas(mapa)) desconhecidas.add(k);

    const r = LinhaEvento.safeParse(mapa);
    if (!r.success && faltando.length === 0) {
      const p = r.error.issues[0];
      const caminho = p?.path.join(".") ?? "";
      defeitos.push({
        linha: n,
        motivo: `${caminho ? caminho + ": " : ""}${p?.message ?? "estrutura invalida"}`,
      });
    }
  });

  return { linhas, defeitos, desconhecidas: [...desconhecidas].sort() };
}
