import React from "react";
import { Box } from "ink";
import type { EstadoExpx } from "../../fontes/estado-schema.js";
import type { TrabalhoNaFrota } from "../../visao/frota.js";
import { TrabalhoCard } from "./TrabalhoCard.js";

/**
 * A frota: um `<TrabalhoCard>` por trabalho aberto, na ordem já decidida por
 * `projetarVisao` (o corrente primeiro).
 */
export function Frota({
  frota,
  agora,
  estado,
  selecionado,
  expandido = false,
}: {
  frota: TrabalhoNaFrota[];
  agora: Date;
  estado: EstadoExpx | null;
  /** Índice do trabalho com destaque de navegação (Sprint C), ou `null`. */
  selecionado?: number | null;
  /** A árvore do trabalho SELECIONADO está expandida? */
  expandido?: boolean;
}): React.ReactElement {
  return (
    <Box flexDirection="column" gap={1}>
      {frota.map((t, i) => (
        <TrabalhoCard
          key={t.trabalho.trabalho_id}
          trabalho={t}
          agora={agora}
          estado={estado}
          selecionado={selecionado === i}
          expandido={expandido && selecionado === i}
        />
      ))}
    </Box>
  );
}
