import type { TrabalhoMontado } from "../../parser/projeto/montar.js";
import type { LinhaEvento } from "../../parser/esquema/evento.js";
import type { EstadoExpx } from "../fontes/estado-schema.js";
import { progressoDaTask, type ProgressoTask } from "./atividade.js";

/**
 * A frota: cada trabalho aberto com o que a tela precisa mostrar dele.
 *
 * O watch antigo seguia UM trabalho e resumia os outros a nada. Numa execução
 * de verdade há várias ocorrências andando ao mesmo tempo — e5 fechando, e3
 * executando, e2 planejando — e a tela precisava dizer, de relance, onde cada
 * uma está. É a diferença entre um log e um painel.
 */

export type TaskAtiva = {
  id: string;
  titulo: string;
  /** A fase que a contém, para dizer quem roda em paralelo com quem. */
  faseId: string;
  /** A fase declarou rodar em paralelo com estas outras. */
  paralelaCom: string[];
  /** A task pode rodar em paralelo com as irmãs da mesma fase. */
  paralelizavel: boolean;
  /** Tasks das quais esta depende. */
  dependeDe: string[];
  bloqueada: boolean;
  progresso: ProgressoTask;
};

export type TrabalhoNaFrota = {
  trabalho: TrabalhoMontado;
  /** Este é o trabalho que o `estado.json` aponta como corrente? */
  corrente: boolean;
  concluidas: number;
  total: number;
  /** O estágio do método: `e3`, `f6`… Do estado quando é o corrente. */
  estagio: string;
  /** As tasks em andamento AGORA. Mais de uma significa paralelismo real. */
  ativas: TaskAtiva[];
  bloqueiosAbertos: number;
  /** O `ts` do evento mais recente deste trabalho, ou `null`. */
  ultimoEventoTs: string | null;
  /** Os eventos deste trabalho, para a coluna de atividade. */
  eventos: LinhaEvento[];
};

/** As tasks em andamento de um trabalho, com sua fase e seu paralelismo. */
export function tasksAtivas(
  t: TrabalhoMontado,
  eventos: readonly LinhaEvento[],
): TaskAtiva[] {
  const ativas: TaskAtiva[] = [];

  for (const sprint of t.sprints) {
    for (const fase of sprint.fases) {
      for (const task of fase.tasks) {
        if (task.status !== "em_andamento" && task.status !== "bloqueada") continue;
        ativas.push({
          id: task.id,
          titulo: task.titulo,
          faseId: fase.id,
          paralelaCom: fase.paralela_com,
          paralelizavel: task.paralelizavel,
          dependeDe: task.depende_de,
          bloqueada: task.status === "bloqueada",
          progresso: progressoDaTask(eventos, task.id),
        });
      }
    }

    // Tasks cujo arquivo de fases não referencia continuam existindo: o vínculo
    // autoritativo é o campo `fase` da task.
    const nasFases = new Set(sprint.fases.flatMap((f) => f.tasks.map((x) => x.id)));
    for (const task of sprint.tasks) {
      if (nasFases.has(task.id)) continue;
      if (task.status !== "em_andamento" && task.status !== "bloqueada") continue;
      ativas.push({
        id: task.id,
        titulo: task.titulo,
        faseId: task.fase ?? "",
        paralelaCom: [],
        paralelizavel: task.paralelizavel,
        dependeDe: task.depende_de,
        bloqueada: task.status === "bloqueada",
        progresso: progressoDaTask(eventos, task.id),
      });
    }
  }

  return ativas;
}

/** Monta a linha de frota de um trabalho. */
export function montarNaFrota(
  t: TrabalhoMontado,
  eventos: readonly LinhaEvento[],
  estado: EstadoExpx | null,
  corrente: boolean,
): TrabalhoNaFrota {
  const tasks = t.sprints.flatMap((s) => s.tasks);

  // O par concluídas/total vem do estado.json SÓ para o trabalho corrente: o
  // estado descreve um trabalho, e aplicar os inteiros dele aos outros mostraria
  // o progresso de um no lugar do outro.
  const doEstado = corrente && estado !== null;
  const concluidas = doEstado
    ? estado.tasks_concluidas
    : tasks.filter((x) => x.status === "concluida").length;
  const total = doEstado ? estado.tasks_total : tasks.length;

  return {
    trabalho: t,
    corrente,
    concluidas,
    total,
    estagio: (doEstado ? estado.fase : null) ?? t.estagio,
    ativas: tasksAtivas(t, eventos),
    bloqueiosAbertos: t.bloqueios.filter((b) => b.aberto).length,
    ultimoEventoTs: eventos[0]?.ts ?? null,
    eventos: [...eventos],
  };
}
