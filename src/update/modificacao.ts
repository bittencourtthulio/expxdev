import { existsSync } from "node:fs";
import { join } from "node:path";
import { lerLock } from "../nucleo/lock.js";
import { compararComHashes } from "../nucleo/integridade.js";
import { ORIGEM_DO_PLUGIN } from "../plugin/manifestos.js";

/**
 * Impede que o `update` apague trabalho manual.
 *
 * Quem ajustou uma skill à mão não pode perder o ajuste por rodar um comando de
 * rotina. Quando o disco diverge do lock, o update NÃO sobrescreve: lista os
 * arquivos e devolve a decisão para quem está no comando.
 */

export type OpcaoDecisao = { id: string; rotulo: string };

/** As três saídas oferecidas quando há modificação local. */
export const OPCOES_DE_DECISAO: readonly OpcaoDecisao[] = [
  { id: "manter", rotulo: "manter o local e nao atualizar esta skill" },
  { id: "substituir", rotulo: "substituir pelo novo, descartando a alteracao local" },
  { id: "salvar-ao-lado", rotulo: "salvar o local ao lado antes de substituir" },
] as const;

export type Verificacao = {
  temModificacao: boolean;
  alterados: string[];
  removidos: string[];
  novos: string[];
  erro?: string;
};

/** A pasta onde a skill instalada vive dentro do projeto. */
export function pastaDaSkill(raizProjeto: string, nome: string): string {
  return join(raizProjeto, ".expx", "marketplace", ORIGEM_DO_PLUGIN, "skills", nome);
}

export function verificarModificacaoLocal(raizProjeto: string, nome: string): Verificacao {
  const vazio: Verificacao = { temModificacao: false, alterados: [], removidos: [], novos: [] };

  const l = lerLock(raizProjeto);
  if (!l.ok) return { ...vazio, erro: l.erro };

  const travada = l.lock.skills[nome];
  if (travada === undefined) return { ...vazio, erro: `${nome} nao esta no lock deste projeto` };

  const pasta = pastaDaSkill(raizProjeto, nome);
  if (!existsSync(pasta)) {
    return { ...vazio, temModificacao: true, erro: `${nome} esta no lock mas nao esta em disco` };
  }

  const d = compararComHashes(pasta, travada.arquivos);
  return {
    temModificacao: !d.limpo,
    alterados: d.alterados,
    removidos: d.removidos,
    novos: d.novos,
  };
}
