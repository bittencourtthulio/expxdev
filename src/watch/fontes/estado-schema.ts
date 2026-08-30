import { z } from "zod";
import { Estagio, Ferramenta } from "../../parser/esquema/enums.js";

/**
 * Contrato `expx-estado` v1 — o arquivo que a barra de status lê.
 *
 * Primeiro leitor deste contrato no repositório: a busca por
 * `estado.json|expx_estado` em `src/`, `ui/` e `nucleo/` não devolvia nada.
 *
 * Os enums vêm do `expx-schema` de propósito. A regra 7 do contrato manda que
 * sejam os MESMOS ("minúsculo, sem acento; `e3`, não `E3`"), e redeclará-los
 * aqui criaria duas listas que divergem com o tempo — foi exatamente assim que
 * as listas de chaves do rastro divergiram entre duas skills
 * (ver `src/parser/esquema/evento.ts`).
 */

/** A versão que este leitor entende. Diferente disso é degradado (D-12). */
export const VERSAO_ESTADO = 1;

/**
 * As quinze chaves do contrato, na ordem do documento.
 *
 * Exportada porque o teste percorre a lista removendo uma por vez: sem ela, a
 * verificação da R6 seria quinze blocos copiados.
 */
export const CHAVES_ESTADO = [
  "expx_estado",
  "atualizado_em",
  "trabalho",
  "ferramenta",
  "titulo_curto",
  "fase",
  "task",
  "tasks_concluidas",
  "tasks_total",
  "raio",
  "orcamento_arquivos",
  "orcamento_linhas",
  "branch",
  "pr_estado",
  "bloqueios",
] as const;

/** Faixa de raio do modo legado. `null` fora dele (regra 2 do contrato). */
export const Raio = z.enum(["baixo", "medio", "alto"]);

/** Timestamp do contrato: ISO-8601 em UTC, com `Z` (R4). */
const TimestampUtc = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
    "atualizado_em deve ser AAAA-MM-DDTHH:MM:SSZ",
  );

/**
 * Nenhum campo é `.optional()`: a regra 2 do contrato ("chave nunca omitida")
 * é o que permite ao leitor distinguir "não se aplica" de "esqueceram de
 * escrever". Ausente é `null`, e `null` é um valor presente.
 *
 * Sem `.passthrough()`: ao contrário do rastro, que declara chaves extras por
 * skill, o `expx-estado` fixa quinze chaves e um limite de 1 KB. Chave a mais
 * aqui é sinal de escritor fora do contrato, não de extensão legítima.
 */
export const EstadoExpx = z.object({
  expx_estado: z.literal(VERSAO_ESTADO),
  atualizado_em: TimestampUtc,
  trabalho: z.string().min(1).nullable(),
  ferramenta: Ferramenta.nullable(),
  titulo_curto: z.string().nullable(),
  fase: Estagio.nullable(),
  task: z.string().nullable(),
  tasks_concluidas: z.number().int().min(0),
  tasks_total: z.number().int().min(0),
  raio: Raio.nullable(),
  orcamento_arquivos: z.string().nullable(),
  orcamento_linhas: z.string().nullable(),
  branch: z.string().nullable(),
  pr_estado: z.string().nullable(),
  bloqueios: z.number().int().min(0),
});

export type EstadoExpx = z.infer<typeof EstadoExpx>;
