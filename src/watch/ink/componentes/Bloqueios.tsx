import React from "react";
import { Box, Text } from "ink";
import type { BloqueioSituado } from "../../../parser/projeto/montar.js";
import { tempoAberto } from "../../logica/bloqueios.js";
import { TextoPapel } from "./TextoPapel.js";

/**
 * A faixa de bloqueios — a única coisa que rompe o layout de duas colunas.
 *
 * Bloqueio aberto exige decisão humana e não pode esperar a pessoa navegar
 * até o trabalho certo, então sobe para o topo, atravessa a tela inteira e
 * ganha borda vermelha. É o oposto do resto do painel, que é organizado; um
 * bloqueio é uma interrupção, e a tela precisa parecer interrompida.
 */
export function Bloqueios({
  bloqueios,
  agora,
  largura,
}: {
  bloqueios: BloqueioSituado[];
  agora: Date;
  largura?: number | undefined;
}): React.ReactElement | null {
  if (bloqueios.length === 0) return null;

  const n = bloqueios.length;
  const titulo = n === 1 ? "1 BLOQUEIO ABERTO" : `${String(n)} BLOQUEIOS ABERTOS`;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="red"
      paddingX={1}
      {...(largura !== undefined ? { width: largura } : {})}
    >
      <Text bold color="red">
        {titulo}
      </Text>
      {bloqueios.map((b) => (
        <TextoPapel papel="erro" key={b.id}>
          {b.id} · {b.task ?? "sem task"} · aberto ha {tempoAberto(b.aberto_em, agora)} ·{" "}
          {b.descricao}
        </TextoPapel>
      ))}
    </Box>
  );
}
