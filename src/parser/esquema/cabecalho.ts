import { z } from "zod";
import { ExpxTool } from "./enums.js";

/** Versão do contrato que este painel sabe ler (decisão D-09). */
export const VERSAO_SUPORTADA = 1;

/** Os dezenove kinds que o painel reconhece. */
export const KINDS = [
  "orquestrador",
  "sprint",
  "fases",
  "tasks",
  "bloqueios",
  "decisoes",
  "ocorrencia",
  "causa_raiz",
  "qa",
  "base_indice",
  "relatorio_tecnico",
  "relatorio_uso",
  "relatorios_indice",
  // buildx — estado do PROJETO, não de um trabalho. Por isso nenhum deles tem
  // `trabalho_id`: a chave que os costura é `projeto_id`.
  "projeto",
  "premissas",
  "mapa",
  "recursao",
  "validacao",
  "relatorio",
] as const;

export const Kind = z.enum(KINDS);
export type Kind = z.infer<typeof Kind>;

/**
 * Kinds sem `trabalho_id`. Exigir as quatro chaves cegamente rejeitaria
 * justamente as fontes que descrevem o sistema inteiro.
 *
 * Dois casos distintos: `relatorios_indice` é o índice de todos os trabalhos;
 * os seis da buildx são o estado do PROJETO, um nível acima de trabalho, e
 * usam `projeto_id` como chave.
 */
export const KINDS_SEM_TRABALHO_ID: readonly Kind[] = [
  "relatorios_indice",
  "projeto",
  "premissas",
  "mapa",
  "recursao",
  "validacao",
  "relatorio",
];

/**
 * O cabeçalho comum. `expx_schema` é validado como número; a rejeição por
 * versão futura é tratada à parte, com motivo próprio, para dar a mensagem
 * que o pedido exige em vez de um erro genérico de esquema.
 */
export const Cabecalho = z
  .object({
    expx_schema: z.number().int(),
    expx_tool: ExpxTool,
    kind: Kind,
    trabalho_id: z.string().trim().min(1).optional(),
  })
  .passthrough()
  .refine(
    (d) => KINDS_SEM_TRABALHO_ID.includes(d.kind) || typeof d.trabalho_id === "string",
    { message: "trabalho_id e obrigatorio neste kind", path: ["trabalho_id"] },
  );

export type Cabecalho = z.infer<typeof Cabecalho>;

/** O `kind` deste frontmatter, sem validar o resto — usado para rotear o esquema. */
export function lerKind(dados: unknown): Kind | null {
  if (typeof dados !== "object" || dados === null) return null;
  const k = (dados as Record<string, unknown>)["kind"];
  const r = Kind.safeParse(k);
  return r.success ? r.data : null;
}

/** A versão declarada, ou null quando ausente/não numérica. */
export function lerVersao(dados: unknown): number | null {
  if (typeof dados !== "object" || dados === null) return null;
  const v = (dados as Record<string, unknown>)["expx_schema"];
  return typeof v === "number" && Number.isInteger(v) ? v : null;
}
