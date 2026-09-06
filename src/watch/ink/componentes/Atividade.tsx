import React from "react";
import { Box, Text } from "ink";
import type { LinhaEvento } from "../../../parser/esquema/evento.js";
import { agrupar } from "../../visao/atividade.js";
import { rotuloEvento, sinalDe } from "../../logica/atividade.js";
import { cortar, preencher } from "../../logica/texto.js";
import { TextoPapel } from "./TextoPapel.js";

/**
 * A atividade: eventos agrupados, uma linha cada, cortados para caber.
 *
 * Cada evento é UMA linha, sempre. A versão com espaçador flexível quebrava
 * "task iniciada T-01.03" em duas e emendava o detalhe do evento seguinte,
 * transformando a seção mais consultada da tela num bloco ilegível.
 *
 * A hora fica em coluna fixa à direita porque é o que se compara entre
 * linhas — "isso foi agora ou faz meia hora?". O detalhe cede espaço antes
 * dela, e some inteiro em coluna estreita: o rótulo do evento e o alvo já
 * dizem o que aconteceu.
 */

/** Largura da coluna da hora: `HH:MM` mais um espaço de respiro. */
const COLUNA_HORA = 6;

export function Atividade({
  eventos,
  largura,
  limite = 6,
}: {
  eventos: LinhaEvento[];
  /** A largura ÚTIL da área que contém a lista. */
  largura?: number | undefined;
  limite?: number;
}): React.ReactElement | null {
  const grupos = agrupar(eventos, limite);
  if (grupos.length === 0) return null;

  // Abaixo disto o detalhe não cabe sem espremer o rótulo, que é o que
  // identifica o evento.
  const comDetalhe = largura === undefined || largura >= 58;

  return (
    <Box flexDirection="column" {...(largura !== undefined ? { width: largura } : {})}>
      {grupos.map((g) => {
        const s = sinalDe(g);
        const vezes = g.vezes > 1 ? ` ×${String(g.vezes)}` : "";
        const alvo = g.alvo !== "" ? ` ${g.alvo}` : "";
        const hora = g.ts.slice(11, 16);

        const rotulo = `${s.marca} ${rotuloEvento(g.evento)}${vezes}${alvo}`;
        const detalhe = g.detalhe !== "" ? g.detalhe : g.resultado;

        // A conta explícita: a linha inteira menos a hora é o que sobra para
        // rótulo e detalhe. O rótulo tem prioridade.
        const disponivel =
          largura === undefined ? undefined : Math.max(4, largura - COLUNA_HORA - 1);

        const larguraRotulo =
          disponivel === undefined
            ? undefined
            : comDetalhe
              ? // Com detalhe: o rótulo fica com o que precisa, até 60% da linha.
                Math.min([...rotulo].length, Math.floor(disponivel * 0.6))
              : disponivel;

        const rotuloFinal =
          larguraRotulo === undefined ? rotulo : preencher(rotulo, larguraRotulo);

        const larguraDetalhe =
          disponivel === undefined || larguraRotulo === undefined
            ? undefined
            : Math.max(0, disponivel - larguraRotulo - 1);

        const detalheFinal =
          !comDetalhe || larguraDetalhe === 0
            ? ""
            : larguraDetalhe === undefined
              ? detalhe
              : cortar(detalhe, larguraDetalhe);

        return (
          <Box key={`${g.evento} ${g.alvo}`}>
            <TextoPapel papel={s.papel}>{rotuloFinal}</TextoPapel>
            {detalheFinal !== "" ? (
              <>
                <Text> </Text>
                <TextoPapel papel={g.houveFalha ? "erro" : "apagado"}>{detalheFinal}</TextoPapel>
              </>
            ) : null}
            <Box flexGrow={1} />
            <Text dimColor>{hora}</Text>
          </Box>
        );
      })}
    </Box>
  );
}
