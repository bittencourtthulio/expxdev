import { join } from "node:path";
import { LinhaEvento } from "../../parser/esquema/evento.js";
import { lerCauda } from "./cauda.js";

/**
 * Lê as últimas linhas do rastro de um trabalho, da mais recente para a mais
 * antiga.
 *
 * O que o repositório já tinha era `validarRastro`, que conta defeitos e não
 * devolve evento nenhum. O schema `LinhaEvento` e os enums, esses sim, são
 * reaproveitados inteiros: são a fonte única do vocabulário do contrato.
 *
 * Rotação: acima de 5 MB o arquivo corrente vira `<id>.1.jsonl` e um novo
 * começa (contrato `expx-eventos`), e "o painel lê os dois". O `.1` é o mais
 * ANTIGO — inverter isso mostraria o rastro fora de ordem logo após uma
 * rotação, que é justamente quando ninguém está olhando com atenção.
 */

/** Quantas linhas o watch exibe por padrão (decisão D-09). */
export const LINHAS_PADRAO = 10;

export function lerRastro(
  raizProjeto: string,
  trabalhoId: string,
  limite: number = LINHAS_PADRAO,
): LinhaEvento[] {
  const dir = join(raizProjeto, "docs", "eventos");

  // corrente primeiro, rotacionado depois: os dois já vêm em ordem
  // cronológica crescente dentro de cada arquivo.
  const cronologicas = [
    ...lerCauda(join(dir, `${trabalhoId}.1.jsonl`)),
    ...lerCauda(join(dir, `${trabalhoId}.jsonl`)),
  ];

  const validas: LinhaEvento[] = [];
  for (const bruta of cronologicas) {
    let obj: unknown;
    try {
      obj = JSON.parse(bruta);
    } catch {
      continue; // linha malformada não derruba o resto do rastro
    }
    const r = LinhaEvento.safeParse(obj);
    if (r.success) validas.push(r.data);
  }

  // as N mais recentes, já invertidas para exibição
  return validas.slice(-limite).reverse();
}
