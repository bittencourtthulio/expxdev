import { z } from "zod";
import {
  DataIso,
  Estagio,
  Evidencia,
  ExpxTool,
  ModoBuildx,
  ModoCausaRaiz,
  Severidade,
  StatusDecisao,
  StatusTask,
  StatusTrabalho,
  Suite,
  TextoUmaLinha,
  TipoOcorrencia,
  TipoTrabalho,
  Veredito,
  VereditoBuildx,
} from "./enums.js";
import { Kind, VERSAO_SUPORTADA } from "./cabecalho.js";

const comum = {
  expx_schema: z.literal(VERSAO_SUPORTADA),
  expx_tool: ExpxTool,
  trabalho_id: z.string().trim().min(1),
};

const nulavel = <T extends z.ZodTypeAny>(t: T) => t.nullable();

/**
 * O campo `arquivos` da task tem DUAS formas nas fontes (lacuna L-04):
 * o contrato declara lista plana, as duas skills gravam `{cria, altera}`.
 * A decisão D-01 aceita as duas e normaliza para o mapa — é o superconjunto,
 * então nenhum arquivo real se perde, seja qual for o lado que se atualize.
 */
export const Arquivos = z
  .union([
    z.object({
      cria: z.array(z.string()).default([]),
      altera: z.array(z.string()).default([]),
    }),
    z.array(z.string()).transform((lista) => ({ cria: lista, altera: [] as string[] })),
  ])
  .transform((v) => ({ cria: v.cria ?? [], altera: v.altera ?? [] }));

export type Arquivos = z.infer<typeof Arquivos>;

export const Task = z.object({
  id: z.string(),
  titulo: z.string(),
  fase: z.string(),
  status: StatusTask,
  objetivo: z.string(),
  arquivos: Arquivos,
  /**
   * Obrigatório só na primeira task de bug da runx; ausente nos arquivos da
   * sprintx, que não lista o campo no contrato de task (decisão D-07).
   */
  teste_regressao: nulavel(z.string()).optional(),
  /** Obrigatórios e não vazios — a ausência é violação, não rejeição (D-03/D-04). */
  teste_integracao: nulavel(z.string()).optional(),
  teste_funcional: nulavel(z.string()).optional(),
  criterio_aceite: nulavel(z.string()).optional(),
  depende_de: z.array(z.string()).default([]),
  paralelizavel: z.boolean(),
  concluida_em: nulavel(DataIso),
  suite: Suite,
});
export type Task = z.infer<typeof Task>;

export const Orquestrador = z.object({
  ...comum,
  kind: z.literal("orquestrador"),
  titulo: z.string(),
  tipo_trabalho: TipoTrabalho,
  tipo_ocorrencia: nulavel(TipoOcorrencia),
  estagio: Estagio,
  status: StatusTrabalho,
  criado_em: DataIso,
  atualizado_em: DataIso,
  concluido_em: nulavel(DataIso),
  sprints: z.array(z.string()).default([]),
  caminho_critico: z.array(z.string()).default([]),
});

export const Sprint = z.object({
  ...comum,
  kind: z.literal("sprint"),
  sprint_id: z.string(),
  titulo: z.string(),
  status: StatusTrabalho,
  criterio_saida: nulavel(z.string()).optional(),
  fases: z.array(z.string()).default([]),
  riscos: z.array(z.string()).default([]),
  atualizado_em: DataIso,
});

export const Fase = z.object({
  id: z.string(),
  titulo: z.string(),
  status: StatusTrabalho,
  criterio_saida: nulavel(z.string()).optional(),
  paralelizavel: z.boolean(),
  paralela_com: z.array(z.string()).default([]),
  tasks: z.array(z.string()).default([]),
});
export type Fase = z.infer<typeof Fase>;

export const Fases = z.object({
  ...comum,
  kind: z.literal("fases"),
  sprint_id: z.string(),
  atualizado_em: DataIso,
  fases: z.array(Fase).default([]),
});

export const Tasks = z.object({
  ...comum,
  kind: z.literal("tasks"),
  sprint_id: z.string(),
  atualizado_em: DataIso,
  tasks: z.array(Task).default([]),
});

