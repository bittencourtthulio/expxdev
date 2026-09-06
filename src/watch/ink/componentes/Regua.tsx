import React from "react";
import { Box, Text } from "ink";
import { percentual } from "../../desenho/barra.js";
import type { TrabalhoNaFrota } from "../../visao/frota.js";
import { Barra } from "./Barra.js";

/**
 * A régua do projeto: uma linha dizendo onde o conjunto todo está.
 *
 * Equivalente Ink de `desenharRegua()` em `desenho/desenhar.ts`.
 */
export function Regua({ frota }: { frota: TrabalhoNaFrota[] }): React.ReactElement | null {
  if (frota.length === 0) return null;

  const feitas = frota.reduce((s, t) => s + t.concluidas, 0);
  const total = frota.reduce((s, t) => s + t.total, 0);
  const emCurso = frota.filter((t) => t.ativas.length > 0).length;
  const paralelas = frota.reduce((s, t) => s + t.ativas.length, 0);

  const n = frota.length;
  const quantos = n === 1 ? "1 trabalho" : `${String(n)} trabalhos`;
  const detalhe =
    paralelas > 1
      ? `${quantos} · ${String(emCurso)} em curso · ${String(paralelas)} tasks em paralelo`
      : `${quantos} · ${String(emCurso)} em curso`;

  return (
    <Box gap={1}>
      <Text> </Text>
      <Barra feitas={feitas} total={total} largura={20} />
      <Text>
        {String(feitas)}/{String(total)} tasks
      </Text>
      <Text dimColor>{percentual(feitas, total)}</Text>
      <Text dimColor>{detalhe}</Text>
    </Box>
  );
}
