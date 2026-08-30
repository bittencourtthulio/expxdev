import type { Projeto, TaskSituada, TrabalhoMontado } from "../projeto/montar.js";
import { estagioCoerenteCom } from "../esquema/enums.js";

/**
 * Violações do método — arquivos que o painel LEU e cujo conteúdo desobedece
 * uma regra. Distinto de rejeição, que é falha de leitura (decisão D-03).
 *
 * Cada regra aqui tem um escopo estreito de propósito. A definição de pronto
 * proíbe violação falsa, e todos os caminhos conhecidos para produzir uma
 * nascem de aplicar uma regra a quem ela não se destina:
 *
 *  - regressão cobrada de trabalho sprintx, ou de runx que não é bug;
 *  - critério de saída exigido de fase que não o declara por não existir;
 *  - dependência inexistente acusada sem olhar o escopo do trabalho.
 */

export const TipoViolacao = {
  TesteAusente: "teste_ausente",
  RegressaoAusente: "regressao_ausente",
  ConcluidaSemVerde: "concluida_sem_verde",
  ParalelaComDependencia: "paralela_com_dependencia",
  SemCriterioSaida: "sem_criterio_saida",
  BloqueioAntigo: "bloqueio_antigo",
  DependenciaInexistente: "dependencia_inexistente",
  CicloDependencia: "ciclo_dependencia",
  EstagioIncoerente: "estagio_incoerente",
  ChaveOmitida: "chave_omitida",
} as const;

export type TipoViolacao = (typeof TipoViolacao)[keyof typeof TipoViolacao];

export type Violacao = {
  tipo: TipoViolacao;
  trabalho_id: string;
  /** id da task/fase/bloqueio a que a violação se refere. */
  alvo: string;
  arquivo: string;
  linha: number | null;
  detalhe: string;
};

export type OpcoesConformidade = {
  /** "Hoje" entra como parâmetro: regra que lê o relógio não é testável (decisão D-16). */
  hoje: Date;
  /** Limite de dias para bloqueio antigo (decisão D-15). */
  diasBloqueio: number;
};

const vazio = (v: unknown): boolean =>
  v === null || v === undefined || (typeof v === "string" && v.trim() === "");

function diasEntre(inicio: string, fim: Date): number {
  const a = Date.parse(`${inicio}T00:00:00Z`);
  if (Number.isNaN(a)) return 0;
  const b = Date.UTC(fim.getUTCFullYear(), fim.getUTCMonth(), fim.getUTCDate());
  return Math.floor((b - a) / 86_400_000);
}

/** Todas as tasks de um trabalho, achatadas. */
function tasksDe(t: TrabalhoMontado): TaskSituada[] {
  return t.sprints.flatMap((s) => s.tasks);
}

function regrasDeTask(t: TrabalhoMontado, saida: Violacao[]): void {
  const tasks = tasksDe(t);

  for (const task of tasks) {
    const base = {
      trabalho_id: t.trabalho_id,
      alvo: task.id,
      arquivo: task.arquivo,
      linha: task.linha,
    };

    // 1. teste obrigatório ausente, null, ou string vazia/só espaços
    for (const campo of ["teste_integracao", "teste_funcional"] as const) {
      if (vazio(task[campo])) {
        saida.push({
          ...base,
          tipo: TipoViolacao.TesteAusente,
          detalhe: `${campo} esta ausente ou vazio`,
        });
      }
    }

    // 2. task concluída com suíte diferente de verde
    if (task.status === "concluida" && task.suite !== "verde") {
      saida.push({
        ...base,
        tipo: TipoViolacao.ConcluidaSemVerde,
        detalhe: `task concluida com suite ${task.suite}`,
      });
    }

    // 3. paralelizável com dependência declarada
    if (task.paralelizavel && task.depende_de.length > 0) {
      saida.push({
        ...base,
        tipo: TipoViolacao.ParalelaComDependencia,
        detalhe: `paralelizavel: true com depende_de ${task.depende_de.join(", ")}`,
      });
    }
  }

  /**
   * 4. bug sem teste de regressão na primeira task.
   *
   * ESCOPO ESTREITO DE PROPÓSITO: só trabalho runx com tipo_ocorrencia bug.
   * O campo teste_regressao nem existe no contrato de task da sprintx, então
   * cobrá-lo de um trabalho sprintx seria violação falsa (decisão D-07).
   */
  if (t.expx_tool === "runx" && t.tipo_ocorrencia === "bug" && tasks.length > 0) {
    // "primeira task" = menor id na ordem natural (decisão D-08), estável
    // independentemente de como a skill serializou a lista.
    const primeira = [...tasks].sort((a, b) => a.id.localeCompare(b.id))[0];
    if (primeira && vazio(primeira.teste_regressao)) {
      saida.push({
        tipo: TipoViolacao.RegressaoAusente,
        trabalho_id: t.trabalho_id,
        alvo: primeira.id,
        arquivo: primeira.arquivo,
        linha: primeira.linha,
        detalhe: "primeira task de um bug sem teste_regressao",
      });
    }
  }
}

