import type { LinhaEvento } from "../../parser/esquema/evento.js";
import type { Visao } from "../visao/projetar.js";
import type { Papel, Pintor } from "./cor.js";
import { cortar } from "./largura.js";

/**
 * Os eventos recentes, do rastro, em ordem inversa.
 *
 * O `agente` sai em toda linha porque é o que responde "quem fez o quê" —
 * e no contrato ele nunca é `null`: `principal` é o valor quando não há
 * subagente, e isso é informação, não ausência.
 */

/** Só a hora, do `ts` que é `AAAA-MM-DDTHH:MM:SSZ`. */
function hora(ts: string): string {
  return ts.slice(11, 16);
}

/** O papel de cor de cada evento, pelo que ele significa. */
function papelDe(e: LinhaEvento): Papel {
  if (e.evento === "regra_violada" || e.evento === "acao_bloqueada") return "erro";
  if (e.evento === "task_bloqueada") return "erro";
  if (e.evento === "task_concluida" || e.evento === "fase_concluida") return "sucesso";
  if (e.resultado !== "ok") return "atencao";
  return "apagado";
}

export function desenharEventos(v: Visao, colunas: number, pintar: Pintor): string[] {
  if (v.eventos.length === 0) return [];

  const linhas = [pintar(cortar("eventos recentes", colunas), "apagado")];

  for (const e of v.eventos) {
    const alvo = e.task ?? e.fase ?? "";
    const detalhe = e.detalhe !== "" ? ` · ${e.detalhe}` : "";
    const texto = `  ${hora(e.ts)} ${e.evento} ${alvo} [${e.agente}]${detalhe}`;
    linhas.push(pintar(cortar(texto, colunas), papelDe(e)));
  }

  return linhas;
}
