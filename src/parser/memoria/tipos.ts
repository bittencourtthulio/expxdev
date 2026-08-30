import { z } from "zod";

/**
 * A projeção enxuta do índice do memox.
 *
 * O painel NÃO serve o `indice.json` como veio do disco (decisão D-04). Duas
 * chaves do índice ficam de fora de propósito:
 *
 *   `por_termo`   — índice invertido para a busca textual do motor. Na tela é
 *                   peso morto, e o painel difunde o estado INTEIRO a cada
 *                   mudança de arquivo (decisão D-28), então carregá-lo
 *                   multiplicaria cada difusão sem ganho nenhum.
 *   `trabalhos`   — o registro completo de cada trabalho, que o painel já monta
 *                   por conta própria a partir de `docs/relatorios/`.
 *
 * O schema existe para validar em RUNTIME. Não é preciosismo: `tsconfig.json`
 * exclui `**\/*.test.ts` e o vitest não faz typecheck, e a fixture da UI usa
 * `as unknown as Estado` — nenhum dos dois acusaria um formato errado.
 */

/** Uma entrada do índice: um trabalho que tocou um arquivo ou um módulo. */
export const EntradaSchema = z.object({
  trabalho_id: z.string(),
  titulo: z.string().nullable(),
  data: z.string().nullable(),
  tipo: z.string().nullable(),
  ferramenta: z.string().nullable(),
  causa: z.string().nullable(),
  papel: z.string(),
  artefato: z.string(),
});
export type Entrada = z.infer<typeof EntradaSchema>;

/**
 * Uma regressão comprovada. Os dois caminhos de origem são o que torna a
 * afirmação conferível: quem recebe o sinal pode abrir os dois e julgar.
 */
export const RegressaoSchema = z.object({
  arquivos: z.array(z.string()),
  trabalho_anterior: z.string(),
  data_anterior: z.string().nullable(),
  trabalho_posterior: z.string(),
  data_posterior: z.string().nullable(),
  evidencia: z.string(),
  origem_causa: z.string().nullable(),
  origem_alteracao: z.string().nullable(),
});
export type Regressao = z.infer<typeof RegressaoSchema>;

/**
 * Um vínculo que NÃO virou regressão, com o motivo. Isso não é sobra: é a
 * prova de que o índice não inventa relação. Dois trabalhos tocando o mesmo
 * arquivo é um fato; dizer que um causou o outro é uma afirmação.
 */
export const CoincidenciaSchema = z.object({
  arquivos: z.array(z.string()),
  trabalhos: z.array(z.string()),
  motivo: z.string(),
});
export type Coincidencia = z.infer<typeof CoincidenciaSchema>;

/** Um arquivo com os sinais que o índice derivou sobre ele. */
export const ArquivoDeRiscoSchema = z.object({
  arquivo: z.string(),
  trabalhos: z.number(),
  ultimo_trabalho_em: z.string().nullable(),
  reprovacoes_qa: z.number(),
  regressoes: z.number(),
  zona_de_risco: z.string().nullable(),
  divida: z.string().nullable(),
  risco_divida: z.string().nullable(),
  faixa_atencao: z.string().nullable(),
  entradas: z.array(EntradaSchema),
});
export type ArquivoDeRisco = z.infer<typeof ArquivoDeRiscoSchema>;

export const ModuloSchema = z.object({
  modulo: z.string(),
  trabalhos: z.number(),
  ultimo_trabalho_em: z.string().nullable(),
  reprovacoes_qa: z.number(),
  regressoes: z.number(),
  arquivos: z.array(z.string()),
});
export type Modulo = z.infer<typeof ModuloSchema>;

/** Artefato onde o memox detectou segredo. O valor já foi redigido na origem. */
export const ContaminadoSchema = z.object({
  artefato: z.string(),
  tipos: z.array(z.string()),
});
export type Contaminado = z.infer<typeof ContaminadoSchema>;

export const MemoriaSchema = z.object({
  gerado_em: z.string(),
  versao: z.number(),
  totais: z.object({
    trabalhos: z.number(),
    arquivos: z.number(),
    modulos: z.number(),
    regressoes: z.number(),
    coincidencias: z.number(),
    artefatos_contaminados: z.number(),
  }),
  arquivos_de_risco: z.array(ArquivoDeRiscoSchema),
  regressoes: z.array(RegressaoSchema),
  coincidencias: z.array(CoincidenciaSchema),
  contaminados: z.array(ContaminadoSchema),
  modulos: z.array(ModuloSchema),
});
export type Memoria = z.infer<typeof MemoriaSchema>;
