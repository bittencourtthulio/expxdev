import { basename, dirname, join } from "node:path";
import { descobrirTrabalhos, type Trabalho } from "../descoberta/trabalhos.js";
import type { Aceito, Rejeicao } from "../leitura/rejeicao.js";
import type { Fase as FaseYaml, Task, Bloqueio } from "../esquema/kinds.js";
import type { StatusTrabalho } from "../esquema/enums.js";

/** Uma task já situada no seu arquivo, para a conformidade poder apontar arquivo e linha. */
export type TaskSituada = Task & {
  arquivo: string;
  linha: number | null;
  trabalho_id: string;
  sprint_id: string;
};

export type FaseMontada = Omit<FaseYaml, "tasks"> & {
  tasks: TaskSituada[];
  progresso: number;
  arquivo: string;
  linha: number | null;
};

export type SprintMontada = {
  sprint_id: string;
  titulo: string;
  status: StatusTrabalho;
  criterio_saida: string | null;
  riscos: string[];
  fases: FaseMontada[];
  tasks: TaskSituada[];
  progresso: number;
  arquivo: string | null;
  linha: number | null;
};

export type TrabalhoMontado = Omit<Trabalho, "sprints"> & {
  /** As pastas sprint-NN encontradas no disco, já montadas (o Trabalho cru traz só os ids). */
  sprints: SprintMontada[];
  /** A lista `sprints:` declarada no ORQUESTRADOR, preservada para conferência. */
  sprints_declaradas: string[];
  progresso: number;
  bloqueios: BloqueioSituado[];
};

export type BloqueioSituado = Bloqueio & {
  aberto: boolean;
  trabalho_id: string;
  arquivo: string;
  linha: number | null;
};

export type EntradaHistorico = {
  oc_id: string;
  titulo: string;
  tipo_ocorrencia: string;
  fechado_em: string;
  modulo_afetado: string[];
  pasta: string;
  tecnico: Record<string, unknown> | null;
  uso: Record<string, unknown> | null;
};

/** Frontmatter mais a prosa, que é o que o painel renderiza no relatório. */
function comCorpo(a: Aceito | undefined): Record<string, unknown> | null {
  return a ? { ...a.dados, _corpo: a.corpo } : null;
}

export type Projeto = {
  raiz: string;
  trabalhos: TrabalhoMontado[];
  bloqueios: BloqueioSituado[];
  historico: EntradaHistorico[];
  rejeicoes: Rejeicao[];
  lido_em: string;
};

function porPasta(aceitos: Aceito[]): Map<string, Aceito[]> {
  const m = new Map<string, Aceito[]>();
  for (const a of aceitos) {
    const d = dirname(a.arquivo);
    const lista = m.get(d);
    if (lista) lista.push(a);
    else m.set(d, [a]);
  }
  return m;
}

/** Progresso = fração de tasks concluídas. Sem tasks, 0 — nunca divide por zero. */
function progressoDe(tasks: TaskSituada[]): number {
  if (tasks.length === 0) return 0;
  return tasks.filter((t) => t.status === "concluida").length / tasks.length;
}

function montarSprints(trabalho: Trabalho, mapa: Map<string, Aceito[]>): SprintMontada[] {
  const sprints: SprintMontada[] = [];

  // Sprints são descobertas varrendo as pastas do disco (decisão D-14):
  // uma pasta sprint-NN ausente da lista do orquestrador ainda é real.
  const pastas = [...mapa.keys()]
    .filter((p) => dirname(p) === trabalho.pasta && /^sprint-\d+$/.test(basename(p)))
    .sort();

  for (const pasta of pastas) {
    const arquivos = mapa.get(pasta) ?? [];
    const aSprint = arquivos.find((a) => a.kind === "sprint");
    const aFases = arquivos.find((a) => a.kind === "fases");
    const aTasks = arquivos.find((a) => a.kind === "tasks");

    const tasksBrutas = (aTasks?.dados["tasks"] as Task[] | undefined) ?? [];
    const tasks: TaskSituada[] = tasksBrutas.map((t, i) => ({
      ...t,
      arquivo: aTasks?.arquivo ?? join(pasta, "tasks.md"),
      linha: aTasks?.linhas.get(`tasks.${i}`) ?? null,
      trabalho_id: trabalho.trabalho_id,
      sprint_id: basename(pasta),
    }));

    const fasesBrutas = (aFases?.dados["fases"] as FaseYaml[] | undefined) ?? [];
    const fases: FaseMontada[] = fasesBrutas.map((f, i) => {
      // o vínculo autoritativo é o campo `fase` da task (decisão D-13)
      const minhas = tasks.filter((t) => t.fase === f.id);
      return {
        ...f,
        tasks: minhas,
        progresso: progressoDe(minhas),
        arquivo: aFases?.arquivo ?? join(pasta, "fases.md"),
        linha: aFases?.linhas.get(`fases.${i}`) ?? null,
      };
    });

    sprints.push({
      sprint_id: (aSprint?.dados["sprint_id"] as string | undefined) ?? basename(pasta),
      titulo: (aSprint?.dados["titulo"] as string | undefined) ?? basename(pasta),
      status: (aSprint?.dados["status"] as StatusTrabalho | undefined) ?? "nao_iniciado",
      criterio_saida: (aSprint?.dados["criterio_saida"] as string | null | undefined) ?? null,
      riscos: (aSprint?.dados["riscos"] as string[] | undefined) ?? [],
      fases,
      tasks,
      progresso: progressoDe(tasks),
      arquivo: aSprint?.arquivo ?? null,
      linha: aSprint?.linhas.get("criterio_saida") ?? aSprint?.linhas.get("kind") ?? null,
    });
  }

  return sprints;
}

