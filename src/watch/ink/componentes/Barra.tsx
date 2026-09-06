import React from "react";
import { barra, papelDaBarra } from "../../desenho/barra.js";
import { TextoPapel } from "./TextoPapel.js";

/**
 * A barra de progresso `[███░░░]`, como componente Ink.
 *
 * Reaproveita a mesma matemática de blocos de oitavo do motor ANSI
 * (`desenho/barra.ts`) — só a pintura muda de código SGR manual para a prop
 * `color` do `<Text>`.
 */
export function Barra({
  feitas,
  total,
  largura,
}: {
  feitas: number;
  total: number;
  largura: number;
}): React.ReactElement {
  return <TextoPapel papel={papelDaBarra(feitas, total)}>{barra(feitas, total, largura)}</TextoPapel>;
}
