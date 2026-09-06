import type { TrabalhoMontado } from "../../parser/projeto/montar.js";
import type { StatusTask } from "../../parser/esquema/enums.js";

/**
 * O balanço de um trabalho: quantas tasks em cada status.
 *
 * A tela mostrava `12/30` e a barra, o que responde "quanto falta" mas não
 * responde "o que está acontecendo". Três trabalhos podem estar em 12/30 e
 * significar coisas opostas: um com 2 tasks rodando, outro com 3 bloqueadas,
 * outro parado sem nada em andamento. O balanço é o que separa os três.
 */

export type Balanco = {
  concluidas: number;
  emAndamento: number;
  bloqueadas: number;
  pendentes: number;
  total: number;
};

/**
 * Conta as tasks do plano por status.
 *
 * Fonte é o PLANO, não o `estado.json`: o estado traz `tasks_concluidas` e
 * `tasks_total` prontos, mas não quebra o resto por status — e a quebra é
 * justamente o que esta função existe para dar. Onde os dois discordam, quem
 * manda no par concluídas/total continua sendo o estado (`montarNaFrota`); o
 * balanço descreve a forma do que sobrou.
 */
export function balancoDe(t: TrabalhoMontado): Balanco {
  const contagem: Record<StatusTask, number> = {
    concluida: 0,
    em_andamento: 0,
    bloqueada: 0,
    pendente: 0,
  };

  for (const sprint of t.sprints) {
    for (const task of sprint.tasks) contagem[task.status] += 1;
  }

  return {
    concluidas: contagem.concluida,
    emAndamento: contagem.em_andamento,
    bloqueadas: contagem.bloqueada,
    pendentes: contagem.pendente,
    total: contagem.concluida + contagem.em_andamento + contagem.bloqueada + contagem.pendente,
  };
}

/**
 * A próxima task a entrar: a primeira pendente na ordem do plano.
 *
 * "O que está em aberto" tem duas leituras, e a tela precisa das duas: o
 * NÚMERO de pendentes (o balanço) e QUAL vem a seguir. A segunda é a que
 * responde "e agora?" sem abrir a árvore inteira.
 */
export function proximaTask(t: TrabalhoMontado): { id: string; titulo: string } | null {
  for (const sprint of t.sprints) {
    for (const task of sprint.tasks) {
      if (task.status === "pendente") return { id: task.id, titulo: task.titulo };
    }
  }
  return null;
}