export const Bloqueio = z.object({
  id: z.string(),
  task: nulavel(z.string()),
  aberto_em: DataIso,
  resolvido_em: nulavel(DataIso),
  descricao: z.string(),
});
export type Bloqueio = z.infer<typeof Bloqueio>;

export const Bloqueios = z.object({
  ...comum,
  kind: z.literal("bloqueios"),
  atualizado_em: DataIso,
  bloqueios: z.array(Bloqueio).default([]),
});

/** Kind exclusivo da sprintx; não consta do contrato (lacuna L-02, decisão D-02). */
export const Decisoes = z.object({
  ...comum,
  kind: z.literal("decisoes"),
  atualizado_em: DataIso,
  decisoes: z
    .array(
      z.object({
        id: z.string(),
        decisao: z.string(),
        alternativa_descartada: nulavel(z.string()),
        motivo: nulavel(z.string()),
        status: StatusDecisao,
        bloqueante: z.boolean(),
      }),
    )
    .default([]),
});

export const Ocorrencia = z.object({
  ...comum,
  kind: z.literal("ocorrencia"),
  titulo: z.string(),
  tipo_ocorrencia: TipoOcorrencia,
  recebido_em: DataIso,
  origem: nulavel(z.string()),
  tem_reproducao: z.boolean(),
  modulo_afetado: z.array(z.string()).default([]),
  /** O contrato não lista a chave neste kind; a runx lista (decisão D-32). */
  atualizado_em: DataIso.optional(),
});

export const CausaRaiz = z.object({
  ...comum,
  kind: z.literal("causa_raiz"),
  modo: ModoCausaRaiz,
  /** null quando `modo: analise_impacto` — não há causa a comprovar. */
  comprovada: nulavel(z.boolean()),
  evidencia: nulavel(Evidencia),
  arquivos_impactados: z.array(z.string()).default([]),
  decisoes: z
    .array(
      z.object({
        id: z.string(),
        decisao: z.string(),
        alternativa_descartada: nulavel(z.string()).optional(),
        motivo: nulavel(z.string()).optional(),
      }),
    )
    .default([]),
  atualizado_em: DataIso,
});

export const Qa = z.object({
  ...comum,
  kind: z.literal("qa"),
  veredito: Veredito,
  executado_em: DataIso,
  achados: z
    .array(
      z.object({
        severidade: Severidade,
        arquivo: nulavel(z.string()).optional(),
        problema: z.string(),
        correcao_sugerida: nulavel(z.string()).optional(),
      }),
    )
    .default([]),
  atualizado_em: DataIso.optional(),
});

export const BaseIndice = z.object({
  ...comum,
  kind: z.literal("base_indice"),
  atualizado_em: DataIso,
  areas: z
    .array(z.object({ arquivo: z.string(), titulo: z.string(), lacunas: z.number().int() }))
    .default([]),
});

export const RelatorioTecnico = z.object({
  ...comum,
  kind: z.literal("relatorio_tecnico"),
  titulo: z.string(),
  tipo_ocorrencia: TipoOcorrencia,
  fechado_em: DataIso,
  modulo_afetado: z.array(z.string()).default([]),
  arquivos_alterados: z.array(z.string()).default([]),
  testes_adicionados: z.number().int(),
});

/** Sem `arquivos_alterados` nem `testes_adicionados`: é o arquivo do cliente. */
export const RelatorioUso = z.object({
  ...comum,
  kind: z.literal("relatorio_uso"),
  titulo: z.string(),
  tipo_ocorrencia: TipoOcorrencia,
  fechado_em: DataIso,
  modulo_afetado: z.array(z.string()).default([]),
});

/** Único kind sem `trabalho_id`: o índice é do sistema inteiro. */
export const RelatoriosIndice = z.object({
  expx_schema: z.literal(VERSAO_SUPORTADA),
  expx_tool: ExpxTool,
  kind: z.literal("relatorios_indice"),
  atualizado_em: DataIso,
  entradas: z
    .array(
      z.object({
        data: DataIso,
        oc_id: z.string(),
        tipo: z.string(),
        modulo: nulavel(z.string()).optional(),
        resumo: z.string(),
        pasta: z.string(),
      }),
    )
    .default([]),
});