function montarBloqueios(trabalho: Trabalho, mapa: Map<string, Aceito[]>): BloqueioSituado[] {
  const arquivos = mapa.get(trabalho.pasta) ?? [];
  const a = arquivos.find((x) => x.kind === "bloqueios");
  if (!a) return [];
  const lista = (a.dados["bloqueios"] as Bloqueio[] | undefined) ?? [];
  return lista.map((b, i) => ({
    ...b,
    // um bloqueio está aberto quando resolvido_em é null — única definição disponível
    aberto: b.resolvido_em === null || b.resolvido_em === undefined,
    trabalho_id: trabalho.trabalho_id,
    arquivo: a.arquivo,
    linha: a.linhas.get(`bloqueios.${i}`) ?? null,
  }));
}

/**
 * O histórico é montado varrendo as pastas de `docs/relatorios/` (decisão D-18).
 * O INDICE.md não é fonte: uma pasta sem entrada no índice ficaria invisível,
 * e o índice é mantido à mão pela skill, podendo ficar defasado.
 */
function montarHistorico(aceitos: Aceito[]): EntradaHistorico[] {
  const porPastaRel = new Map<string, { tecnico?: Aceito; uso?: Aceito }>();
  for (const a of aceitos) {
    if (a.kind !== "relatorio_tecnico" && a.kind !== "relatorio_uso") continue;
    const pasta = dirname(a.arquivo);
    const atual = porPastaRel.get(pasta) ?? {};
    if (a.kind === "relatorio_tecnico") atual.tecnico = a;
    else atual.uso = a;
    porPastaRel.set(pasta, atual);
  }

  const entradas: EntradaHistorico[] = [];
  for (const [pasta, { tecnico, uso }] of porPastaRel) {
    const fonte = tecnico ?? uso;
    if (!fonte) continue;
    const d = fonte.dados;
    entradas.push({
      oc_id: (d["trabalho_id"] as string | undefined) ?? basename(pasta),
      titulo: (d["titulo"] as string | undefined) ?? "",
      tipo_ocorrencia: (d["tipo_ocorrencia"] as string | undefined) ?? "outro",
      fechado_em: (d["fechado_em"] as string | undefined) ?? "",
      modulo_afetado: (d["modulo_afetado"] as string[] | undefined) ?? [],
      pasta,
      tecnico: comCorpo(tecnico),
      uso: comCorpo(uso),
    });
  }

  // ordenado por data de fechamento, mais recente primeiro
  entradas.sort((a, b) => b.fechado_em.localeCompare(a.fechado_em));
  return entradas;
}

export function montarProjeto(raiz: string, agora: Date = new Date()): Projeto {
  const { trabalhos, rejeicoes, aceitos } = descobrirTrabalhos(raiz);
  const mapa = porPasta(aceitos);

  const montados: TrabalhoMontado[] = trabalhos.map((t) => {
    const sprints = montarSprints(t, mapa);
    const todas = sprints.flatMap((s) => s.tasks);
    return {
      ...t,
      sprints,
      sprints_declaradas: t.sprints,
      progresso: progressoDe(todas),
      bloqueios: montarBloqueios(t, mapa),
    };
  });

  return {
    raiz,
    trabalhos: montados,
    bloqueios: montados.flatMap((t) => t.bloqueios),
    historico: montarHistorico(aceitos),
    rejeicoes,
    lido_em: agora.toISOString(),
  };
}
