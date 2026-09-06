import React from "react";
import type { LinhaEvento } from "../../../parser/esquema/evento.js";
import { desde } from "../../logica/rodape.js";
import { TextoPapel } from "./TextoPapel.js";

/**
 * O rodapé: saúde da execução em uma linha.
 *
 * Equivalente Ink da função privada `desenharRodape()` em `desenho/desenhar.ts`.
 */
export function Rodape({
  eventos,
  violacoesAviso,
  degradado,
  agora,
}: {
  eventos: LinhaEvento[];
  violacoesAviso: number;
  degradado: boolean;
  agora: Date;
}): React.ReactElement | null {
  const partes: string[] = [];

  const ultimo = eventos[0];
  if (ultimo !== undefined) {
    partes.push(`ultimo evento ${desde(new Date(ultimo.ts), agora)}`);
  }

  if (violacoesAviso > 0) {
    partes.push(violacoesAviso === 1 ? "1 violacao em aviso" : `${String(violacoesAviso)} violacoes em aviso`);
  }

  if (degradado) partes.push("sem estado.json: lendo o plano");

  if (partes.length === 0) return null;

  return <TextoPapel papel={violacoesAviso > 0 ? "atencao" : "apagado"}>{partes.join(" · ")}</TextoPapel>;
}