function regrasDeEstrutura(t: TrabalhoMontado, saida: Violacao[], op: OpcoesConformidade): void {
  for (const s of t.sprints) {
    if (vazio(s.criterio_saida)) {
      saida.push({
        tipo: TipoViolacao.SemCriterioSaida,
        trabalho_id: t.trabalho_id,
        alvo: s.sprint_id,
        arquivo: s.arquivo ?? t.arquivo,
        linha: s.linha,
        detalhe: "sprint sem criterio_saida",
      });
    }
    for (const f of s.fases) {
      if (vazio(f.criterio_saida)) {
        saida.push({
          tipo: TipoViolacao.SemCriterioSaida,
          trabalho_id: t.trabalho_id,
          alvo: f.id,
          arquivo: f.arquivo,
          linha: f.linha,
          detalhe: "fase sem criterio_saida",
        });
      }
    }
  }

  for (const b of t.bloqueios) {
    if (!b.aberto) continue;
    const dias = diasEntre(b.aberto_em, op.hoje);
    if (dias > op.diasBloqueio) {
      saida.push({
        tipo: TipoViolacao.BloqueioAntigo,
        trabalho_id: t.trabalho_id,
        alvo: b.id,
        arquivo: b.arquivo,
        linha: b.linha,
        detalhe: `aberto ha ${dias} dias (limite ${op.diasBloqueio})`,
      });
    }
  }
}

function regrasDeReferencia(t: TrabalhoMontado, saida: Violacao[]): void {
  const tasks = tasksDe(t);
  const ids = new Set(tasks.map((x) => x.id));

  for (const task of tasks) {
    for (const dep of task.depende_de) {
      if (!ids.has(dep)) {
        saida.push({
          tipo: TipoViolacao.DependenciaInexistente,
          trabalho_id: t.trabalho_id,
          alvo: task.id,
          arquivo: task.arquivo,
          linha: task.linha,
          detalhe: `depende_de aponta ${dep}, que nao existe neste trabalho`,
        });
      }
    }
  }

  // ciclo: busca em profundidade com marcação de cor, sem recursão infinita
  const porId = new Map(tasks.map((x) => [x.id, x]));
  const cor = new Map<string, 0 | 1 | 2>();
  const emCiclo = new Set<string>();

  function visita(id: string, pilha: string[]): void {
    cor.set(id, 1);
    for (const dep of porId.get(id)?.depende_de ?? []) {
      if (!porId.has(dep)) continue;
      if (cor.get(dep) === 1) {
        for (const x of [...pilha.slice(pilha.indexOf(dep)), dep]) emCiclo.add(x);
        continue;
      }
      if ((cor.get(dep) ?? 0) === 0) visita(dep, [...pilha, dep]);
    }
    cor.set(id, 2);
  }
  for (const id of porId.keys()) {
    if ((cor.get(id) ?? 0) === 0) visita(id, [id]);
  }
  for (const id of [...emCiclo].sort()) {
    const task = porId.get(id);
    saida.push({
      tipo: TipoViolacao.CicloDependencia,
      trabalho_id: t.trabalho_id,
      alvo: id,
      arquivo: task?.arquivo ?? t.arquivo,
      linha: task?.linha ?? null,
      detalhe: "task participa de um ciclo de dependencias",
    });
  }

  // estágio coerente com a ferramenta que gravou (decisão D-10)
  if (!estagioCoerenteCom(t.expx_tool, t.estagio)) {
    saida.push({
      tipo: TipoViolacao.EstagioIncoerente,
      trabalho_id: t.trabalho_id,
      alvo: t.trabalho_id,
      arquivo: t.arquivo,
      linha: t.linhas.get("estagio") ?? null,
      detalhe: `expx_tool ${t.expx_tool} com estagio ${t.estagio}`,
    });
  }
}

/**
 * R6 — chave nunca omitida.
 *
 * A omissão foi colhida na leitura, onde o dado cru ainda existia; aqui ela só
 * vira violação. É violação e não rejeição por decisão: o painel existe para
 * mostrar o defeito, e rejeitar faria o trabalho sumir da tela justamente
 * quando tem um problema (D-04, lacuna L-05).
 */
function regrasDeChaveOmitida(projeto: Projeto, saida: Violacao[]): void {
  for (const o of projeto.omitidas) {
    const partes = o.caminho.split(".");
    const campo = partes[partes.length - 1] ?? o.caminho;
    saida.push({
      tipo: TipoViolacao.ChaveOmitida,
      trabalho_id: o.trabalho_id,
      alvo: o.caminho,
      arquivo: o.arquivo,
      linha: o.linha,
      detalhe: `${campo} nao esta no arquivo; a chave e obrigatoria mesmo vazia (use null ou [])`,
    });
  }
}

export function verificarConformidade(projeto: Projeto, op: OpcoesConformidade): Violacao[] {
  const saida: Violacao[] = [];
  for (const t of projeto.trabalhos) {
    regrasDeTask(t, saida);
    regrasDeEstrutura(t, saida, op);
    regrasDeReferencia(t, saida);
  }
  regrasDeChaveOmitida(projeto, saida);
  return saida;
}
