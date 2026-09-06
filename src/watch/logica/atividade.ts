import type { Papel } from "../desenho/cor.js";
import type { GrupoAtividade } from "../visao/atividade.js";

/**
 * Lógica pura da seção de atividade — compartilhada pelos dois motores.
 */

/** Rótulo curto e legível de um evento — sem o vocabulário de máquina. */
export const ROTULO_EVENTO: Record<string, string> = {
  fase_iniciada: "fase iniciada",
  fase_concluida: "fase concluida",
  task_iniciada: "task iniciada",
  task_concluida: "task concluida",
  task_bloqueada: "task bloqueada",
  suite_executada: "suite",
  arquivo_alterado: "arquivos",
  regra_violada: "regra violada",
  acao_bloqueada: "acao bloqueada",
  agente_iniciado: "agente iniciado",
  agente_concluido: "agente concluido",
  veredito_emitido: "veredito",
  commit_criado: "commit",
  pr_aberto: "pr aberto",
};

/** O sinal de um grupo: o que a pessoa lê antes de ler a linha. */
export function sinalDe(g: GrupoAtividade): { marca: string; papel: Papel } {
  if (g.houveFalha) return { marca: "!", papel: "erro" };
  if (g.evento === "task_concluida" || g.evento === "fase_concluida") {
    return { marca: "✓", papel: "sucesso" };
  }
  if (g.evento === "suite_executada") return { marca: "✓", papel: "sucesso" };
  return { marca: "·", papel: "apagado" };
}

/** O rótulo legível de um evento, ou o próprio nome se não mapeado. */
export function rotuloEvento(evento: string): string {
  return ROTULO_EVENTO[evento] ?? evento;
}
