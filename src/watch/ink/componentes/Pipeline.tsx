import React from "react";
import { Box, Text } from "ink";
import type { ExpxTool } from "../../../parser/esquema/enums.js";
import { pipelineDe } from "../../logica/pipeline.js";

/**
 * A trilha do framework desenhada como esteira: `✓─✓─◆ execucao─○─○`.
 *
 * Cada passo é um nó ligado ao seguinte, e a ligação é o que faz ler como
 * pipeline em vez de lista de palavras. O passo atual usa um símbolo
 * diferente (não só cor diferente) porque cor sozinha não sobrevive a
 * `NO_COLOR`, a terminal monocromático nem a quem não distingue verde de
 * cinza.
 *
 * Só o passo ATUAL é rotulado por padrão. Rotular todos custava 60 colunas
 * na sprintx (seis nomes por extenso) e estourava a caixa numa janela de
 * 120 — e o nome dos passos vencidos é justamente a informação de que quem
 * olha menos precisa: eles já passaram.
 */

const NO = { vencido: "✓", atual: "◆", adiante: "○" } as const;

export function Pipeline({
  ferramenta,
  estagio,
  rotular = "atual",
}: {
  ferramenta: ExpxTool;
  estagio: string;
  /** `atual`: só o passo corrente ganha nome. `nenhum`: só os nós. */
  rotular?: "atual" | "nenhum";
}): React.ReactElement {
  const passos = pipelineDe(ferramenta, estagio);

  return (
    <Box>
      {passos.map((p, i) => (
        <Box key={p.codigo}>
          {i > 0 ? <Text color={p.situacao === "adiante" ? "gray" : "green"}>─</Text> : null}
          <Text
            color={
              p.situacao === "atual" ? "cyanBright" : p.situacao === "vencido" ? "green" : "gray"
            }
            bold={p.situacao === "atual"}
          >
            {NO[p.situacao]}
            {rotular === "atual" && p.situacao === "atual" ? ` ${p.nome}` : ""}
          </Text>
        </Box>
      ))}
    </Box>
  );
}
