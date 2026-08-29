import { copyFileSync, existsSync } from "node:fs";

/**
 * Cópia datada antes de qualquer escrita em arquivo do usuário.
 *
 * O `settings.json` costuma conter configuração que a pessoa ajustou à mão e
 * que não está em lugar nenhum além dali. Um merge com defeito sem backup é
 * perda de trabalho irrecuperável.
 */

/** `AAAA-MM-DD` do relógio do sistema. */
export function hojeISO(agora: Date = new Date()): string {
  return agora.toISOString().slice(0, 10);
}

/**
 * Copia para `<arquivo>.backup-AAAA-MM-DD[-N]`. Devolve o caminho criado.
 * Se já existe backup do dia, cria um sufixo numérico em vez de sobrescrever —
 * o backup de ontem não pode ser destruído pelo erro de hoje.
 */
export function fazerBackup(arquivo: string, agora: Date = new Date()): string {
  const base = `${arquivo}.backup-${hojeISO(agora)}`;
  let destino = base;
  let n = 1;
  while (existsSync(destino)) {
    destino = `${base}-${String(n)}`;
    n += 1;
  }
  copyFileSync(arquivo, destino);
  return destino;
}
