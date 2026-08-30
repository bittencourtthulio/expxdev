import { z } from "zod";

/**
 * Enums do contrato expx-schema v1.
 *
 * Regra 3 do contrato: todo valor de enum é minúsculo e sem acento.
 * Duas distinções que o painel trata como coisas diferentes, e que um enum
 * único apagaria em silêncio:
 *
 *  - `estagio` (f1..f6, e1..e5) é a máquina de estados do método. Não confundir
 *    com o id de FASE do plano (`F-NN.M`), que vive em outro namespace.
 *  - `status` de task usa o vocabulário feminino (`concluida`, `bloqueada`);
 *    status de trabalho, sprint e fase usa o masculino (`concluido`, `bloqueado`).
 */

/**
 * `expx_tool` — quem ESCREVEU um artefato de estado. A sprintx, a runx e a
 * buildx escrevem frontmatter `expx-schema`; as demais skills do método não têm
 * kind próprio nesse contrato.
 *
 * A buildx entrou depois das outras duas: ela grava o estado do PROJETO
 * (`projeto`, `mapa`, `premissas`, `recursao`, `validacao`, `relatorio`),
 * enquanto sprintx e runx gravam o estado de um TRABALHO. São níveis
 * diferentes, e por isso a buildx tem estágios próprios (`b1`..`b6`) em vez de
 * reusar os de feature ou de ocorrência.
 *
 * Não confundir com `ferramenta`, do rastro de eventos (`Ferramenta`, abaixo),
 * que aceita as oito. Tratar os dois como o mesmo enum rejeita o rastro de
 * cinco skills.
 */
export const ExpxTool = z.enum(["sprintx", "runx", "buildx"]);
export type ExpxTool = z.infer<typeof ExpxTool>;

/** `ferramenta` — quem EMITIU um evento no rastro. Todas as skills emitem. */
export const Ferramenta = z.enum([
  "sprintx",
  "runx",
  "mergex",
  "legadox",
  "stackx",
  "memox",
  "prodx",
  "buildx",
]);
export type Ferramenta = z.infer<typeof Ferramenta>;

export const TipoTrabalho = z.enum(["feature", "ocorrencia"]);
export type TipoTrabalho = z.infer<typeof TipoTrabalho>;

export const TipoOcorrencia = z.enum([
  "bug",
  "melhoria-ui",
  "melhoria-ux",
  "novo-relatorio",
  "regra-de-calculo",
  "campo-novo",
  "outro",
]);
export type TipoOcorrencia = z.infer<typeof TipoOcorrencia>;

/** Estágios da sprintx: F1 ingestão → F6 execução. */
export const ESTAGIOS_SPRINTX = ["f1", "f2", "f3", "f4", "f5", "f6"] as const;

/** Estágios da runx: E1 investigação → E5 relatório. */
export const ESTAGIOS_RUNX = ["e1", "e2", "e3", "e4", "e5"] as const;

/** Estágios da buildx: B1 concepção → B6 validação. */
export const ESTAGIOS_BUILDX = ["b1", "b2", "b3", "b4", "b5", "b6"] as const;

export const Estagio = z.enum([...ESTAGIOS_SPRINTX, ...ESTAGIOS_RUNX, ...ESTAGIOS_BUILDX]);
export type Estagio = z.infer<typeof Estagio>;

/** Status de trabalho, sprint e fase — vocabulário masculino. */
export const StatusTrabalho = z.enum(["nao_iniciado", "em_andamento", "bloqueado", "concluido"]);
export type StatusTrabalho = z.infer<typeof StatusTrabalho>;

/** Status de task — vocabulário feminino. */
export const StatusTask = z.enum(["pendente", "em_andamento", "concluida", "bloqueada"]);
export type StatusTask = z.infer<typeof StatusTask>;

/** Status de decisão — vocabulário próprio (kind `decisoes`, só sprintx). */
export const StatusDecisao = z.enum(["fechada", "pendente"]);
export type StatusDecisao = z.infer<typeof StatusDecisao>;

export const Suite = z.enum(["verde", "vermelha", "nao_executada"]);
export type Suite = z.infer<typeof Suite>;

export const Veredito = z.enum(["aprovado", "reprovado"]);
export type Veredito = z.infer<typeof Veredito>;

/**
 * `modo` da buildx — como o projeto inteiro é conduzido. Escolhido na pergunta
 * única, que é a única que a buildx faz ao usuário.
 */
export const ModoBuildx = z.enum(["autonomo", "briefing"]);
export type ModoBuildx = z.infer<typeof ModoBuildx>;

/**
 * `veredito` da validação da buildx (B6). Enum próprio, e não o `Veredito` de
 * dois valores: a buildx precisa distinguir a entrega íntegra da entrega com
 * pendência declarada, e apagar essa diferença esconderia justamente o que o
 * relatório final existe para mostrar.
 */
export const VereditoBuildx = z.enum(["aprovado", "aprovado_com_pendencia", "reprovado"]);
export type VereditoBuildx = z.infer<typeof VereditoBuildx>;

export const Severidade = z.enum(["alta", "media", "baixa"]);
export type Severidade = z.infer<typeof Severidade>;

export const ModoCausaRaiz = z.enum(["causa_raiz", "analise_impacto"]);
export type ModoCausaRaiz = z.infer<typeof ModoCausaRaiz>;

export const Evidencia = z.enum(["teste_falho", "log", "codigo"]);
export type Evidencia = z.infer<typeof Evidencia>;

/**
 * Data ISO `AAAA-MM-DD` (regra 4 do contrato).
 *
 * O js-yaml (dentro do gray-matter) resolve um escalar `2026-08-20` como
 * objeto Date, não como string — então o parser recebe as duas formas
 * dependendo de o valor estar ou não entre aspas no arquivo. Normalizamos
 * para a string ISO, que é o que o contrato define e o painel exibe.
 */
export const DataIso = z
  .union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "data deve ser AAAA-MM-DD"),
    z.date().transform((d) => d.toISOString().slice(0, 10)),
  ]);

/** Texto de uma linha, não vazio (regra 8 do contrato). */
export const TextoUmaLinha = z.string().trim().min(1).refine((s) => !s.includes("\n"), {
  message: "campo de texto do YAML e de uma linha",
});

/**
 * Os estágios de cada ferramenta. Mapa explícito, e não um ternário: com três
 * ferramentas, `tool === "sprintx" ? ... : ...` mandaria a buildx para os
 * estágios da runx em silêncio, e a violação apareceria como estágio incoerente
 * num arquivo correto.
 */
const ESTAGIOS_POR_TOOL: Record<ExpxTool, readonly string[]> = {
  sprintx: ESTAGIOS_SPRINTX,
  runx: ESTAGIOS_RUNX,
  buildx: ESTAGIOS_BUILDX,
};

/** Um estágio pertence à ferramenta que gravou o arquivo? (decisão D-10) */
export function estagioCoerenteCom(tool: ExpxTool, estagio: Estagio): boolean {
  return ESTAGIOS_POR_TOOL[tool].includes(estagio);
}
