import { montarProjeto, type Projeto } from "../parser/projeto/montar.js";
import { verificarConformidade, type Violacao } from "../parser/conformidade/regras.js";

/** O estado que o painel serve: o projeto lido do disco mais as violações derivadas. */
export type EstadoPainel = Projeto & { violacoes: Violacao[] };

export type OpcoesEstado = {
  raiz: string;
  diasBloqueio: number;
};

/**
 * Relê o projeto inteiro do disco (decisão D-27). Releitura total, não
 * incremental: as regras de conformidade cruzam referências entre arquivos,
 * então uma visão parcial produziria violação falsa de referência quebrada.
 */
export function lerEstado(op: OpcoesEstado, agora: Date = new Date()): EstadoPainel {
  const projeto = montarProjeto(op.raiz, agora);
  const violacoes = verificarConformidade(projeto, {
    hoje: agora,
    diasBloqueio: op.diasBloqueio,
  });
  return { ...projeto, violacoes };
}