/**
 * Os seis kinds da buildx — estado do PROJETO, um nível acima de trabalho.
 *
 * Nenhum usa `comum`: aquele bloco exige `trabalho_id`, e a buildx costura os
 * artefatos por `projeto_id`. Um projeto tem N trabalhos (um por feature do
 * mapa), então tratar os dois como a mesma chave apagaria justamente a relação
 * que a buildx existe para manter.
 */
const comumProjeto = {
  expx_schema: z.literal(VERSAO_SUPORTADA),
  expx_tool: ExpxTool,
  projeto_id: z.string().trim().min(1),
};

/** O escopo completo: o que foi pedido, o que foi descoberto, o que foi descartado. */
export const Projeto = z.object({
  ...comumProjeto,
  kind: z.literal("projeto"),
  titulo: z.string(),
  modo: ModoBuildx,
  criado_em: DataIso,
  atualizado_em: DataIso,
  etapa: Estagio,
  total_features: nulavel(z.number().int()).optional(),
  features_entregues: z.number().int().default(0),
  features_bloqueadas: z.number().int().default(0),
  ciclos_recursao: z.number().int().default(0),
});

/** Toda decisão tomada em nome do humano, com o que a invalidaria. */
export const Premissas = z.object({
  ...comumProjeto,
  kind: z.literal("premissas"),
  atualizado_em: DataIso,
  total: z.number().int().default(0),
});

/** As features, em ordem de dependência. */
export const Mapa = z.object({
  ...comumProjeto,
  kind: z.literal("mapa"),
  atualizado_em: DataIso,
  total_features: z.number().int().default(0),
  pendentes: z.number().int().default(0),
  em_andamento: z.number().int().default(0),
  entregues: z.number().int().default(0),
  bloqueadas: z.number().int().default(0),
});

/** Pendências por ciclo, e o teto que impede o laço B4 → B5 de girar em falso. */
export const Recursao = z.object({
  ...comumProjeto,
  kind: z.literal("recursao"),
  atualizado_em: DataIso,
  ciclo_atual: z.number().int().default(1),
  teto_ciclos: z.number().int().default(3),
  pendencias_abertas: z.number().int().default(0),
  pendencias_resolvidas: z.number().int().default(0),
});

/** A conferência final do construído contra o mapa. */
export const Validacao = z.object({
  ...comumProjeto,
  kind: z.literal("validacao"),
  data: DataIso,
  veredito: VereditoBuildx,
  itens_conferidos: z.number().int().default(0),
  itens_atendidos: z.number().int().default(0),
  itens_pendentes: z.number().int().default(0),
});

/** O que o usuário lê no fim — a primeira coisa desde a pergunta única. */
export const Relatorio = z.object({
  ...comumProjeto,
  kind: z.literal("relatorio"),
  data: DataIso,
  modo: ModoBuildx,
  features_entregues: z.number().int().default(0),
  prs_abertos: z.number().int().default(0),
  pendencias_declaradas: z.number().int().default(0),
  premissas_registradas: z.number().int().default(0),
  ciclos_recursao: z.number().int().default(0),
});

const POR_KIND = {
  orquestrador: Orquestrador,
  sprint: Sprint,
  fases: Fases,
  tasks: Tasks,
  bloqueios: Bloqueios,
  decisoes: Decisoes,
  ocorrencia: Ocorrencia,
  causa_raiz: CausaRaiz,
  qa: Qa,
  base_indice: BaseIndice,
  relatorio_tecnico: RelatorioTecnico,
  relatorio_uso: RelatorioUso,
  relatorios_indice: RelatoriosIndice,
  projeto: Projeto,
  premissas: Premissas,
  mapa: Mapa,
  recursao: Recursao,
  validacao: Validacao,
  relatorio: Relatorio,
} as const;

export function esquemaDoKind(kind: Kind): (typeof POR_KIND)[Kind] {
  return POR_KIND[kind];
}

export type EstadoPorKind = {
  [K in Kind]: z.infer<(typeof POR_KIND)[K]>;
};
export { TextoUmaLinha };
